import React, { useState, useMemo } from 'react';
import {
  FileBarChart2,
  Printer,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Package,
  Layers,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsPage = () => {
  const { sales, products, lowStockProducts, settings } = useApp();

  const [activeReportTab, setActiveReportTab] = useState('sales'); // 'sales' | 'reorder'
  const [selectedPeriod, setSelectedPeriod] = useState('today'); // 'today' | 'all'

  // Filter sales by period
  const todayDateStr = '2026-10-23';
  const filteredSales = useMemo(() => {
    if (selectedPeriod === 'today') {
      return sales.filter((s) => s.date && s.date.includes(todayDateStr));
    }
    return sales;
  }, [sales, selectedPeriod]);

  // Aggregate metrics
  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + (s.netTotal || 0), 0);
  const totalBillsCount = filteredSales.length;

  // Breakdown by Payment Mode
  const paymentBreakdown = filteredSales.reduce((acc, s) => {
    const mode = s.paymentMode || 'Cash';
    acc[mode] = (acc[mode] || 0) + (s.netTotal || 0);
    return acc;
  }, {});

  // Item-wise sales breakdown
  const itemSalesBreakdown = useMemo(() => {
    const map = {};
    filteredSales.forEach((sale) => {
      sale.items?.forEach((it) => {
        const key = `${it.productName}_${it.packSize}_${it.shadeCode}`;
        if (!map[key]) {
          map[key] = {
            name: it.productName,
            brand: it.brand,
            shadeCode: it.shadeCode,
            packSize: it.packSize,
            quantity: 0,
            revenue: 0
          };
        }
        map[key].quantity += Number(it.quantity || 0);
        map[key].revenue += Number(it.total || 0);
      });
    });
    return Object.values(map).sort((a, b) => b.quantity - a.quantity);
  }, [filteredSales]);

  // Low stock reorder calculations
  const totalReorderEstimatedCost = lowStockProducts.reduce((sum, p) => {
    const suggestedUnits = Math.max(10, (p.minThreshold || 5) * 2 - p.currentStock);
    return sum + suggestedUnits * (p.unitPrice * 0.82); // estimated dealer net purchase price
  }, 0);

  return (
    <div className="page-content">
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            Shop Reports & Procurement
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
            Daily revenue audit and official distributor reorder procurement sheets
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--slate-300)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveReportTab('sales')}
          style={{
            padding: '10px 16px',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: activeReportTab === 'sales' ? 'var(--orange-500)' : 'var(--slate-600)',
            borderBottom: activeReportTab === 'sales' ? '3px solid var(--orange-500)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <TrendingUp size={16} /> Daily Sales Summary
        </button>

        <button
          onClick={() => setActiveReportTab('reorder')}
          style={{
            padding: '10px 16px',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: activeReportTab === 'reorder' ? 'var(--orange-500)' : 'var(--slate-600)',
            borderBottom: activeReportTab === 'reorder' ? '3px solid var(--orange-500)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertTriangle size={16} color="var(--rose-600)" />
          Low Stock Reorder Sheet ({lowStockProducts.length})
        </button>
      </div>

      {/* Report 1: Daily Sales Summary */}
      {activeReportTab === 'sales' && (
        <div>
          {/* Controls */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-body" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} color="var(--slate-500)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter Time Period:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '6px 12px' }}
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="today">Today's Transactions (23 Oct 2026)</option>
                  <option value="all">All Available Records</option>
                </select>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                Showing <strong>{filteredSales.length} bills</strong>
              </div>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="metrics-grid" style={{ marginBottom: '24px' }}>
            <div className="metric-card">
              <span className="metric-label">Total Revenue</span>
              <div className="metric-value" style={{ color: 'var(--navy-900)' }}>
                {settings.currency}
                {totalSalesRevenue.toLocaleString('en-IN')}
              </div>
              <div className="metric-footer">
                <span>Net collected across all bills</span>
              </div>
            </div>

            <div className="metric-card">
              <span className="metric-label">Bills Issued</span>
              <div className="metric-value">{totalBillsCount}</div>
              <div className="metric-footer">
                <span>Unique paper bill slips</span>
              </div>
            </div>

            <div className="metric-card">
              <span className="metric-label">Avg. Bill Size</span>
              <div className="metric-value">
                {settings.currency}
                {totalBillsCount > 0 ? Math.round(totalSalesRevenue / totalBillsCount).toLocaleString('en-IN') : 0}
              </div>
              <div className="metric-footer">
                <span>Average order basket value</span>
              </div>
            </div>
          </div>

          {/* Payment Mode Distribution & Items breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Payment Modes */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Collection by Payment Mode</div>
              </div>
              <div className="card-body">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mode</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th style={{ textAlign: 'right' }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(paymentBreakdown).map(([mode, amt]) => {
                      const pct = totalSalesRevenue > 0 ? Math.round((amt / totalSalesRevenue) * 100) : 0;
                      return (
                        <tr key={mode}>
                          <td style={{ fontWeight: 600 }}>{mode}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>
                            {settings.currency}{amt.toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className="badge badge-neutral">{pct}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Moving Products */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Top Moving Paint Products</div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Shade</th>
                      <th style={{ textAlign: 'center' }}>Sold</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemSalesBreakdown.slice(0, 5).map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{it.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                            {it.brand} ({it.packSize})
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{it.shadeCode}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{it.quantity} packs</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          {settings.currency}{it.revenue.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report 2: Low Stock Reorder Report */}
      {activeReportTab === 'reorder' && (
        <div>
          {/* Header notice */}
          <div
            style={{
              background: 'linear-gradient(90deg, #FEF2F2 0%, #FFFBEB 100%)',
              border: '1px solid #FECDD3',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '20px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rose-600)', fontWeight: 800, fontSize: '1.05rem' }}>
                <AlertTriangle size={20} />
                Depot Reorder Indent Sheet
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: '4px' }}>
                {lowStockProducts.length} formulations require urgent replenishment from factory depots
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                Est. Indent Procurement Value
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                {settings.currency}
                {Math.round(totalReorderEstimatedCost).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Formulation</th>
                    <th>Brand</th>
                    <th>Shade Code</th>
                    <th>Pack Size</th>
                    <th style={{ textAlign: 'center' }}>Current Stock</th>
                    <th style={{ textAlign: 'center' }}>Safety Level</th>
                    <th style={{ textAlign: 'center', background: '#FFF7ED', color: 'var(--orange-600)' }}>
                      Suggested Reorder
                    </th>
                    <th>Distributor / Depot</th>
                    <th style={{ textAlign: 'right' }}>Est. Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-500)' }}>
                        <CheckCircle size={32} color="var(--emerald-500)" style={{ margin: '0 auto 8px' }} />
                        <div>No paints currently need reordering! All items are above safety threshold.</div>
                      </td>
                    </tr>
                  ) : (
                    lowStockProducts.map((p) => {
                      const suggested = Math.max(8, (p.minThreshold || 5) * 2 - p.currentStock);
                      const costEst = Math.round(suggested * p.unitPrice * 0.85);
                      return (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{p.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Rack: {p.locationRack}</div>
                          </td>
                          <td>
                            <span className="badge badge-brand">{p.brand}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                className="shade-circle"
                                style={{ backgroundColor: p.shadeHex || '#FFF', width: '16px', height: '16px' }}
                              />
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{p.shadeCode}</span>
                            </div>
                          </td>
                          <td><strong>{p.packSize}</strong></td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge badge-danger" style={{ fontSize: '0.85rem' }}>
                              {p.currentStock} units
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', color: 'var(--slate-600)', fontWeight: 600 }}>
                            {p.minThreshold || 5} units
                          </td>
                          <td style={{ textAlign: 'center', background: '#FFF7ED', fontWeight: 800, color: 'var(--orange-600)', fontSize: '1rem' }}>
                            {suggested} packs
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--slate-700)' }}>
                            {p.distributor || 'Authorized Depot'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>
                            {settings.currency}{costEst.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
