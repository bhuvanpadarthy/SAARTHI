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
        <div className="modal-header" style={{ borderBottom: '1px solid var(--slate-200)', padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: appMode === 'ai'
                  ? 'linear-gradient(135deg, #6366F1, #06B6D4)'
                  : 'linear-gradient(135deg, #059669, #D97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: appMode === 'ai'
                  ? '0 4px 14px rgba(99,102,241,0.35)'
                  : '0 4px 14px rgba(5,150,105,0.35)'
              }}
            >
              <Cpu size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  SAARTHI Modular Plugins & Mode Engine
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: appMode === 'ai' ? '#EEF2FF' : '#ECFDF5',
                    color: appMode === 'ai' ? '#4F46E5' : '#059669',
                    border: `1px solid ${appMode === 'ai' ? '#C7D2FE' : '#A7F3D0'}`
                  }}
                >
                  {appMode === 'ai' ? '🤖 AI Mode' : '🏢 Real Mode'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                Switch operation modes between Autonomous AI Copilot and Production Shop POS terminal.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: 'var(--slate-400)',
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
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              System Operation Mode Preset
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {/* Option 1: AI Mode */}
              <div
                onClick={() => setAppMode('ai')}
                style={{
                  padding: '16px 18px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  border: appMode === 'ai' ? '2px solid #6366F1' : '1px solid var(--slate-200)',
                  background: appMode === 'ai'
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.06))'
                    : 'var(--white)',
                  boxShadow: appMode === 'ai' ? '0 6px 20px rgba(99,102,241,0.18)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#6366F1',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Bot size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--navy-900)' }}>
                        🤖 AI Copilot Mode
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6366F1', fontWeight: 700 }}>
                        {aiCount} AI Plugins Active
                      </div>
                    </div>
                  </div>

                  <input
                    type="radio"
                    name="system_mode"
                    checked={appMode === 'ai'}
                    onChange={() => setAppMode('ai')}
                    style={{ accentColor: '#6366F1', width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--slate-600)', lineHeight: '1.4' }}>
                  Autonomous paint Copilot, seasonal stock demand forecasting, smart tint formulation calculator, and predictive Khata risk analysis.
                </p>

                {appMode === 'ai' && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: '#4F46E5' }}>
                    <Activity size={12} className="pulse-indicator" />
                    <span>Active System Mode: AI Intelligence Layer On</span>
                  </div>
                )}
              </div>

              {/* Option 2: Real Mode */}
              <div
                onClick={() => setAppMode('real')}
                style={{
                  padding: '16px 18px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  border: appMode === 'real' ? '2px solid #059669' : '1px solid var(--slate-200)',
                  background: appMode === 'real'
                    ? 'linear-gradient(135deg, rgba(5,150,105,0.08), rgba(217,119,6,0.05))'
                    : 'var(--white)',
                  boxShadow: appMode === 'real' ? '0 6px 20px rgba(5,150,105,0.18)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#059669',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Printer size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--navy-900)' }}>
                        🏢 Real Shop Terminal
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>
                        {realCount} Real-World POS Plugins Active
                      </div>
                    </div>
                  </div>

                  <input
                    type="radio"
                    name="system_mode"
                    checked={appMode === 'real'}
                    onChange={() => setAppMode('real')}
                    style={{ accentColor: '#059669', width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--slate-600)', lineHeight: '1.4' }}>
                  Fast counter POS for high-volume paper billing, physical thermal receipt printing, depot truck challans, and dynamic UPI QR code settlement.
                </p>

                {appMode === 'real' && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: '#059669' }}>
                    <Activity size={12} className="pulse-indicator" />
                    <span>Active System Mode: Physical POS Terminal On</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Plugin Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
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

            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>
              {activeCount} of {plugins.length} Plugins Enabled
            </div>
          </div>

          {/* Plugin Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {filteredPlugins.map((plugin) => {
              const IconComponent = ICON_MAP[plugin.iconName] || Zap;
              const isAi = plugin.category === 'ai';

              return (
                <div
                  key={plugin.id}
                  style={{
                    background: 'var(--white)',
                    border: plugin.enabled
                      ? `1px solid ${isAi ? '#C7D2FE' : '#A7F3D0'}`
                      : '1px solid var(--slate-200)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)',
                    opacity: plugin.enabled ? 1 : 0.65,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    {/* Plugin Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: isAi ? '#EEF2FF' : '#ECFDF5',
                            color: isAi ? '#4F46E5' : '#059669',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
                            {plugin.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--slate-500)', fontFamily: 'var(--font-mono)' }}>
                              {plugin.version}
                            </span>
                            <span
                              style={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: isAi ? '#EEF2FF' : '#ECFDF5',
                                color: isAi ? '#4F46E5' : '#059669'
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

                    <p style={{ fontSize: '0.78rem', color: 'var(--slate-600)', lineHeight: '1.45', marginBottom: '12px' }}>
                      {plugin.description}
                    </p>
                  </div>

                  {/* Plugin Footer Action */}
                  <div
                    style={{
                      borderTop: '1px solid var(--slate-100)',
                      paddingTop: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem' }}>
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: plugin.enabled ? (isAi ? '#6366F1' : '#10B981') : '#94A3B8'
                        }}
                      />
                      <span style={{ color: plugin.enabled ? 'var(--slate-700)' : 'var(--slate-400)', fontWeight: 600 }}>
                        {plugin.enabled ? 'Active on Edge' : 'Disabled'}
                      </span>
                    </div>

                    {plugin.enabled && (
                      <button
                        type="button"
                        onClick={() => handleTestPlugin(plugin)}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: isAi ? '#4F46E5' : '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <span>Open Capability</span>
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer"
          style={{
            borderTop: '1px solid var(--slate-200)',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
