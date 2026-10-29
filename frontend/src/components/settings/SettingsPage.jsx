import React, { useState } from 'react';
import {
  Settings,
  Store,
  Receipt,
  RotateCcw,
  Save,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsPage = () => {
  const { settings, updateSettings, resetToDefaults } = useApp();

  const [formData, setFormData] = useState({
    shopName: settings.shopName || '',
    tagline: settings.tagline || '',
    ownerName: settings.ownerName || '',
    phone: settings.phone || '',
    email: settings.email || '',
    address: settings.address || '',
    gstin: settings.gstin || '',
    billPrefix: settings.billPrefix || 'PB-2026-',
    nextBillNumber: settings.nextBillNumber || 1045,
    currency: settings.currency || '₹',
    lowStockThreshold: settings.lowStockThreshold || 5,
    billFooterNote: settings.billFooterNote || ''
  });

  const [confirmReset, setConfirmReset] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      nextBillNumber: Number(formData.nextBillNumber || 1000),
      lowStockThreshold: Number(formData.lowStockThreshold || 5)
    });
  };

  const handleReset = () => {
    resetToDefaults();
    setConfirmReset(false);
  };

  return (
    <div className="page-content" style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Shop Profile & Preferences
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
          Configure store identity, paper bill serial numbering, safety thresholds, and demo parameters
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Card 1: Shop Identity */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div className="card-title">
              <Store size={18} color="var(--orange-500)" />
              Paint Shop Identity
            </div>
            <span className="badge badge-brand">Appears on Invoices</span>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Shop Commercial Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Store Tagline / Dealership</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Authorized Dealer — Asian Paints & Berger"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Proprietor / Manager Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Shop Contact Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Shop Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GSTIN / Business Registration</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Billing & System Rules */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div className="card-title">
              <Receipt size={18} color="var(--navy-700)" />
              Paper Bill Sequence & Stock Rules
            </div>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Paper Bill Prefix</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. PB-2026-"
                  value={formData.billPrefix}
                  onChange={(e) => setFormData({ ...formData, billPrefix: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Bill Serial Number</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={formData.nextBillNumber}
                  onChange={(e) => setFormData({ ...formData, nextBillNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Default Currency Symbol</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Global Low-Stock Alert Threshold (Units)</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Paper Bill Bottom Disclaimer Note</label>
              <textarea
                rows="2"
                className="form-control"
                value={formData.billFooterNote}
                onChange={(e) => setFormData({ ...formData, billFooterNote: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="submit" className="btn btn-accent">
                <Save size={16} /> Save Settings
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Card 3: Demo Data Reset */}
      <div className="card" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
        <div className="card-header" style={{ background: 'rgba(245, 158, 11, 0.08)' }}>
          <div className="card-title" style={{ color: '#F59E0B' }}>
            <RotateCcw size={18} />
            Reset Demonstration Data
          </div>
        </div>
        <div className="card-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-400)', marginBottom: '16px' }}>
            All changes, test bills, and added paints are stored in your active browser session. If you wish to restore the pristine initial demo dataset with sample Asian Paints, Berger, and Dr. Fixit records, click below.
          </p>

          {!confirmReset ? (
            <button
              type="button"
              className="btn btn-outline"
              style={{ color: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.4)' }}
              onClick={() => setConfirmReset(true)}
            >
              Reset to Original Demo Dataset
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleReset}
              >
                Yes, Reset All Session Data
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
