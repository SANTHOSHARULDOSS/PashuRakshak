import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { useOfflineSync } from './context/OfflineSyncContext';

import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { NotificationCenter } from './components/common/NotificationCenter';
import { VoiceAssistantModal } from './components/common/VoiceAssistantModal';
import { ConflictResolutionModal } from './components/common/ConflictResolutionModal';
import { DemoScenarioRunner } from './components/common/DemoScenarioRunner';
import { VaccinationsView } from './components/common/VaccinationsView';

import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { MyAnimalsList } from './components/farmer/MyAnimalsList';
import { AnimalRegistrationModal } from './components/farmer/AnimalRegistrationModal';
import { HealthReportForm } from './components/farmer/HealthReportForm';
import { FarmerAdvisories } from './components/farmer/FarmerAdvisories';
import { NearbyVetSupport } from './components/farmer/NearbyVetSupport';

import { VetDashboard } from './components/vet/VetDashboard';
import { CaseDetailPage } from './components/vet/CaseDetailPage';

import { LabDashboard } from './components/lab/LabDashboard';

import { StateAdminDashboard } from './components/admin/StateAdminDashboard';
import { DistrictAdminDashboard } from './components/admin/DistrictAdminDashboard';
import { OutbreakManager } from './components/admin/OutbreakManager';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { ReportGeneratorModal } from './components/admin/ReportGeneratorModal';

import { DiseaseSurveillanceMap } from './components/gis/DiseaseSurveillanceMap';
import { IVRSimulatorModal } from './components/ivr/IVRSimulatorModal';

export const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { unresolvedConflicts } = useOfflineSync();

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isIVRModalOpen, setIsIVRModalOpen] = useState<boolean>(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);
  const [isReportGenModalOpen, setIsReportGenModalOpen] = useState<boolean>(false);
  const [preselectedAnimalId, setPreselectedAnimalId] = useState<string | undefined>();

  // Register PWA Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('Service worker registration failed:', err);
      });
    }
  }, []);

  const handleNavigate = (view: string, caseId?: string) => {
    if (view === 'caseDetail' && caseId) {
      setSelectedCaseId(caseId);
      setCurrentView('caseDetail');
    } else if (view === 'reportsExport') {
      setIsReportGenModalOpen(true);
    } else if (view === 'reportIssue') {
      setIsReportModalOpen(true);
    } else {
      setCurrentView(view);
      setSelectedCaseId(null);
    }
  };

  const renderCurrentView = () => {
    // If caseDetail view is requested
    if (currentView === 'caseDetail' && selectedCaseId) {
      return (
        <CaseDetailPage
          caseId={selectedCaseId}
          onBack={() => {
            setCurrentView(user?.role === 'FARMER' ? 'dashboard' : 'cases');
            setSelectedCaseId(null);
          }}
        />
      );
    }

    switch (currentView) {
      case 'myAnimals':
        return (
          <MyAnimalsList
            onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
            onOpenReportModal={(animalId) => {
              setPreselectedAnimalId(animalId);
              setIsReportModalOpen(true);
            }}
          />
        );

      case 'cases':
        return (
          <VetDashboard
            onSelectCase={(id) => {
              setSelectedCaseId(id);
              setCurrentView('caseDetail');
            }}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        );

      case 'gisMap':
        return <DiseaseSurveillanceMap />;

      case 'labSamples':
        return <LabDashboard />;

      case 'vaccinations':
        return <VaccinationsView />;

      case 'outbreaks':
        return <OutbreakManager />;

      case 'advisories':
        return <FarmerAdvisories />;

      case 'vetSupport':
        return <NearbyVetSupport />;

      case 'auditLogs':
        return <AuditLogsView />;

      case 'dashboard':
      default:
        // Role-based Main Dashboard
        switch (user?.role) {
          case 'FARMER':
            return (
              <FarmerDashboard
                onNavigate={handleNavigate}
                onOpenReportModal={() => {
                  setPreselectedAnimalId(undefined);
                  setIsReportModalOpen(true);
                }}
                onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
              />
            );

          case 'FIELD_VET':
          case 'PARA_VET':
            return (
              <VetDashboard
                onSelectCase={(id) => {
                  setSelectedCaseId(id);
                  setCurrentView('caseDetail');
                }}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            );

          case 'LAB_TECH':
            return <LabDashboard />;

          case 'DISTRICT_ADMIN':
            return (
              <DistrictAdminDashboard
                onSelectCase={(id) => {
                  setSelectedCaseId(id);
                  setCurrentView('caseDetail');
                }}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onNavigateToOutbreaks={() => setCurrentView('outbreaks')}
              />
            );

          case 'STATE_ADMIN':
          default:
            return <StateAdminDashboard />;
        }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-4">
        <img src="/logo.svg" alt="PashuRakshak Logo" className="w-16 h-16 animate-pulse" />
        <div className="font-extrabold text-lg text-saffron-400">PashuRakshak</div>
        <p className="text-xs text-slate-400">Initializing Livestock Intelligence Platform...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-saffron-500 selection:text-white">
      {/* Navbar Header */}
      <Navbar
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
        onOpenIVR={() => setIsIVRModalOpen(true)}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          onOpenDemoTour={() => setIsDemoTourOpen(true)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 md:pl-64 p-4 sm:p-6 lg:p-8 min-w-0">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Modals */}
      {isReportModalOpen && (
        <HealthReportForm
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          preselectedAnimalId={preselectedAnimalId}
          onSuccess={(newReportId) => {
            setIsReportModalOpen(false);
            if (newReportId) {
              setSelectedCaseId(newReportId);
              setCurrentView('caseDetail');
            } else {
              setCurrentView('dashboard');
            }
          }}
        />
      )}

      {isRegisterModalOpen && (
        <AnimalRegistrationModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={() => {
            setIsRegisterModalOpen(false);
            setCurrentView('myAnimals');
          }}
        />
      )}

      {isVoiceModalOpen && (
        <VoiceAssistantModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onAutoFillReport={() => {
            setIsVoiceModalOpen(false);
            setIsReportModalOpen(true);
          }}
        />
      )}

      {isIVRModalOpen && (
        <IVRSimulatorModal
          isOpen={isIVRModalOpen}
          onClose={() => setIsIVRModalOpen(false)}
        />
      )}

      {isDemoTourOpen && (
        <DemoScenarioRunner
          isOpen={isDemoTourOpen}
          onClose={() => setIsDemoTourOpen(false)}
          onNavigateTo={handleNavigate}
        />
      )}

      {isNotificationsOpen && (
        <NotificationCenter
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onSelectCase={(caseId) => {
            setSelectedCaseId(caseId);
            setCurrentView('caseDetail');
          }}
        />
      )}

      {isReportGenModalOpen && (
        <ReportGeneratorModal
          isOpen={isReportGenModalOpen}
          onClose={() => setIsReportGenModalOpen(false)}
        />
      )}

      {/* Sync Conflict Resolution Modal */}
      {unresolvedConflicts.length > 0 && <ConflictResolutionModal />}
    </div>
  );
};
