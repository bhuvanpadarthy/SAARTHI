import React from 'react';
import { useApp } from '../../context/AppContext';

export const InvoiceA4 = ({
  sale,
  isDraft = false,
  language = 'bilingual', // 'bilingual' | 'english' | 'telugu'
}) => {
  const { settings } = useApp();

  if (!sale) return null;

  // Language label dictionaries
  const labels = {
    invoiceTitle: {
      en: 'TAX INVOICE / CASH BILL',
      te: 'పన్ను రసీదు / నగదు బిల్లు',
    },
    draftTitle: {
      en: 'DRAFT ESTIMATE / PREVIEW (NOT AN OFFICIAL BILL)',
      te: 'డ్రాఫ్ట్ అంచనా / ప్రివ్యూ (అధికారిక బిల్లు కాదు)',
    },
    billNo: { en: 'Invoice No:', te: 'బిల్లు సంఖ్య:' },
    date: { en: 'Date & Time:', te: 'తేదీ & సమయం:' },
    paymentMode: { en: 'Payment Mode:', te: 'చెల్లింపు విధానం:' },
    paymentStatus: { en: 'Status:', te: 'స్థితి:' },
    billedTo: { en: 'Billed To (Customer Details):', te: 'కస్టమర్ వివరాలు:' },
    phone: { en: 'Phone:', te: 'ఫోన్:' },
    address: { en: 'Site / Address:', te: 'సైట్ / చిరునామా:' },
    accountType: { en: 'Category:', te: 'రకం:' },
    colSl: { en: 'S.No', te: 'క్ర.సం' },
    colItem: { en: 'Product Description & Brand', te: 'పెయింట్ వివరాలు & బ్రాండ్' },
    colPack: { en: 'Pack Size', te: 'ప్యాక్' },
    colShade: { en: 'Shade Code', te: 'రంగు కోడ్' },
    colQty: { en: 'Qty', te: 'పరిమాణం' },
    colRate: { en: 'Rate', te: 'ధర' },
    colTotal: { en: 'Amount', te: 'మొత్తం' },
    subtotal: { en: 'Gross Subtotal:', te: 'ఉప మొత్తం:' },
    discount: { en: 'Special Discount:', te: 'తగ్గింపు:' },
    tax: { en: 'Taxes / GST:', te: 'వర్తించే పన్ను:' },
    netTotal: { en: 'Grand Total:', te: 'నికర మొత్తం:' },
    amountPaid: { en: 'Amount Paid:', te: 'చెల్లించిన మొత్తం:' },
    balanceDue: { en: 'Balance Due (Khata):', te: 'మిగిలిన బకాయి:' },
    termsTitle: { en: 'Terms & Conditions:', te: 'నిబంధనలు:' },
    authorizedSign: { en: 'For SAARTHI Paints (Authorized Signatory)', te: 'అధీకృత సంతకం' },
    customerSign: { en: "Customer's Signature / Acceptance", te: 'కస్టమర్ సంతకం' },
  };

  const getLabel = (key) => {
    const l = labels[key];
    if (!l) return '';
    if (language === 'english') return l.en;
    if (language === 'telugu') return l.te;
    return `${l.en} / ${l.te}`;
  };

  // Tax calculations without assuming GST registration
  const hasGst = Boolean(settings.gstin && settings.gstin.trim() !== '');
  const items = sale.items || [];
  const subtotal = Number(sale.subtotal || 0);
  const discount = Number(sale.discount || 0);
  const netTotal = Number(sale.netTotal ?? sale.net_total ?? 0);

  // Khata / Payment logic
  const isKhata = sale.paymentMode === 'Khata / Credit' || sale.payment_mode === 'Khata / Credit';
  const amountPaid = isKhata ? 0 : Number(sale.amountPaid ?? netTotal);
  const balanceDue = isKhata ? netTotal : Math.max(0, netTotal - amountPaid);

  return (
    <div className="a4-invoice-wrapper" id="a4-invoice-container">
      {/* Watermarks */}
      {isDraft && (
        <div className="invoice-draft-watermark" aria-hidden="true">
          DRAFT PREVIEW • డ్రాఫ్ట్ అంచనా
        </div>
      )}
      {sale.is_demo_fixture && (
        <div className="invoice-fixture-badge">
          SAMPLE DEMONSTRATION FIXTURE • నమూనా రసీదు (TESTING ONLY)
        </div>
      )}

      {/* 1. Header Section */}
      <div className="a4-invoice-header">
        <div className="a4-shop-details">
          <h1 className="a4-shop-title">{settings.shopName}</h1>
          {settings.tagline && <div className="a4-shop-subtitle">{settings.tagline}</div>}
          <div className="a4-shop-info">
            {settings.address && <span>{settings.address}</span>}
            {settings.phone && <span> • Phone / ఫోన్: {settings.phone}</span>}
            {settings.email && <span> • {settings.email}</span>}
          </div>
          <div className="a4-shop-tax-id">
            {hasGst ? (
              <strong>GSTIN / పన్ను నంబర్: {settings.gstin}</strong>
            ) : (
              <span>Retail Tax Invoice (Composition / Regular Scheme)</span>
            )}
          </div>
        </div>

        <div className="a4-invoice-title-box">
          <div className="a4-title-tag">
            {isDraft ? getLabel('draftTitle') : getLabel('invoiceTitle')}
          </div>
          <div className="a4-meta-row">
            <span className="a4-meta-label">{getLabel('billNo')}</span>
            <span className="a4-meta-value bill-number-text">{sale.billNumber || sale.bill_number}</span>
          </div>
          <div className="a4-meta-row">
            <span className="a4-meta-label">{getLabel('date')}</span>
            <span className="a4-meta-value">{sale.date || new Date().toLocaleDateString('en-IN')}</span>
          </div>
          <div className="a4-meta-row">
            <span className="a4-meta-label">{getLabel('paymentMode')}</span>
            <span className="a4-meta-value">{sale.paymentMode || sale.payment_mode || 'Cash'}</span>
          </div>
        </div>
      </div>

      {/* 2. Customer Parties Box */}
      <div className="a4-parties-box">
        <div className="a4-customer-col">
          <div className="a4-section-heading">{getLabel('billedTo')}</div>
          <div className="a4-cust-name">{sale.customerName || sale.customer_name || 'Walk-in Retail Buyer'}</div>
          {sale.customerPhone && (
            <div className="a4-cust-detail">
              <strong>{getLabel('phone')}</strong> {sale.customerPhone}
            </div>
          )}
          {sale.customerAddress && (
            <div className="a4-cust-detail">
              <strong>{getLabel('address')}</strong> {sale.customerAddress}
            </div>
          )}
          {sale.customerType && (
            <div className="a4-cust-detail">
              <strong>{getLabel('accountType')}</strong> {sale.customerType}
            </div>
          )}
        </div>

        <div className="a4-status-col">
          <div className="a4-section-heading">{getLabel('paymentStatus')}</div>
          <div className={`a4-status-badge ${isKhata ? 'status-khata' : 'status-paid'}`}>
            {isKhata ? 'ADDED TO KHATA / ఖాతాలో చేర్చబడింది' : 'FULLY PAID / పూర్తిగా చెల్లించబడింది'}
          </div>
          <div className="a4-status-note">
            {isKhata
              ? 'Debit recorded in customer ledger. To be settled on project milestone.'
              : 'Payment confirmed and counter receipt acknowledged.'}
          </div>
        </div>
      </div>

      {/* 3. Itemized Products Table */}
      <table className="a4-table">
        <thead>
          <tr>
            <th style={{ width: '38px', textAlign: 'center' }}>{getLabel('colSl')}</th>
            <th>{getLabel('colItem')}</th>
            <th style={{ width: '75px', textAlign: 'center' }}>{getLabel('colPack')}</th>
            <th style={{ width: '130px' }}>{getLabel('colShade')}</th>
            <th style={{ width: '60px', textAlign: 'center' }}>{getLabel('colQty')}</th>
            <th style={{ width: '90px', textAlign: 'right' }}>{getLabel('colRate')}</th>
            <th style={{ width: '100px', textAlign: 'right' }}>{getLabel('colTotal')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx}>
              <td style={{ textAlign: 'center' }}>{idx + 1}</td>
              <td>
                <div className="a4-item-title">{it.productName || it.product_name}</div>
                <div className="a4-item-brand">
                  {it.brand} {it.category ? `• ${it.category}` : ''}
                </div>
              </td>
              <td style={{ textAlign: 'center', fontWeight: 600 }}>
                {it.packSize || it.pack_size || it.unitOfMeasure || 'L'}
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {it.shadeHex && (
                    <span
                      className="a4-shade-swatch"
                      style={{ backgroundColor: it.shadeHex }}
                      title={it.shadeHex}
                    />
                  )}
                  <span className="a4-shade-text">{it.shadeCode || it.shade_code || 'Standard'}</span>
                </div>
              </td>
              <td style={{ textAlign: 'center', fontWeight: 700 }}>
                {it.quantity} {it.unitOfMeasure || 'Units'}
              </td>
              <td style={{ textAlign: 'right' }}>
                {settings.currency}{Number(it.unitPrice || it.unit_price).toLocaleString('en-IN')}
              </td>
              <td style={{ textAlign: 'right', fontWeight: 700 }}>
                {settings.currency}{Number(it.total).toLocaleString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 4. Totals & Settlement Calculation */}
      <div className="a4-calculation-row">
        <div className="a4-terms-box">
          <div className="a4-terms-title">{getLabel('termsTitle')}</div>
          <ol className="a4-terms-list">
            <li>
              <strong>Tinting Policy:</strong> {settings.billFooterNote || 'Goods once tinted to custom shade cannot be returned or exchanged.'}
            </li>
            <li>
              <strong>తెలుగు నిబంధన:</strong> ప్రత్యేకంగా టింట్ చేసిన రంగులు వాపసు లేదా మార్చబడవు.
            </li>
            <li>Subject to local jurisdiction. Computer-generated official invoice.</li>
          </ol>
        </div>

        <div className="a4-summary-box">
          <div className="a4-sum-line">
            <span>{getLabel('subtotal')}</span>
            <span>{settings.currency}{subtotal.toLocaleString('en-IN')}</span>
          </div>

          {discount > 0 && (
            <div className="a4-sum-line text-discount">
              <span>{getLabel('discount')}</span>
              <span>-{settings.currency}{discount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="a4-sum-line tax-note">
            <span>{getLabel('tax')}</span>
            <span>
              {hasGst ? 'GST Inclusive (Central & State Taxes)' : 'Taxes Included / Composition'}
            </span>
          </div>

          <div className="a4-sum-line grand-total-line">
            <span>{getLabel('netTotal')}</span>
            <span className="grand-total-amount">
              {settings.currency}{netTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="a4-payment-split">
            <div className="a4-split-row">
              <span>{getLabel('amountPaid')}</span>
              <span style={{ fontWeight: 700, color: amountPaid > 0 ? '#059669' : '#6B7280' }}>
                {settings.currency}{amountPaid.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="a4-split-row balance-row">
              <span>{getLabel('balanceDue')}</span>
              <span style={{ fontWeight: 800, color: balanceDue > 0 ? '#DC2626' : '#059669' }}>
                {settings.currency}{balanceDue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Signatures Footer */}
      <div className="a4-signatures-footer">
        <div className="a4-sign-block">
          <div className="a4-sign-line"></div>
          <div className="a4-sign-label">{getLabel('customerSign')}</div>
        </div>

        <div className="a4-sign-block text-right">
          <div className="a4-sign-stamp-box">
            <span className="a4-stamp-text">FOR {settings.shopName.toUpperCase()}</span>
          </div>
          <div className="a4-sign-label">{getLabel('authorizedSign')}</div>
        </div>
      </div>
    </div>
  );
};
