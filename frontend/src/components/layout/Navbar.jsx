import React, { useState } from 'react';
import {
  Menu,
  Plus,
  AlertTriangle,
  Sparkles,
  Receipt,
  Bell,
  Mic,
  Cpu,
  Bot,
  Printer,
  SlidersHorizontal,
  Zap,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PluginsModal } from '../plugins/PluginsModal';

export const Navbar = ({ onOpenSidebar, onOpenVoiceAssistant }) => {
  const { activePage, setActivePage, lowStockProducts, settings, appMode, setAppMode, plugins } = useApp();
  const [isPluginsOpen, setIsPluginsOpen] = useState(false);

  const pageTitles = {
    dashboard: 'Shop Overview & Metrics',
    products: 'Products & Shade Catalog',
    inventory: 'Inventory Stock Ledger',
    sales: 'Paper Bill POS & Sales',
    customers: 'Customer Accounts & Khata',
    reports: 'Sales Summary & Low Stock Reports',
    settings: 'Shop Profile & Preferences'
  };

  const activePluginsCount = plugins.filter((p) => p.enabled).length;

  return (
    <>
      <header className={`top-navbar no-print ${appMode === 'ai' ? 'ai-mode-header' : 'real-mode-header'}`}>
        <div className="navbar-left">
          <button
            className="mobile-menu-toggle"
            onClick={onOpenSidebar}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <div className="page-title-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2>{pageTitles[activePage] || 'Dashboard'}</h2>
              <span className={`status-pill ${appMode === 'ai' ? 'ai-pill' : 'real-pill'}`}>
                {appMode === 'ai' ? (
                  <>
                    <span className="pulsing-dot ai" />
                    <span>AI Copilot Active</span>
                  </>
                ) : (
                  <>
                    <span className="pulsing-dot real" />
                    <span>Physical POS Terminal</span>
                  </>
                )}
              </span>
            </div>
            <div className="page-breadcrumb">
              <span>{settings.shopName}</span>
              <span>•</span>
              <span style={{ textTransform: 'capitalize' }}>{activePage}</span>
            </div>
          </div>
        </div>

        <div className="navbar-right">
          {/* Mode Switcher Pill: AI Mode ⇄ Real Mode */}
          <div className="mode-switcher-container">
            <button
              type="button"
              className={`mode-toggle-btn ${appMode === 'ai' ? 'active-ai' : ''}`}
              onClick={() => setAppMode('ai')}
              title="Switch to AI Copilot Mode (Autonomous Demand & Voice)"
            >
              <Bot size={14} />
              <span>AI Mode</span>
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${appMode === 'real' ? 'active-real' : ''}`}
              onClick={() => setAppMode('real')}
              title="Switch to Real Mode (Physical POS & Hardware)"
            >
              <Printer size={14} />
              <span>Real Mode</span>
            </button>
          </div>

          {/* Plugins Center Button */}
          <button
            type="button"
            className="plugins-trigger-btn"
            onClick={() => setIsPluginsOpen(true)}
            title="Configure AI & Real-World Shop Plugins"
          >
            <SlidersHorizontal size={14} />
            <span>Plugins</span>
            <span className="plugins-count-badge">{activePluginsCount}</span>
          </button>

          {/* Telugu Voice Assistant Trigger */}
          <button
            type="button"
            className="voice-header-chip"
            onClick={onOpenVoiceAssistant}
            title="సారథి తెలుగు వాయిస్ అసిస్టెంట్ ఓపెన్ చేయండి (Open Telugu Voice Assistant)"
          >
            <Mic size={14} color="var(--gold-primary)" />
            <span>తెలుగు వాయిస్</span>
          </button>

          {lowStockProducts.length > 0 && (
            <button
              className="demo-chip alert-chip"
              onClick={() => setActivePage('inventory')}
              title="Click to view low stock items"
            >
              <AlertTriangle size={14} />
              <span>{lowStockProducts.length} Reorder Alerts</span>
            </button>
          )}

          {activePage !== 'sales' && (
            <button
              className="quick-action-btn"
              onClick={() => setActivePage('sales')}
              title="Create a new paper bill"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>New Paper Bill</span>
            </button>
          )}
        </div>
      </header>

      {/* Plugins Modal */}
      <PluginsModal
        isOpen={isPluginsOpen}
        onClose={() => setIsPluginsOpen(false)}
      />
    </>
  );
};
