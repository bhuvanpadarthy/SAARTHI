import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Boxes,
  Users,
  Plus,
  ArrowRight,
  Receipt,
  CheckCircle,
  Eye,
  DollarSign,
  Printer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InvoiceModal } from '../invoice/InvoiceModal';

export const DashboardPage = () => {
  const {
    products,
    sales,
    customers,
    settings,
    lowStockProducts,
    totalInventoryValuation,
    totalStockUnits,
    totalOutstandingCredit,
    setActivePage
  } = useApp();

  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Calculate today's sales (items sold today)
  // Demo date matcher (defaulting to sales from current date or today)
  const today = '2026-10-23';
  const todaySales = sales.filter((s) => s.date && s.date.includes(today));
  const todayRevenue = todaySales.reduce((acc, s) => acc + (s.netTotal || 0), 0);
  const todayPacksCount = todaySales.reduce((acc, s) => {
    return acc + (s.items ? s.items.reduce((iAcc, item) => iAcc + Number(item.quantity || 0), 0) : 0);
  }, 0);

  // Category breakdown for inventory
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + (p.currentStock || 0);
    return acc;
  }, {});

  return (
    <div className="page-content">
      {/* KPI Cards */}
      <div className="metrics-grid">
        {/* Total Products */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Paint Catalog</span>
            <div className="metric-icon-wrap navy">
              <Package size={22} />
            </div>
          </div>
          <div className="metric-value">{products.length}</div>
          <div className="metric-footer">
            <span>{totalStockUnits} total packs / tins across racks</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div
          className="metric-card"
          style={{
            borderColor: lowStockProducts.length > 0 ? '#FECDD3' : undefined,
            backgroundColor: lowStockProducts.length > 0 ? '#FFFDFD' : undefined,
            cursor: 'pointer'
          }}
          onClick={() => setActivePage('inventory')}
          title="Click to view low stock items in Inventory"
        >
          <div className="metric-header">
            <span className="metric-label">Low Stock Alerts</span>
            <div className="metric-icon-wrap rose">
              <AlertTriangle size={22} />
            </div>
          </div>
          <div className="metric-value" style={{ color: lowStockProducts.length > 0 ? 'var(--rose-600)' : undefined }}>
            {lowStockProducts.length}
          </div>
          <div className="metric-footer">
            {lowStockProducts.length > 0 ? (
              <span className="metric-trend-alert">
                Immediate reorder needed from depot
              </span>
            ) : (
              <span className="metric-trend-up">All paint stocks healthy</span>
            )}
          </div>
        </div>

        {/* Today's Sales */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Today's Sales Revenue</span>
            <div className="metric-icon-wrap orange">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="metric-value">
            {settings.currency}
            {todayRevenue.toLocaleString('en-IN')}
          </div>
          <div className="metric-footer">
            <span className="metric-trend-up">
              {todaySales.length} paper bills ({todayPacksCount} packs sold)
            </span>
          </div>
        </div>

        {/* Estimated Inventory Value */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Stock Valuation (Est.)</span>
            <div className="metric-icon-wrap emerald">
              <Boxes size={22} />
            </div>
          </div>
          <div className="metric-value">
            {settings.currency}
            {totalInventoryValuation.toLocaleString('en-IN')}
          </div>
          <div className="metric-footer">
            <span>Based on current dealer purchase rates</span>
          </div>
        </div>
      </div>

      {/* Main 2-column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Urgent Low-Stock Attention Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <AlertTriangle size={18} color="var(--rose-600)" />
                Low Stock Paint Alerts ({lowStockProducts.length})
              </div>
              <div className="card-subtitle">
                Paints at or below safety reorder threshold ({settings.lowStockThreshold} units)
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setActivePage('reports')}
            >
              Generate Order Sheet
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {lowStockProducts.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--slate-500)' }}>
                <CheckCircle size={36} color="var(--emerald-500)" style={{ margin: '0 auto 8px' }} />
                <p>No low stock alerts! All paint inventory is adequately stocked.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product & Shade</th>
                      <th>Brand</th>
                      <th>Pack</th>
                      <th>Balance</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((item) => (
                      <tr key={item.id} className="row-low-stock">
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              className="shade-circle"
                              style={{ backgroundColor: item.shadeHex || '#FFF' }}
                              title={`Hex: ${item.shadeHex}`}
                            />
                            <div>
                              <div style={{ fontWeight: 600 }}>{item.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                                Code: {item.shadeCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-brand">{item.brand}</span>
                        </td>
                        <td><strong>{item.packSize}</strong></td>
                        <td>
                          <span className="badge badge-danger">
                            {item.currentStock} left (Min: {item.minThreshold})
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-accent"
                            onClick={() => setActivePage('inventory')}
                            title="Add stock in inventory"
                          >
                            + Inward
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Category & Stock Overview */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Boxes size={18} color="var(--navy-700)" />
                Stock by Category
              </div>
              <div className="card-subtitle">
                Distribution of tins & buckets in store
              </div>
            </div>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setActivePage('products')}
            >
              Browse Products
            </button>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(categoryCounts).map(([catName, count]) => {
                const percentage = totalStockUnits > 0 ? Math.round((count / totalStockUnits) * 100) : 0;
                return (
                  <div key={catName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{catName}</span>
                      <span style={{ color: 'var(--slate-500)' }}>
                        <strong>{count} packs</strong> ({percentage}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--slate-200)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--navy-700), var(--orange-500))',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <div
                style={{
                  marginTop: '12px',
                  padding: '12px 14px',
                  background: 'var(--slate-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--slate-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                    Customer Khata Outstanding
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                    {settings.currency}
                    {totalOutstandingCredit.toLocaleString('en-IN')}
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setActivePage('customers')}
                >
                  View Khata Ledger <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Recent Sales Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Receipt size={18} color="var(--navy-700)" />
              Recent Paper Bills Issued
            </div>
            <div className="card-subtitle">
              Last billing entries with paper invoice sequence
            </div>
          </div>
          <button
            className="btn btn-sm btn-accent"
            onClick={() => setActivePage('sales')}
          >
            <Plus size={14} /> Create New Bill
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paper Bill #</th>
                  <th>Date & Time</th>
                  <th>Customer Name</th>
                  <th>Items Summary</th>
                  <th>Payment Mode</th>
                  <th>Net Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 5).map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--navy-900)' }}>
                        {sale.billNumber}
                      </span>
                    </td>
                    <td style={{ color: 'var(--slate-600)', fontSize: '0.8rem' }}>{sale.date}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sale.customerName || 'Walk-in Customer'}</div>
                      {sale.customerPhone && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>{sale.customerPhone}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sale.items?.map((it) => `${it.productName} (${it.packSize} - ${it.quantity}x)`).join(', ')}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{sale.paymentMode}</span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                        {settings.currency}
                        {sale.netTotal?.toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${sale.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedInvoiceForModal(sale);
                          setIsInvoiceModalOpen(true);
                        }}
                        title={`View & print A4 invoice for ${sale.billNumber}`}
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        <Printer size={13} /> A4 Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* A4 Invoice & Print Dialog Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        sale={selectedInvoiceForModal}
      />
    </div>
  );
};
