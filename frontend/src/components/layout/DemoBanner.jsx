import React from 'react';
import { Info, RotateCcw, CheckCircle2, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoBanner = () => {
  const { isBackendConnected, backendStatus, refreshData, resetToDefaults } = useApp();

  return (
    <div
      className="demo-banner no-print"
      style={{
        background: isBackendConnected
          ? 'linear-gradient(90deg, #ECFDF5 0%, #F0FDF4 100%)'
          : 'linear-gradient(90deg, #FFF7ED 0%, #FEF3C7 100%)',
        borderColor: isBackendConnected ? '#A7F3D0' : '#FDE68A',
        color: isBackendConnected ? '#065F46' : '#92400E',
      }}
    >
      <div className="demo-banner-content">
        <span
          className="demo-banner-tag"
          style={{ background: isBackendConnected ? '#059669' : '#D97706' }}
        >
          {isBackendConnected ? 'LIVE' : 'DEMO'}
        </span>
        {isBackendConnected ? (
          <CheckCircle2 size={15} style={{ flexShrink: 0, color: '#059669' }} />
        ) : (
          <Info size={15} style={{ flexShrink: 0 }} />
        )}
        <span>
          {isBackendConnected ? (
            <>
              <strong>Backend Active:</strong> Connected to Node.js + Express API. Storage Engine:{' '}
              <em>{backendStatus}</em>. Stock transactions and paper bills are validated and saved on the server.
            </>
          ) : (
            <>
              <strong>Local Demo Mode:</strong> Backend server at <code>localhost:5000</code> is offline. Operating in client demo mode with local fixtures. Start backend to persist to server.
            </>
          )}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {isBackendConnected ? (
          <button
            onClick={refreshData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.75rem',
              color: '#065F46',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            title="Reload latest balances and audit ledger from backend"
          >
            <RefreshCw size={12} />
            Refresh Server Data
          </button>
        ) : (
          <button
            onClick={resetToDefaults}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.75rem',
              color: '#B45309',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            title="Restore default sample paint data"
          >
            <RotateCcw size={12} />
            Reset Demo Data
          </button>
        )}
      </div>
    </div>
  );
};
