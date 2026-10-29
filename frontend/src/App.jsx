import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DemoBanner } from './components/layout/DemoBanner';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { ProductsPage } from './components/products/ProductsPage';
import { InventoryPage } from './components/inventory/InventoryPage';
import { SalesPage } from './components/sales/SalesPage';
import { CustomersPage } from './components/customers/CustomersPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { TeluguVoiceAssistant } from './components/assistant/TeluguVoiceAssistant';
import { CheckCircle2, AlertTriangle, Info, Mic } from 'lucide-react';
import './index.css';

const MainLayout = () => {
  const { activePage, notification, isVoiceAssistantOpen, openVoiceAssistant, closeVoiceAssistant } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'products':
        return <ProductsPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'sales':
        return <SalesPage />;
      case 'customers':
        return <CustomersPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="app-main">
        {/* Top Navbar */}
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenVoiceAssistant={openVoiceAssistant}
        />

        {/* Demo Disclaimer Banner */}
        <DemoBanner />

        {/* Dynamic Page View */}
        {renderActivePage()}

        {/* Floating Telugu Voice Assistant Trigger (Hidden on print) */}
        <button
          type="button"
          className="floating-voice-widget no-print"
          onClick={openVoiceAssistant}
          title="సారథి తెలుగు వాయిస్ అసిస్టెంట్ (SAARTHI Telugu Voice Assistant)"
        >
          <div className="voice-btn-mic">
            <Mic size={18} />
          </div>
          <div className="voice-btn-text">
            <span className="voice-title">తెలుగు అసిస్టెంట్</span>
            <span className="voice-sub">మాట్లాడండి • Voice AI</span>
          </div>
        </button>

        {/* Telugu Voice Assistant Modal */}
        <TeluguVoiceAssistant
          isOpen={isVoiceAssistantOpen}
          onClose={closeVoiceAssistant}
        />

        {/* Toast Notification */}
        {notification && (
          <div className="toast-container no-print">
            <div className={`toast ${notification.type}`}>
              {notification.type === 'warning' ? (
                <AlertTriangle size={18} color="var(--amber-400)" />
              ) : notification.type === 'info' ? (
                <Info size={18} color="var(--navy-400)" />
              ) : (
                <CheckCircle2 size={18} color="var(--emerald-400)" />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
