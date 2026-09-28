import {
  User,
  Livestock,
  HealthReport,
  RiskAssessment,
  LabSample,
  Vaccination,
  VaccinationCampaign,
  Outbreak,
  Alert,
  AuditLog,
  SyncConflict
} from '../types';
import { getCachedAnimals, getCachedReports } from '../utils/indexedDb';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('pashu_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('pashu_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('pashu_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errJson = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errJson.message || `API Error: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (err: any) {
    // If offline or network error on GET requests, fallback to IndexedDB cache where available
    if (options.method === 'GET' || !options.method) {
      if (endpoint.startsWith('/animals')) {
        const cached = await getCachedAnimals();
        if (cached && cached.length > 0) {
          return { success: true, count: cached.length, data: cached, isOfflineCache: true } as any;
        }
      } else if (endpoint.startsWith('/reports')) {
        const cached = await getCachedReports();
        if (cached && cached.length > 0) {
          return { success: true, count: cached.length, data: cached, isOfflineCache: true } as any;
        }
      }
    }
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    login: (identifier: string, password: string) =>
      request<{ success: boolean; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      }),
    demoSwitch: (role: string) =>
      request<{ success: boolean; token: string; user: User }>(`/auth/demo/${role}`, {
        method: 'POST'
      }),
    getMe: () => request<{ success: boolean; user: User }>('/auth/me')
  },

  // Livestock
  animals: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; count: number; data: Livestock[] }>(`/animals${query}`);
    },
    get: (id: string) => request<{ success: boolean; data: Livestock & { reports: HealthReport[]; vaccinations: Vaccination[]; labSamples: LabSample[] } }>(`/animals/${id}`),
    create: (data: Partial<Livestock>) =>
      request<{ success: boolean; message: string; data: { id: string; ear_tag_id: string } }>('/animals', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id: string, data: Partial<Livestock>) =>
      request<{ success: boolean; message: string }>(`/animals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  },

  // Health Reports
  reports: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; count: number; data: HealthReport[] }>(`/reports${query}`);
    },
    get: (id: string) => request<{ success: boolean; data: HealthReport }>(`/reports/${id}`),
    create: (data: Partial<HealthReport>) =>
      request<{ success: boolean; message: string; data: { report_id: string; animal_id: string; ear_tag_id: string; riskAssessment: RiskAssessment } }>('/reports', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateAssessment: (id: string, data: { status: string; vet_notes?: string; diagnosis?: string; treatment_plan?: string; quarantine_ordered?: number }) =>
      request<{ success: boolean; message: string }>(`/reports/${id}/assessment`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    assign: (id: string, vet_id: string) =>
      request<{ success: boolean; message: string }>(`/reports/${id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ vet_id })
      })
  },

  // AI Triage
  ai: {
    triage: (data: { species: string; symptoms: string[]; severity: string; temperature_f?: number; vaccination_status?: string; latitude?: number; longitude?: number; district?: string; taluka?: string }) =>
      request<{ success: boolean; disclaimer: string; data: RiskAssessment }>('/ai/triage', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getRules: () => request<{ success: boolean; count: number; data: any[] }>('/ai/rules')
  },

  // Outbreaks & Containment
  outbreaks: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; count: number; data: Outbreak[] }>(`/outbreaks${query}`);
    },
    get: (id: string) => request<{ success: boolean; data: Outbreak }>(`/outbreaks/${id}`),
    create: (data: Partial<Outbreak>) =>
      request<{ success: boolean; message: string; data: { id: string; outbreak_code: string } }>('/outbreaks', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // Laboratory Diagnostics
  lab: {
    listSamples: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; count: number; data: LabSample[] }>(`/lab/samples${query}`);
    },
    getSample: (id: string) => request<{ success: boolean; data: LabSample }>(`/lab/samples/${id}`),
    createSample: (data: Partial<LabSample>) =>
      request<{ success: boolean; message: string; data: { id: string; sample_code: string } }>('/lab/samples', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateStatus: (id: string, status: string, test_notes?: string) =>
      request<{ success: boolean; message: string }>(`/lab/samples/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, test_notes })
      }),
    recordResult: (id: string, data: { result: string; confirmed_disease?: string; test_notes?: string }) =>
      request<{ success: boolean; message: string }>(`/lab/samples/${id}/result`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // Vaccinations
  vaccinations: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; count: number; data: Vaccination[] }>(`/vaccinations${query}`);
    },
    log: (data: Partial<Vaccination>) =>
      request<{ success: boolean; message: string; data: { id: string; next_due_date: string } }>('/vaccinations', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    campaigns: () => request<{ success: boolean; count: number; data: VaccinationCampaign[] }>('/vaccinations/campaigns'),
    createCampaign: (data: Partial<VaccinationCampaign>) =>
      request<{ success: boolean; message: string; data: { id: string } }>('/vaccinations/campaigns', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // Alerts & Notifications
  alerts: {
    list: (isRead?: boolean) => {
      const query = isRead !== undefined ? `?is_read=${isRead}` : '';
      return request<{ success: boolean; count: number; data: Alert[] }>(`/alerts${query}`);
    },
    markRead: (id: string) => request<{ success: boolean; message: string }>(`/alerts/${id}/read`, { method: 'PATCH' }),
    broadcast: (data: { title: string; message: string; severity?: string; target_role?: string; target_district?: string; target_taluka?: string }) =>
      request<{ success: boolean; message: string; data: { id: string } }>('/alerts/broadcast', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // IVR Telephony Simulator
  ivr: {
    simulate: (data: { caller_phone?: string; language?: string; menu_selection?: number; ear_tag_or_symptoms?: string }) =>
      request<{
        success: boolean;
        step: string;
        tollFreeNumber: string;
        promptAudioText: string;
        availableOptions?: Array<{ key: number; label: string }>;
        actionTaken?: string;
        smsDispatched?: string;
      }>('/ivr/simulate', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // Weather Intelligence
  weather: {
    getDistrictWeather: (district: string) =>
      request<{ success: boolean; district: string; data: any }>(`/weather/${district}`)
  },

  // Offline Sync
  sync: {
    syncBatch: (queue: any[]) =>
      request<{ success: boolean; message: string; results: { synced: any[]; conflicts: any[] } }>('/sync', {
        method: 'POST',
        body: JSON.stringify({ queue })
      }),
    getConflicts: () => request<{ success: boolean; count: number; data: SyncConflict[] }>('/sync/conflicts'),
    resolveConflict: (id: string, strategy: 'SERVER_WINS' | 'LOCAL_WINS' | 'MERGED', resolved_payload?: any) =>
      request<{ success: boolean; message: string }>(`/sync/conflicts/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolution_strategy: strategy, resolved_payload })
      })
  },

  // Audit Logs
  audit: {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ success: boolean; count: number; data: AuditLog[] }>(`/audit-logs${query}`);
    }
  },

  // Dashboard Overview Analytics
  dashboard: {
    getOverview: (district?: string) => {
      const query = district ? `?district=${district}` : '';
      return request<{
        success: boolean;
        data: {
          kpis: any;
          diseaseDistribution: any[];
          speciesDistribution: any[];
          districtWiseCases: any[];
          temporalCases: any[];
          vaccinationCoverage: any;
        };
      }>(`/dashboard/overview${query}`);
    }
  }
};
