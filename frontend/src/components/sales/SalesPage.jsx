import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Printer,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Eye,
  X,
  CreditCard,
  Wallet,
  ShoppingBag,
  Sparkles,
  FlaskConical,
  FileText,
  PackageCheck,
  PackageX,
  MapPin,
  TrendingDown,
  Info,
  Search,
  Building2,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InvoiceModal } from '../invoice/InvoiceModal';
import { SAMPLE_INVOICE_FIXTURE } from '../invoice/sampleInvoiceFixture';
import { EditShopBillingModal } from './EditShopBillingModal';

export const SalesPage = () => {
  const { products, customers, sales, settings, createSale, setActivePage } = useApp();

  // Active form state for the paper bill
  const defaultBillNo = `${settings.billPrefix}${settings.nextBillNumber}`;
  const [billNumber, setBillNumber] = useState(defaultBillNo);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState('0');

  // Multi-item cart
  const [items, setItems] = useState([
    {
      productId: products[0]?.id || '',
      quantity: 1,
      unitPrice: products[0]?.unitPrice || 0
    }
  ]);

  // Review & Invoice modal state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDraftInvoiceModal, setIsDraftInvoiceModal] = useState(false);
  const [isEditShopModalOpen, setIsEditShopModalOpen] = useState(false);

  // Stock Availability Checker state
  const [isStockCheckerOpen, setIsStockCheckerOpen] = useState(false);
  const [stockCheckSearch, setStockCheckSearch] = useState('');
  const [selectedCheckProduct, setSelectedCheckProduct] = useState(null);

  // Filtered products for the stock checker search
  const stockCheckResults = useMemo(() => {
    if (!stockCheckSearch.trim()) return products;
    const q = stockCheckSearch.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.shadeCode && p.shadeCode.toLowerCase().includes(q)) ||
        p.packSize.toLowerCase().includes(q)
    );
  }, [products, stockCheckSearch]);

  // Stock status helper
  const getStockStatus = (product) => {
    if (!product) return { status: 'unknown', label: 'N/A', color: '#94A3B8' };
    const stock = product.currentStock ?? 0;
    const threshold = product.minThreshold || settings.lowStockThreshold || 5;
    if (stock === 0) {
      return { status: 'out', label: 'OUT OF STOCK', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.3)', icon: 'out' };
    }
    if (stock <= threshold) {
      return { status: 'low', label: 'LOW STOCK', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', icon: 'low' };
    }
    return { status: 'in', label: 'IN STOCK', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', icon: 'in' };
  };

  // Line item helpers
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      updated[index] = {
        productId: value,
        quantity: 1,
        unitPrice: prod ? prod.unitPrice : 0
      };
    } else if (field === 'quantity') {
      updated[index].quantity = Math.max(1, Number(value) || 1);
    } else if (field === 'unitPrice') {
      updated[index].unitPrice = Math.max(0, Number(value) || 0);
    }
    setItems(updated);
  };

  const handleAddItem = () => {
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        productId: defaultProd?.id || '',
        quantity: 1,
        unitPrice: defaultProd?.unitPrice || 0
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const calculatedItems = items.map((it) => {
    const prod = products.find((p) => p.id === it.productId) || {};
    const total = it.quantity * it.unitPrice;
    return {
      ...it,
      productName: prod.name || 'Custom Product',
      brand: prod.brand || '',
      shadeCode: prod.shadeCode || '',
      shadeHex: prod.shadeHex || '#FFF',
      packSize: prod.packSize || '',
      currentStock: prod.currentStock ?? 0,
      total
    };
  });

  const subtotal = calculatedItems.reduce((acc, it) => acc + it.total, 0);
  const discountVal = Number(discount) || 0;
  const netTotal = Math.max(0, subtotal - discountVal);

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);
  const customerDisplayName = selectedCustomerObj ? selectedCustomerObj.name : walkinName || 'Walk-in Retail Buyer';
  const customerDisplayPhone = selectedCustomerObj ? selectedCustomerObj.phone : walkinPhone;

  // Handle open review
  const handleOpenReview = (e) => {
    e.preventDefault();
    if (items.length === 0 || subtotal <= 0) {
      alert('Please add at least one valid paint product to the bill.');
      return;
    }

    // Check stock sufficiency before opening review
    const shortItems = calculatedItems.filter((it) => it.quantity > it.currentStock);
    if (shortItems.length > 0) {
      const details = shortItems
        .map((it) => `• ${it.productName} (${it.shadeCode}): Requested ${it.quantity}, Available ${it.currentStock}`)
        .join('\n');
      alert(`Cannot create bill due to insufficient stock:\n\n${details}\n\nPlease reduce quantities or receive stock first.`);
      return;
    }

    setIsReviewOpen(true);
  };

  // Final confirmation
  const handleConfirmSale = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const salePayload = {
        billNumber: billNumber.trim() || `${settings.billPrefix}${settings.nextBillNumber}`,
        customerId: selectedCustomerId || null,
        customerName: customerDisplayName,
        customerPhone: customerDisplayPhone,
        paymentMode,
        paymentStatus: paymentMode === 'Khata / Credit' ? 'Added to Khata' : 'Paid',
        items: calculatedItems,
        subtotal,
        discount: discountVal,
        netTotal,
        notes
      };

      const confirmed = await createSale(salePayload);
      setIsReviewOpen(false);
      setCompletedSale(confirmed);
      setSelectedInvoiceForModal(confirmed);
      setIsDraftInvoiceModal(false);
      setIsInvoiceModalOpen(true);

      // Reset form for next sale
      setBillNumber(`${settings.billPrefix}${settings.nextBillNumber + 1}`);
      setSelectedCustomerId('');
      setWalkinName('');
      setWalkinPhone('');
      setDiscount('0');
      setNotes('');
      setItems([
        {
          productId: products[0]?.id || '',
          quantity: 1,
          unitPrice: products[0]?.unitPrice || 0
        }
      ]);
    } catch (err) {
      console.error('Sale confirmation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-content">
      {/* Top Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            Paper Bill Counter & POS
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
            Generate paper invoices, calculate discounts & taxes, and update stock automatically
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsEditShopModalOpen(true)}
            title="Edit shop name, store ID, GSTIN, phone, address, and bill sequence"
            style={{ display: 'flex', alignItems: 'center', gap: '7px' }}
          >
            <Building2 size={16} color="var(--brand-primary-light)" />
            <span>Edit Shop & Bill Details</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setIsStockCheckerOpen(true);
              setSelectedCheckProduct(null);
              setStockCheckSearch('');
            }}
            title="Check if a paint product is available in the shop before billing"
          >
            <PackageCheck size={16} />
            <span>Check Stock Availability</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSelectedInvoiceForModal(SAMPLE_INVOICE_FIXTURE);
              setIsDraftInvoiceModal(false);
              setIsInvoiceModalOpen(true);
            }}
            title="Preview isolated sample fixture for testing printer without affecting shop records"
          >
            <FlaskConical size={16} color="var(--orange-500)" />
            <span>Sample A4 Bill (Demo Fixture)</span>
          </button>

          {completedSale && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setSelectedInvoiceForModal(completedSale);
                setIsDraftInvoiceModal(false);
                setIsInvoiceModalOpen(true);
              }}
            >
              <Printer size={16} /> Print Finalized Bill ({completedSale.billNumber})
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Left: Billing Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Receipt size={18} color="var(--orange-500)" />
              New Paper Bill Entry
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Bill #</span>
              <input
                type="text"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  padding: '4px 8px',
                  width: '135px',
                  border: '1px solid var(--slate-300)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--navy-900)'
                }}
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                title="Paper bill serial number from shop receipt book"
              />
            </div>
          </div>

          <form onSubmit={handleOpenReview}>
            <div className="card-body">
              {/* Customer Selector */}
              <div style={{ background: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--slate-200)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-600)', marginBottom: '10px' }}>
                  Customer Information
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Select Registered Painter / Contractor (Optional)</label>
                  <select
                    className="form-select"
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      if (e.target.value) {
                        setWalkinName('');
                        setWalkinPhone('');
                      }
                    }}
                  >
                    <option value="">-- Or enter walk-in homeowner below --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.customerType}) — Outstanding Khata: {settings.currency}{c.outstandingBalance}
                      </option>
                    ))}
                  </select>
                </div>

                {!selectedCustomerId && (
                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Walk-in Buyer Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Anand Kumar"
                        value={walkinName}
                        onChange={(e) => setWalkinName(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. +91 98110-00000"
                        value={walkinPhone}
                        onChange={(e) => setWalkinPhone(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-600)' }}>
                    Paint Products & Quantities
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={handleAddItem}
                  >
                    <Plus size={14} /> Add Another Paint Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {calculatedItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--white)',
                        border: '1px solid var(--slate-200)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span
                          className="shade-circle"
                          style={{ backgroundColor: item.shadeHex || '#FFF', width: '20px', height: '20px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <select
                            className="form-select"
                            value={item.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} — {p.brand} ({p.packSize}) | Shade: {p.shadeCode} [In Stock: {p.currentStock}]
                              </option>
                            ))}
                          </select>
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            style={{ color: 'var(--rose-600)', padding: '6px' }}
                            title="Remove this item"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', alignItems: 'center' }}>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'block' }}>
                            Qty (Packs)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={item.currentStock > 0 ? item.currentStock : 99}
                            className="form-control"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'block' }}>
                            Rate ({settings.currency})
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          />
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <label style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'block' }}>
                            Item Total
                          </label>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '6px' }}>
                            {settings.currency}
                            {item.total.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      {item.currentStock < item.quantity && (
                        <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--rose-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} />
                          <span>Warning: Available stock is only {item.currentStock} units.</span>
                        </div>
                      )}

                      {/* Real-time Stock Availability Indicator */}
                      {(() => {
                        const status = getStockStatus(products.find(p => p.id === item.productId));
                        return (
                          <div
                            style={{
                              marginTop: '8px',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-md)',
                              background: status.bg,
                              border: `1px solid ${status.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {status.status === 'in' && <PackageCheck size={14} color={status.color} />}
                              {status.status === 'low' && <AlertTriangle size={14} color={status.color} />}
                              {status.status === 'out' && <PackageX size={14} color={status.color} />}
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: status.color, letterSpacing: '0.5px' }}>
                                {status.label}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '0.73rem', color: 'var(--slate-600)' }}>
                                <strong>{item.currentStock}</strong> packs in shop
                              </span>
                              {(() => {
                                const prod = products.find(p => p.id === item.productId);
                                return prod?.locationRack ? (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <MapPin size={10} /> {prod.locationRack}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Discount */}
              <div className="form-row" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Payment Mode *</label>
                  <select
                    className="form-select"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="Cash">Cash Counter</option>
                    <option value="UPI (GPay / PhonePe)">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Debit / Credit Card">Debit / Credit Card</option>
                    <option value="Khata / Credit">Khata / Credit Ledger (Pay Later)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Special Discount ({settings.currency})</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Billing Note / Tinting Details</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 2 tins tinted with exterior colorant. Delivered to site."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Bill Summary Bar */}
              <div
                style={{
                  background: 'var(--navy-900)',
                  color: 'var(--white)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '20px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Total Payable Amount</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--white)' }}>
                    {settings.currency}
                    {netTotal.toLocaleString('en-IN')}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-accent"
                  style={{ padding: '10px 22px', fontSize: '0.95rem' }}
                >
                  <Eye size={16} /> Review Paper Bill
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right: Last Bill / Paper Bill Preview Quick Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">
                <Printer size={18} color="var(--brand-primary-light)" />
                Paper Bill Format Sample
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => setIsEditShopModalOpen(true)}
                  style={{ fontSize: '0.74rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Edit shop name, store ID, GSTIN, and billing header details"
                >
                  <Edit3 size={12} /> Edit Shop Info
                </button>
                <span className="badge badge-brand">Official Layout</span>
              </div>
            </div>
            <div className="card-body">
              <div className="bill-paper-sheet">
                <div className="bill-watermark">SAMPLE BILL PREVIEW</div>
                <div className="bill-header-row">
                  <div
                    onClick={() => setIsEditShopModalOpen(true)}
                    style={{ cursor: 'pointer' }}
                    title="Click to edit shop name, ID, and details"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className="bill-shop-name">{settings.shopName}</div>
                      <Edit3 size={13} color="var(--brand-primary-light)" style={{ opacity: 0.8 }} />
                    </div>
                    <div className="bill-meta-tag">{settings.tagline}</div>
                    <div className="bill-meta-tag">{settings.address}</div>
                    <div className="bill-meta-tag" style={{ color: 'var(--cyan-400)', fontWeight: 600 }}>
                      Store ID: {settings.shopId || 'SHOP-HYD-042'} | GSTIN: {settings.gstin}
                    </div>
                  </div>
                  <div className="bill-no-box">
                    <div className="bill-no-title">Paper Bill No.</div>
                    <div className="bill-no-code">{billNumber}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                      Date: {new Date().toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', marginBottom: '14px', borderBottom: '1px solid var(--slate-200)', paddingBottom: '8px' }}>
                  <strong>Billed To:</strong> {customerDisplayName} {customerDisplayPhone ? `(${customerDisplayPhone})` : ''}
                  <br />
                  <strong>Payment Mode:</strong> {paymentMode}
                </div>

                <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse', marginBottom: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--slate-300)', textAlign: 'left', color: 'var(--slate-600)' }}>
                      <th style={{ padding: '4px 0' }}>Item & Shade</th>
                      <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '4px 0' }}>Rate</th>
                      <th style={{ textAlign: 'right', padding: '4px 0' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculatedItems.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px dashed var(--slate-200)' }}>
                        <td style={{ padding: '6px 0' }}>
                          <div style={{ fontWeight: 600 }}>{it.productName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                            {it.brand} {it.packSize} • Shade: {it.shadeCode}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '6px 0' }}>{it.quantity}</td>
                        <td style={{ textAlign: 'right', padding: '6px 0' }}>{settings.currency}{it.unitPrice}</td>
                        <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: 700 }}>
                          {settings.currency}{it.total.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ borderTop: '2px solid var(--navy-900)', paddingTop: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Subtotal:</span>
                    <span>{settings.currency}{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discountVal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--rose-600)' }}>
                      <span>Discount:</span>
                      <span>-{settings.currency}{discountVal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                    <span>Grand Total:</span>
                    <span>{settings.currency}{netTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ marginTop: '14px', fontSize: '0.68rem', color: 'var(--slate-500)', textAlign: 'center', borderTop: '1px solid var(--slate-200)', paddingTop: '8px' }}>
                  {settings.billFooterNote}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Paper Bills / Invoices Archive */}
      <div className="card" style={{ marginTop: '28px' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div className="card-title">
            <Receipt size={18} color="var(--navy-700)" />
            Recent Paper Bills & Finalized Invoices ({sales.length})
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
            Official records: Re-printing retrieves existing invoice and will never deduct stock again
          </span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Mode</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'center' }}>Print Action</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--slate-400)' }}>
                    No finalized bills recorded yet. Create a bill above to generate an invoice.
                  </td>
                </tr>
              ) : (
                sales.slice(0, 8).map((s) => (
                  <tr key={s.id || s.billNumber}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--navy-900)' }}>
                      {s.billNumber}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>{s.date}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{s.customerName}</div>
                      {s.customerPhone && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>{s.customerPhone}</div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {s.items?.length || 1} {s.items?.length === 1 ? 'item' : 'items'}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                        {s.paymentMode}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          s.paymentStatus === 'Added to Khata' || s.paymentMode === 'Khata / Credit'
                            ? 'badge-warning'
                            : 'badge-success'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {s.paymentStatus || (s.paymentMode === 'Khata / Credit' ? 'Khata' : 'Paid')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--navy-900)' }}>
                      {settings.currency}
                      {Number(s.netTotal ?? s.net_total ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedInvoiceForModal(s);
                          setIsDraftInvoiceModal(false);
                          setIsInvoiceModalOpen(true);
                        }}
                        title={`View & print finalized A4 invoice for ${s.billNumber}`}
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        <Printer size={14} /> Print A4 Bill
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Before Confirming Modal */}
      {isReviewOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Receipt size={20} color="var(--orange-500)" />
                Review Paper Bill Before Confirming
              </div>
              <button onClick={() => setIsReviewOpen(false)} style={{ color: 'var(--slate-400)' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: 'var(--orange-50)', border: '1px solid var(--orange-100)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.82rem', color: 'var(--orange-600)' }}>
                <strong>Confirmation Step:</strong> Please verify quantities and paper bill sequence with the customer before recording the sale.
              </div>

              <div className="bill-paper-sheet" style={{ marginBottom: '16px' }}>
                <div className="bill-header-row">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div className="bill-shop-name">{settings.shopName}</div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setIsReviewOpen(false);
                          setIsEditShopModalOpen(true);
                        }}
                        style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Edit shop name, store ID, and billing details"
                      >
                        <Edit3 size={12} /> Edit Header
                      </button>
                    </div>
                    <div className="bill-meta-tag">{settings.address}</div>
                    <div className="bill-meta-tag">
                      Store ID: {settings.shopId || 'SHOP-HYD-042'} | Phone: {settings.phone} | GSTIN: {settings.gstin}
                    </div>
                  </div>
                  <div className="bill-no-box">
                    <div className="bill-no-title">Paper Bill #</div>
                    <div className="bill-no-code">{billNumber}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', marginBottom: '12px', background: 'var(--slate-50)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <strong>Customer:</strong> {customerDisplayName}
                    {customerDisplayPhone && <div>Phone: {customerDisplayPhone}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>Payment:</strong> {paymentMode}
                    <div>Date: {new Date().toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', marginBottom: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--slate-300)', textAlign: 'left', color: 'var(--slate-600)' }}>
                      <th style={{ padding: '6px 0' }}>Item & Shade</th>
                      <th style={{ textAlign: 'center', padding: '6px 0' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '6px 0' }}>Rate</th>
                      <th style={{ textAlign: 'right', padding: '6px 0' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculatedItems.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px dashed var(--slate-200)' }}>
                        <td style={{ padding: '6px 0' }}>
                          <span style={{ fontWeight: 600 }}>{it.productName}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'block' }}>
                            {it.brand} {it.packSize} • {it.shadeCode}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '6px 0' }}>{it.quantity}</td>
                        <td style={{ textAlign: 'right', padding: '6px 0' }}>{settings.currency}{it.unitPrice}</td>
                        <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: 700 }}>
                          {settings.currency}{it.total.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ borderTop: '2px solid var(--navy-900)', paddingTop: '8px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Subtotal:</span>
                    <span>{settings.currency}{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discountVal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--rose-600)' }}>
                      <span>Discount Given:</span>
                      <span>-{settings.currency}{discountVal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                    <span>Grand Total:</span>
                    <span>{settings.currency}{netTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {notes && (
                  <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--slate-600)', fontStyle: 'italic' }}>
                    Note: {notes}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isSubmitting}
                onClick={() => {
                  const draftInvoice = {
                    billNumber: `${billNumber.trim()} (DRAFT)`,
                    date: new Date().toLocaleDateString('en-IN'),
                    customerName: customerDisplayName,
                    customerPhone: customerDisplayPhone,
                    customerAddress: selectedCustomerObj?.address || 'Site delivery pending',
                    customerType: selectedCustomerObj?.customerType || 'Walk-in',
                    paymentMode,
                    items: calculatedItems,
                    subtotal,
                    discount: discountVal,
                    netTotal,
                    amountPaid: paymentMode === 'Khata / Credit' ? 0 : netTotal,
                    notes
                  };
                  setSelectedInvoiceForModal(draftInvoice);
                  setIsDraftInvoiceModal(true);
                  setIsInvoiceModalOpen(true);
                }}
                title="Preview draft invoice without deducting stock"
              >
                <Eye size={16} /> Draft A4 Preview
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                  onClick={() => setIsReviewOpen(false)}
                >
                  Modify / Go Back
                </button>
                <button
                  type="button"
                  className="btn btn-accent"
                  disabled={isSubmitting}
                  onClick={handleConfirmSale}
                >
                  {isSubmitting ? (
                    <>Processing & Verifying Stock...</>
                  ) : (
                    <>
                      <CheckCircle size={16} /> Confirm & Deduct Stock
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Stock Availability Checker Modal */}
      {isStockCheckerOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <PackageCheck size={20} color="var(--emerald-600)" />
                Stock Availability Checker
              </div>
              <button
                onClick={() => {
                  setIsStockCheckerOpen(false);
                  setSelectedCheckProduct(null);
                  setStockCheckSearch('');
                }}
                style={{ color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Search Bar */}
              <div
                className="search-input-wrapper"
                style={{ marginBottom: '16px', position: 'relative' }}
              >
                <Search size={16} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search paint by name, brand, shade code, category, or pack size..."
                  value={stockCheckSearch}
                  onChange={(e) => {
                    setStockCheckSearch(e.target.value);
                    setSelectedCheckProduct(null);
                  }}
                  autoFocus
                />
                {stockCheckSearch && (
                  <button
                    onClick={() => {
                      setStockCheckSearch('');
                      setSelectedCheckProduct(null);
                    }}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Summary Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}>
                    {products.filter(p => p.currentStock > (p.minThreshold || settings.lowStockThreshold || 5)).length}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#10B981' }}>IN STOCK</div>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F59E0B' }}>
                    {products.filter(p => p.currentStock > 0 && p.currentStock <= (p.minThreshold || settings.lowStockThreshold || 5)).length}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#F59E0B' }}>LOW STOCK</div>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F43F5E' }}>
                    {products.filter(p => p.currentStock === 0).length}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#F43F5E' }}>OUT OF STOCK</div>
                </div>
              </div>

              {/* Product List */}
              <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)' }}>
                {stockCheckResults.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--slate-400)' }}>
                    <PackageX size={36} style={{ margin: '0 auto 8px', display: 'block' }} />
                    <div style={{ fontWeight: 600 }}>No products match your search</div>
                    <div style={{ fontSize: '0.8rem' }}>Try a different shade code, brand, or product name</div>
                  </div>
                ) : (
                  stockCheckResults.map((p) => {
                    const status = getStockStatus(p);
                    const isSelected = selectedCheckProduct?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedCheckProduct(isSelected ? null : p)}
                        style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid var(--slate-100)',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--slate-50)' : 'var(--white)',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--slate-25, #FAFBFC)'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--white)'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                            <span
                              className="shade-circle"
                              style={{ backgroundColor: p.shadeHex || '#FFF', width: '28px', height: '28px', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {p.name}
                              </div>
                              <div style={{ fontSize: '0.73rem', color: 'var(--slate-500)' }}>
                                {p.brand} • {p.packSize} • {p.shadeCode}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: status.color }}>
                              {p.currentStock}
                            </span>
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: '20px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                                background: status.bg,
                                color: status.color,
                                border: `1px solid ${status.border}`,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {status.status === 'in' && '✅ '}
                              {status.status === 'low' && '⚠️ '}
                              {status.status === 'out' && '❌ '}
                              {status.label}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Detail Panel */}
                        {isSelected && (
                          <div
                            style={{
                              marginTop: '12px',
                              padding: '14px',
                              background: status.bg,
                              border: `1px solid ${status.border}`,
                              borderRadius: 'var(--radius-md)'
                            }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                              <div>
                                <div style={{ color: 'var(--slate-500)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
                                  Current Stock
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '1.3rem', color: status.color }}>
                                  {p.currentStock} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>packs</span>
                                </div>
                              </div>
                              <div>
                                <div style={{ color: 'var(--slate-500)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
                                  Reorder Alert Level
                                </div>
                                <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                                  ≤ {p.minThreshold || settings.lowStockThreshold || 5} packs
                                </div>
                              </div>
                              <div>
                                <div style={{ color: 'var(--slate-500)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
                                  Rack Location
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <MapPin size={12} color="var(--slate-500)" /> {p.locationRack || 'Main Shelf'}
                                </div>
                              </div>
                              <div>
                                <div style={{ color: 'var(--slate-500)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
                                  Selling Price
                                </div>
                                <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                                  {settings.currency}{p.unitPrice?.toLocaleString('en-IN')}
                                </div>
                              </div>
                            </div>

                            {/* Stock Movement Summary */}
                            <div style={{ marginTop: '12px', padding: '10px', background: 'var(--white)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
                              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-500)', marginBottom: '8px' }}>
                                Stock Movement Summary
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                                <div>
                                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-700)' }}>{p.openingStock ?? 0}</div>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--slate-500)' }}>Opening</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669' }}>+{p.stockReceived ?? 0}</div>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--slate-500)' }}>Received</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#D97706' }}>-{p.soldQuantity ?? 0}</div>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--slate-500)' }}>Sold</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#DC2626' }}>-{p.damagedStock ?? 0}</div>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--slate-500)' }}>Damaged</div>
                                </div>
                              </div>
                            </div>

                            {/* Availability Message */}
                            <div style={{
                              marginTop: '10px',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              background: status.status === 'out' ? '#FEE2E2' : status.status === 'low' ? '#FEF3C7' : '#D1FAE5',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: status.color,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              {status.status === 'in' && (
                                <>
                                  <PackageCheck size={14} />
                                  This product is available in the shop. You can proceed to bill it.
                                </>
                              )}
                              {status.status === 'low' && (
                                <>
                                  <AlertTriangle size={14} />
                                  Running low! Only {p.currentStock} packs left. Consider ordering from the depot soon.
                                </>
                              )}
                              {status.status === 'out' && (
                                <>
                                  <PackageX size={14} />
                                  This product is NOT available in the shop. Please receive stock from depot before selling.
                                </>
                              )}
                            </div>

                            {/* Distributor Info */}
                            {p.distributor && (
                              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                                <Info size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                                Distributor / Depot: <strong>{p.distributor}</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--slate-500)', textAlign: 'center' }}>
                Click on any product to see detailed stock availability • Showing {stockCheckResults.length} of {products.length} products
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsStockCheckerOpen(false);
                  setSelectedCheckProduct(null);
                  setStockCheckSearch('');
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* A4 Tax Invoice & Print Dialog Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        sale={selectedInvoiceForModal}
        isDraft={isDraftInvoiceModal}
      />

      {/* Edit Shop & Billing Details Modal */}
      <EditShopBillingModal
        isOpen={isEditShopModalOpen}
        onClose={() => setIsEditShopModalOpen(false)}
        onUpdated={(updated) => {
          if (updated.billPrefix && (!billNumber || billNumber.startsWith(settings.billPrefix))) {
            setBillNumber(`${updated.billPrefix}${updated.nextBillNumber || settings.nextBillNumber}`);
          }
        }}
      />
    </div>
  );
};
