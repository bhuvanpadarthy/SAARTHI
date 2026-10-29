import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  PlusCircle,
  AlertOctagon,
  ArrowDownCircle,
  AlertTriangle,
  CheckCircle,
  Layers,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InventoryPage = () => {
  const { products, addStock, recordDamaged, settings } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal states
  const [stockInModal, setStockInModal] = useState({ open: false, product: null, qty: '', invoiceNo: '' });
  const [damageModal, setDamageModal] = useState({ open: false, product: null, qty: '', reason: 'Transit Lid Breach' });

  const brands = useMemo(() => ['ALL', ...new Set(products.map((p) => p.brand))], [products]);

  const filteredInventory = useMemo(() => {
    return products.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.shadeCode && p.shadeCode.toLowerCase().includes(q));

      const matchesBrand = filterBrand === 'ALL' || p.brand === filterBrand;

      let matchesStatus = true;
      const isLow = p.currentStock <= (p.minThreshold || settings.lowStockThreshold || 5);
      if (filterStatus === 'LOW') {
        matchesStatus = isLow;
      } else if (filterStatus === 'OUT') {
        matchesStatus = p.currentStock === 0;
      } else if (filterStatus === 'HEALTHY') {
        matchesStatus = !isLow && p.currentStock > 0;
      }

      return matchesSearch && matchesBrand && matchesStatus;
    });
  }, [products, searchTerm, filterBrand, filterStatus, settings]);

  const handleStockInSubmit = (e) => {
    e.preventDefault();
    if (!stockInModal.product || !stockInModal.qty) return;
    addStock(stockInModal.product.id, stockInModal.qty, stockInModal.invoiceNo);
    setStockInModal({ open: false, product: null, qty: '', invoiceNo: '' });
  };

  const handleDamageSubmit = (e) => {
    e.preventDefault();
    if (!damageModal.product || !damageModal.qty) return;
    recordDamaged(damageModal.product.id, damageModal.qty, damageModal.reason);
    setDamageModal({ open: false, product: null, qty: '', reason: 'Transit Lid Breach' });
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            Inventory Stock Ledger
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
            Full accountability: Opening stock, depot receipts, sales deductions, and damaged stock
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-primary"
            onClick={() => setStockInModal({ open: true, product: products[0] || null, qty: '10', invoiceNo: 'INV-' + Math.floor(1000 + Math.random() * 9000) })}
          >
            <ArrowDownCircle size={16} /> Inward Depot Stock
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body" style={{ padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="search-input-wrapper" style={{ gridColumn: 'span 2' }}>
              <Search size={16} />
              <input
                type="text"
                className="form-control"
                placeholder="Search inventory by product, shade, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <select
                className="form-select"
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
              >
                <option value="ALL">All Brands</option>
                {brands.filter((b) => b !== 'ALL').map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Stock Levels</option>
                <option value="LOW">⚠️ Low Stock Alerts</option>
                <option value="HEALTHY">✅ Well Stocked</option>
                <option value="OUT">❌ Zero Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Full Stock Ledger Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product & Shade</th>
                <th>Brand / Pack</th>
                <th style={{ textAlign: 'center' }}>Opening</th>
                <th style={{ textAlign: 'center' }}>+ Received</th>
                <th style={{ textAlign: 'center' }}>- Sold</th>
                <th style={{ textAlign: 'center' }}>- Damaged</th>
                <th style={{ textAlign: 'center', background: '#F1F5F9' }}>Current Balance</th>
                <th>Safety Alert</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((p) => {
                const isLow = p.currentStock <= (p.minThreshold || settings.lowStockThreshold || 5);
                return (
                  <tr key={p.id} className={isLow ? 'row-low-stock' : ''}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          className="shade-circle"
                          style={{ backgroundColor: p.shadeHex || '#FFF', width: '22px', height: '22px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontFamily: 'var(--font-mono)' }}>
                            Shade: {p.shadeCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-brand">{p.brand}</span>
                      <span style={{ marginLeft: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                        {p.packSize}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center', color: 'var(--slate-600)', fontWeight: 600 }}>
                      {p.openingStock ?? 0}
                    </td>

                    <td style={{ textAlign: 'center', color: 'var(--emerald-600)', fontWeight: 700 }}>
                      +{p.stockReceived ?? 0}
                    </td>

                    <td style={{ textAlign: 'center', color: 'var(--orange-600)', fontWeight: 700 }}>
                      -{p.soldQuantity ?? 0}
                    </td>

                    <td style={{ textAlign: 'center', color: 'var(--rose-600)', fontWeight: 700 }}>
                      -{p.damagedStock ?? 0}
                    </td>

                    <td
                      style={{
                        textAlign: 'center',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: isLow ? 'var(--rose-600)' : 'var(--navy-900)',
                        backgroundColor: isLow ? '#FEF2F2' : '#F8FAFC'
                      }}
                    >
                      {p.currentStock}
                    </td>

                    <td>
                      {isLow ? (
                        <span className="badge badge-danger">
                          <AlertTriangle size={12} /> Low (&le;{p.minThreshold || 5})
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle size={12} /> Adequate
                        </span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-sm btn-outline"
                          title="Record inward shipment from depot"
                          onClick={() => setStockInModal({ open: true, product: p, qty: '5', invoiceNo: '' })}
                        >
                          + Receive
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          title="Record damaged / punctured tin"
                          onClick={() => setDamageModal({ open: true, product: p, qty: '1', reason: 'Transit Lid Breach' })}
                        >
                          Damage
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock In / Receive Goods Modal */}
      {stockInModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <ArrowDownCircle size={20} color="var(--emerald-600)" />
                Record Inward Stock (Goods Received)
              </div>
              <button
                onClick={() => setStockInModal({ open: false, product: null, qty: '', invoiceNo: '' })}
                style={{ color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStockInSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Paint Product *</label>
                  <select
                    className="form-select"
                    value={stockInModal.product?.id || ''}
                    onChange={(e) => {
                      const sel = products.find((x) => x.id === e.target.value);
                      setStockInModal({ ...stockInModal, product: sel });
                    }}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand} - {p.packSize} - {p.shadeCode}) [Current: {p.currentStock}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantity Received (Packs/Tins) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="form-control"
                      placeholder="e.g. 10"
                      value={stockInModal.qty}
                      onChange={(e) => setStockInModal({ ...stockInModal, qty: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Depot Delivery / Challan No.</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. AP-DEPOT-8821"
                      value={stockInModal.invoiceNo}
                      onChange={(e) => setStockInModal({ ...stockInModal, invoiceNo: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ background: 'var(--slate-50)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                  This will increment both <strong>Stock Received</strong> and <strong>Current Balance</strong> in this demo session.
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStockInModal({ open: false, product: null, qty: '', invoiceNo: '' })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Inward Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Damaged Stock Modal */}
      {damageModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <AlertOctagon size={20} color="var(--rose-600)" />
                Record Damaged / Spilled Stock
              </div>
              <button
                onClick={() => setDamageModal({ open: false, product: null, qty: '', reason: 'Transit Lid Breach' })}
                style={{ color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDamageSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Paint Product *</label>
                  <select
                    className="form-select"
                    value={damageModal.product?.id || ''}
                    onChange={(e) => {
                      const sel = products.find((x) => x.id === e.target.value);
                      setDamageModal({ ...damageModal, product: sel });
                    }}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand} - {p.packSize} - {p.shadeCode}) [Current: {p.currentStock}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantity Damaged (Packs/Tins) *</label>
                    <input
                      type="number"
                      min="1"
                      max={damageModal.product?.currentStock || 99}
                      required
                      className="form-control"
                      placeholder="e.g. 1"
                      value={damageModal.qty}
                      onChange={(e) => setDamageModal({ ...damageModal, qty: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Damage Reason *</label>
                    <select
                      className="form-select"
                      value={damageModal.reason}
                      onChange={(e) => setDamageModal({ ...damageModal, reason: e.target.value })}
                    >
                      <option value="Transit Lid Breach">Transit Lid Breach / Leakage</option>
                      <option value="Can Dent / Tin Rust">Can Dent / Severe Rust</option>
                      <option value="Accidental Shop Spill">Accidental Shop Spill</option>
                      <option value="Tinting Machine Reject">Tinting Machine Formulation Reject</option>
                      <option value="Expired Shelf Life">Coagulated / Expired Shelf Life</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: 'var(--rose-50)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--rose-600)' }}>
                  This will record damaged units and reduce <strong>Current Balance</strong> without charging any customer.
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDamageModal({ open: false, product: null, qty: '', reason: 'Transit Lid Breach' })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Deduct as Damaged
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
