import React from 'react';
import { Menu, Plus, AlertTriangle, Sparkles, Receipt, Bell, Mic } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar = ({ onOpenSidebar, onOpenVoiceAssistant }) => {
  const { activePage, setActivePage, lowStockProducts, settings } = useApp();

  const pageTitles = {
    dashboard: 'Shop Overview & Metrics',
    products: 'Products & Shade Catalog',
    inventory: 'Inventory Stock Ledger',
    sales: 'Paper Bill POS & Sales',
    customers: 'Customer Accounts & Khata',
    reports: 'Sales Summary & Low Stock Reports',
    settings: 'Shop Profile & Preferences'
  };

  return (
    <header className="top-navbar no-print">
      <div className="navbar-left">
        <button
          className="mobile-menu-toggle"
          onClick={onOpenSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <div className="page-title-box">
          <h2>{pageTitles[activePage] || 'Dashboard'}</h2>
          <div className="page-breadcrumb">
            <span>{settings.shopName}</span>
            <span>•</span>
            <span style={{ textTransform: 'capitalize' }}>{activePage}</span>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        {/* Telugu Voice Assistant Trigger */}
        <button
          type="button"
          className="demo-chip"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,0,0.14), rgba(255,107,0,0.05))',
            borderColor: 'rgba(255,107,0,0.4)',
            color: 'var(--orange-600)',
            cursor: 'pointer',
            fontWeight: 700
          }}
          onClick={onOpenVoiceAssistant}
          title="సారథి తెలుగు వాయిస్ అసిస్టెంట్ ఓపెన్ చేయండి (Open Telugu Voice Assistant)"
        >
          <Mic size={14} color="var(--orange-500)" />
          <span>తెలుగు వాయిస్</span>
        </button>

        {lowStockProducts.length > 0 && (
          <button
            className="demo-chip"
            style={{
              backgroundColor: 'var(--rose-50)',
              borderColor: 'var(--rose-100)',
              color: 'var(--rose-600)',
              cursor: 'pointer'
            }}
            onClick={() => setActivePage('inventory')}
            title="Click to view low stock items"
          >
            <AlertTriangle size={14} />
            <span>{lowStockProducts.length} Reorder Alerts</span>
          </button>
        )}

        <div className="demo-chip" title="Simulated environment for demonstration">
          <Sparkles size={14} />
          <span>Demo Data</span>
        </div>

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
  );
};
