import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  Filter,
  ShieldAlert,
  Info,
  X,
  Sparkles,
  PhoneCall,
  Calendar,
  AlertTriangle,
  Syringe
} from 'lucide-react';
import { api } from '../../api/client';
import { Outbreak, HealthReport } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';

export const DiseaseSurveillanceMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<Outbreak | null>(null);
  const [diseaseFilter, setDiseaseFilter] = useState<string>('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { t, language } = useLanguage();

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [outbreaksRes, reportsRes] = await Promise.all([
          api.outbreaks.list(),
          api.reports.list()
        ]);

        if (outbreaksRes.success) setOutbreaks(outbreaksRes.data);
        if (reportsRes.success) setReports(reportsRes.data);
      } catch (e) {
        console.warn('Map data load error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered on Maharashtra coordinates (Pune / Ahmednagar region)
      const map = L.map(mapContainerRef.current, {
        center: [18.8247, 74.3412],
        zoom: 8,
        zoomControl: true,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | PashuRakshak GIS Engine'
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Map Markers & Containment Polygons
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const group = layerGroupRef.current;
    group.clearLayers();

    // 1. Render Outbreak Containment Buffer Zones (Circles with radius in meters)
    const filteredOutbreaks = diseaseFilter
      ? outbreaks.filter(o => o.disease.includes(diseaseFilter))
      : outbreaks;

    filteredOutbreaks.forEach((outbreak) => {
      const color =
        outbreak.risk_level === 'CRITICAL'
          ? '#dc2626'
          : outbreak.risk_level === 'HIGH'
          ? '#ea580c'
          : '#d97706';

      // Containment Buffer Circle
      const circle = L.circle([outbreak.center_lat, outbreak.center_lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.18,
        radius: outbreak.radius_km * 1000,
        weight: 2,
        dashArray: '6, 6'
      });

      circle.bindTooltip(`
        <div style="font-family: Inter, sans-serif; font-size: 12px; padding: 2px;">
          <strong style="color: ${color};">🚨 ${outbreak.disease}</strong><br/>
          <span>Epicenter: ${outbreak.epicenter_village}, ${outbreak.taluka}</span><br/>
          <span>Radius: ${outbreak.radius_km} km | Active Cases: <strong>${outbreak.active_cases_count}</strong></span>
        </div>
      `);

      circle.on('click', () => {
        setSelectedCluster(outbreak);
      });

      group.addLayer(circle);

      // Custom Center Marker
      const centerIcon = L.divIcon({
        className: 'custom-outbreak-pin',
        html: `
          <div style="
            background: ${color};
            color: white;
            padding: 6px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
          ">
            ☣️
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([outbreak.center_lat, outbreak.center_lng], { icon: centerIcon });
      marker.on('click', () => {
        setSelectedCluster(outbreak);
      });
      group.addLayer(marker);
    });

    // 2. Render Individual Case Markers
    const filteredReports = reports.filter(r => {
      if (diseaseFilter && !r.primary_suspected_disease?.includes(diseaseFilter)) return false;
      if (speciesFilter && r.species !== speciesFilter) return false;
      return true;
    });

    filteredReports.forEach((rep) => {
      const isCritical = rep.severity === 'CRITICAL' || rep.severity === 'HIGH';
      const pinColor = isCritical ? '#e11d48' : '#2563eb';

      const caseIcon = L.divIcon({
        className: 'custom-case-pin',
        html: `
          <div style="
            background: ${pinColor};
            color: white;
            border-radius: 8px;
            padding: 4px 6px;
            font-size: 10px;
            font-weight: 800;
            border: 1.5px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            display: inline-flex;
            align-items: center;
            gap: 2px;
            cursor: pointer;
          ">
            <span>🐄</span>
            <span>${rep.ear_tag_id?.substring(7) || 'CASE'}</span>
          </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 12]
      });

      const caseMarker = L.marker([rep.latitude, rep.longitude], { icon: caseIcon });
      caseMarker.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 12px; width: 220px;">
          <h4 style="margin: 0; font-weight: bold; color: #0b3f6f;">${rep.primary_suspected_disease || 'Health Case'}</h4>
          <p style="margin: 3px 0 6px 0; color: #64748b; font-size: 11px;">Tag: ${rep.ear_tag_id} (${rep.species})</p>
          <div style="font-size: 11px; margin-bottom: 4px;"><strong>Location:</strong> ${rep.village}, ${rep.taluka}</div>
          <div style="font-size: 11px; margin-bottom: 4px;"><strong>Severity:</strong> ${rep.severity}</div>
          <div style="font-size: 11px;"><strong>Status:</strong> ${rep.status}</div>
        </div>
      `);
      group.addLayer(caseMarker);
    });
  }, [outbreaks, reports, diseaseFilter, speciesFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-gov-900 via-gov-800 to-gov-950 text-white shadow-xl border border-gov-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/20 text-saffron-300 text-xs font-bold border border-saffron-500/30 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>GIS Spatiotemporal Surveillance Layer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Maharashtra Disease Surveillance & Hotspot Map
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time geospatial clustering, quarantine containment radii, and animal disease density mapping across 36 districts.
          </p>
        </div>

        {/* Legend */}
        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-xs space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Surveillance Risk Zones</div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Critical Containment</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High Risk</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Individual Case</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={diseaseFilter}
          onChange={(e) => setDiseaseFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-gov-500 outline-none"
        >
          <option value="">All Monitored Diseases (सर्व रोग)</option>
          <option value="Lumpy Skin Disease">Lumpy Skin Disease (LSD)</option>
          <option value="Foot and Mouth Disease">Foot and Mouth Disease (FMD)</option>
          <option value="Hemorrhagic Septicemia">Hemorrhagic Septicemia (HS)</option>
          <option value="Peste des Petits Ruminants">PPR (Goat/Sheep)</option>
        </select>

        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-gov-500 outline-none"
        >
          <option value="">All Species</option>
          <option value="Cattle">Cattle</option>
          <option value="Buffalo">Buffalo</option>
          <option value="Goat">Goat</option>
          <option value="Sheep">Sheep</option>
          <option value="Poultry">Poultry</option>
        </select>
      </div>

      {/* Map View & Drawer Layout */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900 h-[600px]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Selected Cluster Info Drawer */}
        {selectedCluster && (
          <div className="absolute top-4 right-4 z-20 w-80 sm:w-96 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-in fade-in slide-in-from-right-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {selectedCluster.disease}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    Cluster Code: {selectedCluster.outbreak_code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCluster(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Epicenter</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {selectedCluster.epicenter_village}, {selectedCluster.taluka}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Active Cases</div>
                <div className="font-bold text-rose-600 text-sm">{selectedCluster.active_cases_count} cases</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Containment Radius</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{selectedCluster.radius_km} km buffer</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Affected Villages</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{selectedCluster.affected_villages_count} villages</div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs">
              <div className="font-bold text-emerald-900 dark:text-emerald-300">
                Assigned Rapid Response Unit:
              </div>
              <div className="text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                {selectedCluster.assigned_rapid_response_team}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Detected on {selectedCluster.detected_date}</span>
              <span className="font-bold text-rose-600">Active Containment Zone</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
