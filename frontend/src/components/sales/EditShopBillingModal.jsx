import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  CheckCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  Tag,
  Hash,
  Receipt,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EditShopBillingModal = ({ isOpen, onClose, onUpdated }) => {
  const { settings, updateSettings } = useApp();

  const [formData, setFormData] = useState({
    shopName: '',
    shopId: '',
    tagline: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
    billPrefix: '',
    nextBillNumber: 1001,
    currency: '₹',
    billFooterNote: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync with current settings when opening
  useEffect(() => {
    if (isOpen && settings) {
      setFormData({
        shopName: settings.shopName || settings.name || '',
        shopId: settings.shopId || settings.shop_id || 'SHOP-HYD-042',
        tagline: settings.tagline || '',
        ownerName: settings.ownerName || settings.owner_name || '',
        phone: settings.phone || '',
        email: settings.email || '',
        address: settings.address || '',
        gstin: settings.gstin || '',
        billPrefix: settings.billPrefix || settings.bill_prefix || 'PB-2026-',
        nextBillNumber: Number(settings.nextBillNumber || settings.next_bill_number || 1001),
        currency: settings.currency || '₹',
        billFooterNote: settings.billFooterNote || settings.bill_footer_note || '',
      });
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'nextBillNumber' ? (Number(value) || 1) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.shopName.trim()) {
      setErrorMsg('Shop Name cannot be empty.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg('');
      await updateSettings(formData);
      setSuccessMsg('Shop details & billing header successfully updated!');
      if (onUpdated) {
        onUpdated(formData);
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save shop details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '740px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#222222',
          border: '1px solid #383838',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid #2E2E2E',
            backgroundColor: '#1A1A1A'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--gradient-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-gold)',
                color: '#141414'
              }}
            >
              <Building2 size={20} color="#141414" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Edit Shop & Billing Details
                </h3>
                <span
                  className="badge badge-brand"
                  style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                >
                  Live Bill Updation
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
                Updates shop name, ID, and tax information across all active bills and print receipts
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={onClose}
            title="Close dialog"
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div
            className="modal-body"
            style={{
              padding: '20px 24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Live Preview Card */}
            <div
              style={{
                background: '#181818',
                border: '1px solid #333333',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                position: 'relative'
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--gold-primary)',
                  fontWeight: 800,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Receipt size={13} color="var(--gold-primary)" />
                <span>Live Bill Header Preview</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold-light)' }}>
                    {formData.shopName || 'SRI BASKARA PAINTS AGENCIES'}
                  </div>
                  {formData.tagline && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {formData.tagline}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {formData.address || 'Shop Address Location'}
                    {formData.phone ? ` • Phone: ${formData.phone}` : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', marginTop: '4px', display: 'flex', gap: '12px', fontWeight: 600 }}>
                    <span>Store ID: <strong>{formData.shopId || 'N/A'}</strong></span>
                    <span>GSTIN: <strong>{formData.gstin || 'Unregistered / Retail'}</strong></span>
                  </div>
                </div>

                <div
                  style={{
                    background: '#222222',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #383838',
                    textAlign: 'right',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Next Bill Code</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                    {formData.billPrefix}{formData.nextBillNumber}
                  </div>
                </div>
              </div>
            </div>

            {/* Error or Success notification */}
            {errorMsg && (
              <div
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#F43F5E',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10B981',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Fields: Grid 1 - Core Shop Identity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary-light)', letterSpacing: '0.05em' }}>
                1. Store Identification & Brand
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={13} color="var(--brand-primary-light)" />
                    Shop / Store Name <span style={{ color: '#F43F5E' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    className="form-control"
                    placeholder="e.g. SRI BASKARA PAINTS AGENCIES"
                    value={formData.shopName}
                    onChange={handleChange}
                    required
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Printed as main title on bills and tax receipts
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Hash size={13} color="var(--cyan-400)" />
                    Shop / Store ID Code
                  </label>
                  <input
                    type="text"
                    name="shopId"
                    className="form-control"
                    placeholder="e.g. SHOP-HYD-042 or AP-STORE-101"
                    value={formData.shopId}
                    onChange={handleChange}
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Unique shop registration / dealer code
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={13} color="var(--brand-accent)" />
                    Tagline / Dealership Authorization
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    className="form-control"
                    placeholder="e.g. Authorized Dealer — Asian Paints, Berger & Dr. Fixit"
                    value={formData.tagline}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={13} color="var(--emerald-400)" />
                    Owner / Proprietor Name
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    className="form-control"
                    placeholder="e.g. V. K. Aggarwal & Sons"
                    value={formData.ownerName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Form Fields: Grid 2 - Tax & Address Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary-light)', letterSpacing: '0.05em' }}>
                2. Legal, Tax & Contact Details
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={13} color="var(--cyan-400)" />
                    GSTIN / Tax ID Number
                  </label>
                  <input
                    type="text"
                    name="gstin"
                    className="form-control"
                    placeholder="e.g. 36AAACP1234A1Z5 (or leave empty for retail scheme)"
                    value={formData.gstin}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="var(--emerald-400)" />
                    Shop Phone / Mobile Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    placeholder="e.g. +91 98765-01234"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} color="var(--brand-primary-light)" />
                    Official Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="e.g. saarthi.paints@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="var(--rose-400)" />
                    Shop Address & Location
                  </label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    placeholder="e.g. Shop 14-16, Paints & Hardware Market, GT Road"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Form Fields: Grid 3 - Billing Sequence & Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary-light)', letterSpacing: '0.05em' }}>
                3. Invoice Numbering & Bill Footer Note
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Bill Prefix</label>
                  <input
                    type="text"
                    name="billPrefix"
                    className="form-control"
                    placeholder="PB-2026-"
                    value={formData.billPrefix}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Next Bill Number</label>
                  <input
                    type="number"
                    min="1"
                    name="nextBillNumber"
                    className="form-control"
                    value={formData.nextBillNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Currency Symbol</label>
                  <input
                    type="text"
                    name="currency"
                    className="form-control"
                    value={formData.currency}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bill Footer Terms / Note</label>
                <textarea
                  name="billFooterNote"
                  rows="2"
                  className="form-control"
                  placeholder="Thank you for choosing us! Tinted shades cannot be returned..."
                  value={formData.billFooterNote}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            className="modal-footer"
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #2E2E2E',
              backgroundColor: '#1A1A1A',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px' }}
            >
              {isSaving ? (
                <>Saving Changes...</>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Save & Apply to Billing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

