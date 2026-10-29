import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Receipt,
  CreditCard,
  Calendar,
  Phone,
  MapPin,
  TrendingUp,
  Package,
  Printer,
  ShieldCheck,
  ArrowDownRight,
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InvoiceModal } from '../invoice/InvoiceModal';

export const CustomerPurchasesModal = ({ isOpen, onClose, customer, onRecordPayment }) => {
  const { sales, settings } = useApp();
  const [activeTab, setActiveTab] = useState('bills'); // 'bills' | 'products' | 'khata'
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  if (!isOpen || !customer) return null;

  // Filter sales confirmed for this customer
  const customerSales = sales.filter(
    (s) =>
      s.customerId === customer.id ||
      s.customer_id === customer.id ||
      (s.customerName && s.customerName.toLowerCase() === customer.name.toLowerCase())
  );

  // Compute analytics from customer purchases
  const totalLifetimeSpent = customerSales.reduce(
    (acc, s) => acc + Number(s.netTotal ?? s.net_total ?? 0),
    0
  );
  const totalBillsCount = customerSales.length;
  const avgBasketValue = totalBillsCount > 0 ? Math.round(totalLifetimeSpent / totalBillsCount) : 0;
  const lastPurchaseDate = customerSales[0]?.date || customer.lastPurchaseDate || 'Recent';

  // Item level aggregation
  const purchasedItemsMap = {};
  customerSales.forEach((s) => {
    (s.items || []).forEach((item) => {
      const key = `${item.productName || item.product_name}-${item.packSize || item.pack_size}`;
      if (!purchasedItemsMap[key]) {
        purchasedItemsMap[key] = {
          productName: item.productName || item.product_name,
          brand: item.brand,
          packSize: item.packSize || item.pack_size,
          shadeCode: item.shadeCode || item.shade_code,
          totalQty: 0,
          totalSpent: 0,
        };
      }
      purchasedItemsMap[key].totalQty += Number(item.quantity || 0);
      purchasedItemsMap[key].totalSpent += Number(item.total || 0);
    });
  });

  const purchasedItemsList = Object.values(purchasedItemsMap).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '820px', padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div
          style={{
            background: 'var(--navy-900)',
            color: 'var(--white)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--navy-800)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 107, 0, 0.2)',
                  border: '1px solid rgba(255, 107, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--orange-500)'
                }}
              >
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--white)', margin: 0 }}>
                  {customer.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: '3px' }}>
                  <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>
                    {customer.customerType}
                  </span>
                  {customer.phone && <span>• Phone: {customer.phone}</span>}
                  {customer.address && <span>• Site: {customer.address}</span>}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ color: 'var(--slate-400)', padding: '6px', cursor: 'pointer' }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Analytics Highlights Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px',
            padding: '16px 24px',
            background: 'var(--slate-50)',
            borderBottom: '1px solid var(--slate-200)'
          }}
        >
          <div style={{ background: 'var(--white)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Lifetime Purchases
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '2px' }}>
              {settings.currency}{totalLifetimeSpent.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--emerald-600)', fontWeight: 600, marginTop: '2px' }}>
              Across {totalBillsCount} store visits
            </div>
          </div>

          <div style={{ background: 'var(--white)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase' }}>
              Orders Issued
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '2px' }}>
              {totalBillsCount} Bills
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', marginTop: '2px' }}>
              Avg Bill: {settings.currency}{avgBasketValue.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: 'var(--white)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase' }}>
              Outstanding Khata Balance
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: (customer.outstandingBalance || 0) > 0 ? 'var(--rose-600)' : 'var(--emerald-600)', marginTop: '2px' }}>
              {settings.currency}{(customer.outstandingBalance || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.7rem', color: (customer.outstandingBalance || 0) > 0 ? 'var(--rose-600)' : 'var(--emerald-600)', fontWeight: 600, marginTop: '2px' }}>
              {(customer.outstandingBalance || 0) > 0 ? 'Due from site' : 'Clear Account'}
            </div>
          </div>

          <div style={{ background: 'var(--white)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase' }}>
              Last Active Date
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)', marginTop: '4px' }}>
              {lastPurchaseDate}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              Credit Limit: {settings.currency}{(customer.creditLimit || 50000).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--slate-200)', background: 'var(--white)', padding: '0 24px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('bills')}
            style={{
              padding: '12px 16px',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: activeTab === 'bills' ? 'var(--orange-500)' : 'var(--slate-600)',
              borderBottom: activeTab === 'bills' ? '3px solid var(--orange-500)' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            <Receipt size={15} style={{ display: 'inline', marginRight: '6px' }} />
            Paper Bills & Invoices ({customerSales.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            style={{
              padding: '12px 16px',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: activeTab === 'products' ? 'var(--orange-500)' : 'var(--slate-600)',
              borderBottom: activeTab === 'products' ? '3px solid var(--orange-500)' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            <Package size={15} style={{ display: 'inline', marginRight: '6px' }} />
            Paints & Formulations Bought ({purchasedItemsList.length})
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '16px 24px' }}>
          {/* TAB 1: BILLS */}
          {activeTab === 'bills' && (
            <div>
              {customerSales.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--slate-400)' }}>
                  <Receipt size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600 }}>No paper bills or purchases recorded for this customer yet.</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                    Select this customer at the POS counter to start building their purchase history.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {customerSales.map((sale) => (
                    <div
                      key={sale.id || sale.billNumber}
                      style={{
                        background: 'var(--white)',
                        border: '1px solid var(--slate-200)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--navy-900)', fontSize: '0.95rem' }}>
                            {sale.billNumber}
                          </span>
                          <span
                            className={`badge ${
                              sale.paymentStatus === 'Added to Khata' || sale.paymentMode === 'Khata / Credit'
                                ? 'badge-warning'
                                : 'badge-success'
                            }`}
                            style={{ fontSize: '0.72rem' }}
                          >
                            {sale.paymentStatus || (sale.paymentMode === 'Khata / Credit' ? 'Added to Khata' : 'Paid')}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            • {sale.paymentMode}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                          Date: <strong>{sale.date}</strong> • {sale.items?.length || 1} line item(s)
                          {sale.items && (
                            <span style={{ marginLeft: '6px', color: 'var(--slate-600)' }}>
                              ({sale.items.map((it) => `${it.productName} (${it.quantity}x)`).join(', ')})
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                            {settings.currency}{Number(sale.netTotal ?? sale.net_total ?? 0).toLocaleString('en-IN')}
                          </div>
                          {sale.discount > 0 && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--rose-600)' }}>
                              Disc: -{settings.currency}{sale.discount}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedSaleForInvoice(sale);
                            setIsInvoiceModalOpen(true);
                          }}
                          title="View verified A4 Tax Invoice for this bill"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <Printer size={14} /> A4 Bill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTS BOUGHT */}
          {activeTab === 'products' && (
            <div>
              {purchasedItemsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--slate-400)' }}>
                  <Package size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600 }}>No products purchased yet.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product Description</th>
                      <th>Brand</th>
                      <th>Pack Size</th>
                      <th style={{ textAlign: 'center' }}>Total Quantity Bought</th>
                      <th style={{ textAlign: 'right' }}>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchasedItemsList.map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{it.productName}</div>
                          {it.shadeCode && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                              Shade: {it.shadeCode}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-brand">{it.brand}</span>
                        </td>
                        <td><strong>{it.packSize}</strong></td>
                        <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--navy-900)' }}>
                          {it.totalQty} units
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--navy-900)' }}>
                          {settings.currency}{it.totalSpent.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            background: 'var(--slate-50)',
            borderTop: '1px solid var(--slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="var(--emerald-500)" />
            <span>Customer purchase records are synchronized with database ledger & sales history.</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {(customer.outstandingBalance || 0) > 0 && onRecordPayment && (
              <button
                type="button"
                className="btn btn-accent btn-sm"
                onClick={() => {
                  onClose();
                  onRecordPayment(customer);
                }}
              >
                <ArrowDownRight size={14} /> Settle Khata (₹{customer.outstandingBalance})
              </button>
            )}
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Close Dossier
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Invoice Modal for viewing past bills */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        sale={selectedSaleForInvoice}
      />
    </div>
  );
};
