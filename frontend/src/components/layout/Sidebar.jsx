import React from 'react';
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
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { activePage, setActivePage, settings, lowStockProducts } = useApp();

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

  return (
    <>
      {isOpen && (
        <div
          className="modal-overlay no-print"
          style={{ zIndex: 35, background: 'rgba(0,0,0,0.5)' }}
          onClick={onClose}
        />
      )}
      <aside className={`app-sidebar no-print ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-badge">
            <div className="brand-logo-icon">
              <Paintbrush size={22} strokeWidth={2.4} />
            </div>
            <div className="brand-text">
              <h1>
                SAARTHI <span className="brand-tag">PAINTS</span>
              </h1>
              <div className="brand-subtitle">Inventory & Billing SaaS</div>
            </div>
            {isOpen && (
              <button
                onClick={onClose}
                style={{ marginLeft: 'auto', color: 'var(--slate-400)' }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
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
        </nav>

        <div className="sidebar-footer">
          <div className="shop-info-card">
            <div className="shop-avatar">
              <Store size={18} />
            </div>
            <div className="shop-meta">
              <div className="shop-meta-name" title={settings.shopName}>
                {settings.shopName}
              </div>
              <div className="shop-meta-tag">Demo Mode Active</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
