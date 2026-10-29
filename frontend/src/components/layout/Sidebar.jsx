import React, { useState } from 'react';
import {
  LayoutDashboard,
  Palette,
  Boxes,
  Receipt,
  Users,
  FileBarChart2,
  Settings,
  Paintbrush,
  Store,
  AlertTriangle,
  X,
  Bot,
  Printer,
  SlidersHorizontal,
  Cpu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PluginsModal } from '../plugins/PluginsModal';

export const Sidebar = ({ isOpen, onClose }) => {
  const { activePage, setActivePage, settings, lowStockProducts, appMode, setAppMode, plugins } = useApp();
  const [isPluginsOpen, setIsPluginsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Shades', icon: Palette },
    {
      id: 'inventory',
      label: 'Inventory Ledger',
      icon: Boxes,
      badge: lowStockProducts.length > 0 ? `${lowStockProducts.length} Low` : null,
      badgeType: 'alert'
    },
    { id: 'sales', label: 'Sales & Billing', icon: Receipt },
    { id: 'customers', label: 'Customers / Khata', icon: Users },
    { id: 'reports', label: 'Reports & Reorders', icon: FileBarChart2 },
    { id: 'settings', label: 'Shop Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    if (onClose) onClose();
  };

  const activePlugins = plugins.filter((p) => p.enabled).length;

  return (
    <>
      {isOpen && (
        <div
          className="modal-overlay no-print"
          style={{ zIndex: 35, background: 'rgba(0,0,0,0.5)' }}
          onClick={onClose}
        />
      )}
      <aside className={`app-sidebar no-print ${isOpen ? 'open' : ''} ${appMode === 'ai' ? 'sidebar-ai-glow' : 'sidebar-real-glow'}`}>
        <div className="sidebar-header">
          <div className="brand-badge" style={{ gap: '12px', alignItems: 'center' }}>
            <span className="brand-mark" aria-hidden="true" title="Rangoli Paints Guntur">
              <span />
              <span />
              <span />
              <span />
            </span>
            <div className="brand-text">
              <h1 style={{ fontSize: '1.18rem', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
                Rangoli <span style={{ color: 'var(--red)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>Paints</span>
              </h1>
              <div className="brand-subtitle" style={{ font: '9.5px/1.2 var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '4px' }}>
                {appMode === 'ai' ? 'AI COPILOT • GUNTUR' : 'GUNTUR • MAKE ROOM FOR COLOR'}
              </div>
            </div>
            {isOpen && (
              <button
                onClick={onClose}
                style={{ marginLeft: 'auto', color: 'var(--ink)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Operations</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`nav-pill-badge ${item.badgeType}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="nav-section-label" style={{ marginTop: '16px' }}>Plugins & Modes</div>
          <button
            type="button"
            className="nav-item plugin-nav-item"
            onClick={() => setIsPluginsOpen(true)}
          >
            <SlidersHorizontal size={18} />
            <span>Plugin Manager</span>
            <span className="plugin-nav-badge">{activePlugins} Active</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          {/* Quick Mode Toggle in Sidebar */}
          <div className="sidebar-mode-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--slate-400)' }}>
                System Mode
              </div>
              <span className={`mode-micro-badge ${appMode === 'ai' ? 'ai' : 'real'}`}>
                {appMode === 'ai' ? 'AI ACTIVE' : 'REAL POS'}
              </span>
            </div>

            <div className="sidebar-mode-switch-grid">
              <button
                type="button"
                className={`sidebar-mode-btn ${appMode === 'ai' ? 'active-ai' : ''}`}
                onClick={() => setAppMode('ai')}
              >
                <Bot size={13} />
                <span>AI Mode</span>
              </button>
              <button
                type="button"
                className={`sidebar-mode-btn ${appMode === 'real' ? 'active-real' : ''}`}
                onClick={() => setAppMode('real')}
              >
                <Printer size={13} />
                <span>Real POS</span>
              </button>
            </div>
          </div>

          <div className="shop-info-card" style={{ marginTop: '10px' }}>
            <div className="shop-avatar">
              <Store size={18} />
            </div>
            <div className="shop-meta">
              <div className="shop-meta-name" title={settings.shopName}>
                {settings.shopName}
              </div>
              <div className="shop-meta-tag">
                {appMode === 'ai' ? '🤖 Neural Copilot Linked' : '⚡ POS Terminal Ready'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <PluginsModal
        isOpen={isPluginsOpen}
        onClose={() => setIsPluginsOpen(false)}
      />
    </>
  );
};
