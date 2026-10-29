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
                  ? 'linear-gradient(135deg, #6366F1, #06B6D4)'
                  : 'linear-gradient(135deg, #059669, #10B981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: appMode === 'ai'
                  ? '0 0 20px rgba(99,102,241,0.5)'
                  : '0 0 20px rgba(16,185,129,0.5)'
              }}
            >
              <Cpu size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                  SAARTHI Modular Plugins & Mode Engine
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: appMode === 'ai' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
                    color: appMode === 'ai' ? '#A5B4FC' : '#6EE7B7',
                    border: `1px solid ${appMode === 'ai' ? 'rgba(99,102,241,0.45)' : 'rgba(16,185,129,0.45)'}`
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
                  border: appMode === 'ai' ? '2px solid #6366F1' : '1px solid var(--border-glass)',
                  background: appMode === 'ai'
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.08))'
                    : 'rgba(15,23,42,0.5)',
                  boxShadow: appMode === 'ai' ? '0 0 25px rgba(99,102,241,0.25)' : 'none',
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
                        background: '#6366F1',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 12px rgba(99,102,241,0.5)'
                      }}
                    >
                      <Bot size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FFFFFF' }}>
                        🤖 AI Copilot Mode
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#A5B4FC', fontWeight: 700 }}>
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

                <p style={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: '1.45' }}>
                  Autonomous paint Copilot, seasonal stock demand forecasting, smart tint formulation calculator, and predictive Khata risk analysis.
                </p>

                {appMode === 'ai' && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#A5B4FC' }}>
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
                  border: appMode === 'real' ? '2px solid #10B981' : '1px solid var(--border-glass)',
                  background: appMode === 'real'
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(245,158,11,0.08))'
                    : 'rgba(15,23,42,0.5)',
                  boxShadow: appMode === 'real' ? '0 0 25px rgba(16,185,129,0.25)' : 'none',
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
                        background: '#059669',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 12px rgba(16,185,129,0.5)'
                      }}
                    >
                      <Printer size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FFFFFF' }}>
                        🏢 Real Shop Terminal
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#6EE7B7', fontWeight: 700 }}>
                        {realCount} Real-World POS Plugins Active
                      </div>
                    </div>
                  </div>

                  <input
                    type="radio"
                    name="system_mode"
                    checked={appMode === 'real'}
                    onChange={() => setAppMode('real')}
                    style={{ accentColor: '#10B981', width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <p style={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: '1.45' }}>
                  Fast counter POS for high-volume paper billing, physical thermal receipt printing, depot truck challans, and dynamic UPI QR code settlement.
                </p>

                {appMode === 'real' && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#6EE7B7' }}>
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
                    background: plugin.enabled ? 'rgba(15, 23, 42, 0.75)' : 'rgba(15, 23, 42, 0.35)',
                    border: plugin.enabled
                      ? (isAi ? '1px solid rgba(99,102,241,0.45)' : '1px solid rgba(16,185,129,0.45)')
                      : '1px solid var(--border-glass)',
                    borderRadius: '14px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: plugin.enabled
                      ? (isAi ? '0 4px 20px rgba(99,102,241,0.15)' : '0 4px 20px rgba(16,185,129,0.15)')
                      : 'none',
                    opacity: plugin.enabled ? 1 : 0.65,
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
                            background: isAi ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
                            color: isAi ? '#A5B4FC' : '#6EE7B7',
                            border: `1px solid ${isAi ? 'rgba(99,102,241,0.4)' : 'rgba(16,185,129,0.4)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#FFFFFF' }}>
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
                                background: isAi ? 'rgba(99,102,241,0.25)' : 'rgba(16,185,129,0.25)',
                                color: isAi ? '#A5B4FC' : '#6EE7B7'
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

                    <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: '1.45', marginBottom: '14px' }}>
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
                      <span style={{ color: plugin.enabled ? '#FFFFFF' : 'var(--text-muted)', fontWeight: 600 }}>
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
                          color: isAi ? '#818CF8' : '#34D399',
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
