import React, { useState } from 'react';
import {
  X,
  Bot,
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  Printer,
  Truck,
  Scan,
  QrCode,
  Cpu,
  Zap,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight,
  ExternalLink,
  Info,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ICON_MAP = {
  Bot,
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  Printer,
  Truck,
  Scan,
  QrCode,
};

export const PluginsModal = ({ isOpen, onClose }) => {
  const { appMode, setAppMode, plugins, togglePlugin, setActivePage, notify } = useApp();
  const [filterCategory, setFilterCategory] = useState('ALL');

  if (!isOpen) return null;

  const filteredPlugins = plugins.filter((p) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'AI') return p.category === 'ai';
    if (filterCategory === 'REAL') return p.category === 'real';
    if (filterCategory === 'ACTIVE') return p.enabled;
    return true;
  });

  const activeCount = plugins.filter((p) => p.enabled).length;
  const aiCount = plugins.filter((p) => p.category === 'ai' && p.enabled).length;
  const realCount = plugins.filter((p) => p.category === 'real' && p.enabled).length;

  const handleTestPlugin = (plugin) => {
    switch (plugin.id) {
      case 'ai-copilot':
        notify('AI Voice & Chat Copilot is online and listening. Open the floating widget to talk.', 'info');
        break;
      case 'ai-demand-forecast':
        setActivePage('inventory');
        onClose();
        notify('Viewing predictive demand warnings in Inventory Ledger.', 'info');
        break;
      case 'ai-tint-matcher':
        setActivePage('products');
        onClose();
        notify('Smart Tint Formulation Matrix active in Shade Catalog.', 'info');
        break;
      case 'ai-khata-risk':
        setActivePage('customers');
        onClose();
        notify('Khata AI Credit Scoring active on Customer Accounts.', 'info');
        break;
      case 'real-hardware-terminal':
        setActivePage('sales');
        onClose();
        notify('Thermal & A4 Paper Bill format loaded in Sales Counter.', 'info');
        break;
      case 'real-depot-sync':
        setActivePage('inventory');
        onClose();
        notify('Regional Depot Challan Ledger opened.', 'info');
        break;
      case 'real-barcode-scanner':
        notify('Handheld HID Barcode Scanner ready for continuous SKU reading.', 'info');
        break;
      case 'real-upi-reconcile':
        setActivePage('sales');
        onClose();
        notify('Dynamic UPI QR code ready for customer checkout.', 'info');
        break;
      default:
        notify(`Plugin "${plugin.name}" is working properly.`);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 60 }}>
      <div className="modal-content plugins-modal-dialog">
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: appMode === 'ai'
                  ? 'var(--gradient-ocean)'
                  : 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: appMode === 'ai' ? '#042940' : '#FFF',
                boxShadow: appMode === 'ai'
                  ? 'var(--shadow-ocean)'
                  : '0 4px 12px rgba(16,185,129,0.3)'
              }}
            >
              <Cpu size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  SAARTHI Modular Plugins & Mode Engine
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: appMode === 'ai' ? 'rgba(0,242,254,0.15)' : '#F1F3F5',
                    color: appMode === 'ai' ? '#0284C7' : '#343A40',
                    border: `1px solid ${appMode === 'ai' ? 'rgba(0,242,254,0.4)' : '#DEE2E6'}`
                  }}
                >
                  {appMode === 'ai' ? '🤖 AI Mode' : '🏢 Real Mode'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Switch operation modes between Autonomous AI Copilot and Production Shop POS terminal.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px', maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Main Dual Mode Switcher Banner */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              System Operation Mode Preset
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {/* Option 1: AI Mode */}
              <div
                onClick={() => setAppMode('ai')}
                style={{
                  padding: '18px 20px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  border: appMode === 'ai' ? '2px solid #00F2FE' : '1px solid var(--border-light)',
                  background: appMode === 'ai'
                    ? 'var(--gradient-ocean-subtle)'
                    : '#FFFFFF',
                  boxShadow: appMode === 'ai' ? '0 4px 16px rgba(0,242,254,0.18)' : 'var(--shadow-xs)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'var(--gradient-ocean)',
                        color: '#042940',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,242,254,0.3)'
                      }}
                    >
                      <Bot size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        🤖 AI Copilot Mode
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#0284C7', fontWeight: 700 }}>
                        {aiCount} AI Plugins Active
                      </div>
                    </div>
                  </div>

                  <input
                    type="radio"
                    name="system_mode"
                    checked={appMode === 'ai'}
                    onChange={() => setAppMode('ai')}
                    style={{ accentColor: '#00F2FE', width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  Autonomous paint Copilot, seasonal stock demand forecasting, smart tint formulation calculator, and predictive Khata risk analysis.
                </p>

                {appMode === 'ai' && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#0284C7' }}>
                    <Activity size={14} className="pulse-indicator" />
                    <span>Active System Mode: AI Intelligence Layer Online</span>
                  </div>
                )}
              </div>

              {/* Option 2: Real Mode */}
              <div
                onClick={() => setAppMode('real')}
                style={{
                  padding: '18px 20px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  border: appMode === 'real' ? '2px solid #212529' : '1px solid var(--border-light)',
                  background: appMode === 'real'
                    ? '#F8FAFC'
                    : '#FFFFFF',
                  boxShadow: appMode === 'real' ? '0 4px 16px rgba(0,0,0,0.06)' : 'var(--shadow-xs)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#212529',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    >
                      <Printer size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        🏢 Real Shop Terminal
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                        {realCount} Real-World POS Plugins Active
                      </div>
                    </div>
                  </div>

                  <input
                    type="radio"
                    name="system_mode"
                    checked={appMode === 'real'}
                    onChange={() => setAppMode('real')}
                    style={{ accentColor: '#212529', width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  Fast counter POS for high-volume paper billing, physical thermal receipt printing, depot truck challans, and dynamic UPI QR code settlement.
                </p>

                {appMode === 'real' && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#059669' }}>
                    <Activity size={14} className="pulse-indicator" />
                    <span>Active System Mode: Physical POS Terminal Online</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Plugin Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`filter-pill ${filterCategory === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterCategory('ALL')}
              >
                All Plugins ({plugins.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${filterCategory === 'AI' ? 'active' : ''}`}
                onClick={() => setFilterCategory('AI')}
              >
                🤖 AI Mode ({plugins.filter((p) => p.category === 'ai').length})
              </button>
              <button
                type="button"
                className={`filter-pill ${filterCategory === 'REAL' ? 'active' : ''}`}
                onClick={() => setFilterCategory('REAL')}
              >
                🏢 Real POS ({plugins.filter((p) => p.category === 'real').length})
              </button>
              <button
                type="button"
                className={`filter-pill ${filterCategory === 'ACTIVE' ? 'active' : ''}`}
                onClick={() => setFilterCategory('ACTIVE')}
              >
                Active Only ({activeCount})
              </button>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {activeCount} of {plugins.length} Plugins Enabled
            </div>
          </div>

          {/* Plugin Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px' }}>
            {filteredPlugins.map((plugin) => {
              const IconComponent = ICON_MAP[plugin.iconName] || Zap;
              const isAi = plugin.category === 'ai';

              return (
                <div
                  key={plugin.id}
                  style={{
                    background: plugin.enabled ? '#FFFFFF' : '#F8FAFC',
                    border: plugin.enabled
                      ? (isAi ? '1px solid #7DD3FC' : '1px solid #A7F3D0')
                      : '1px solid var(--border-light)',
                    borderRadius: '14px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: plugin.enabled
                      ? (isAi ? '0 4px 16px rgba(0,242,254,0.12)' : '0 4px 16px rgba(16,185,129,0.08)')
                      : 'none',
                    opacity: plugin.enabled ? 1 : 0.7,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    {/* Plugin Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: isAi ? 'rgba(0, 242, 254, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                            color: isAi ? '#0284C7' : '#059669',
                            border: `1px solid ${isAi ? 'rgba(0, 242, 254, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                            {plugin.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {plugin.version}
                            </span>
                            <span
                              style={{
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                padding: '1px 7px',
                                borderRadius: '4px',
                                background: isAi ? 'rgba(0, 242, 254, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: isAi ? '#0284C7' : '#059669'
                              }}
                            >
                              {plugin.badge}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <label className="plugin-switch" title={`Toggle ${plugin.name}`}>
                        <input
                          type="checkbox"
                          checked={plugin.enabled}
                          onChange={() => togglePlugin(plugin.id)}
                        />
                        <span className="plugin-slider" />
                      </label>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '14px' }}>
                      {plugin.description}
                    </p>
                  </div>

                  {/* Plugin Footer Action */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border-glass)',
                      paddingTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: plugin.enabled ? (isAi ? '#818CF8' : '#34D399') : '#64748B'
                        }}
                      />
                      <span style={{ color: plugin.enabled ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                        {plugin.enabled ? 'Active on Edge' : 'Disabled'}
                      </span>
                    </div>

                    {plugin.enabled && (
                      <button
                        type="button"
                        onClick={() => handleTestPlugin(plugin)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: isAi ? '#0284C7' : '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <span>Open Capability</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginRight: 'auto' }}>
            <Info size={14} />
            <span>Plugin states and mode selection are saved in real-time.</span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
