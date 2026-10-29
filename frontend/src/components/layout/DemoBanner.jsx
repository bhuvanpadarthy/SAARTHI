import React from 'react';
import { Info, RotateCcw, CheckCircle2, RefreshCw, Activity, Sparkles, Database } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoBanner = () => {
  const { isBackendConnected, backendStatus, refreshData, resetToDefaults, appMode } = useApp();

  return (
    <div className={`demo-banner no-print ${isBackendConnected ? 'connected-live' : 'demo-telemetry'}`}>
      <div className="demo-banner-content">
        <span className={`demo-badge ${isBackendConnected ? 'live-badge' : 'demo-badge-active'}`}>
          <span className="live-ping-dot" />
          {isBackendConnected ? 'CLOUD LIVE' : 'SANDBOX DEMO'}
        </span>

        <div className="demo-status-text">
          {isBackendConnected ? (
            <>
              <span className="highlight-text">Server Active:</span> Express Node.js & Supabase Engine (<em>{backendStatus}</em>). Real-time inventory deduction & paper bill persistence online.
            </>
          ) : (
            <>
              <span className="highlight-text">Local Transaction Engine:</span> Operating in high-speed edge demo simulation. All paint catalog formulations and POS transactions are active.
            </>
          )}
        </div>
      </div>

      <div className="demo-actions">
        {isBackendConnected ? (
          <button
            onClick={refreshData}
            className="demo-action-btn live"
            title="Reload latest balances and audit ledger from backend"
          >
            <RefreshCw size={13} />
            <span>Sync Cloud Data</span>
          </button>
        ) : (
          <button
            onClick={resetToDefaults}
            className="demo-action-btn reset"
            title="Restore default sample paint data"
          >
            <RotateCcw size={13} />
            <span>Reset Demo Data</span>
          </button>
        )}
      </div>
    </div>
  );
};
