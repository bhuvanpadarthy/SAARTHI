import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertCircle,
  X,
  Wallet,
  ArrowDownRight,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerPurchasesModal } from './CustomerPurchasesModal';

export const CustomersPage = () => {
  const { customers, addCustomer, recordCustomerPayment, settings, totalOutstandingCredit } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterBalance, setFilterBalance] = useState('ALL');

  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState({ open: false, customer: null, amount: '', paymentMethod: 'Cash' });
  const [selectedCustomerForPurchases, setSelectedCustomerForPurchases] = useState(null);
  const [isPurchasesModalOpen, setIsPurchasesModalOpen] = useState(false);

  // New customer form
  const [newCustData, setNewCustData] = useState({
    name: '',
    customerType: 'Contractor',
    phone: '',
    address: '',
    outstandingBalance: '0'
  });

  const customerTypes = ['ALL', 'Contractor', 'Painter', 'Commercial', 'Homeowner'];

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q));

      const matchesType = filterType === 'ALL' || c.customerType === filterType;

      let matchesBal = true;
      if (filterBalance === 'HAS_BALANCE') {
        matchesBal = (c.outstandingBalance || 0) > 0;
      } else if (filterBalance === 'ZERO') {
        matchesBal = (c.outstandingBalance || 0) === 0;
      }

      return matchesSearch && matchesType && matchesBal;
    });
  }, [customers, searchTerm, filterType, filterBalance]);

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustData.name) {
      alert('Please enter a customer name.');
      return;
    }

    addCustomer({
      ...newCustData,
      outstandingBalance: Number(newCustData.outstandingBalance || 0),
      totalPurchases: Number(newCustData.outstandingBalance || 0)
    });

    setIsAddCustomerOpen(false);
    setNewCustData({
      name: '',
      customerType: 'Contractor',
      phone: '',
      address: '',
      outstandingBalance: '0'
    });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentModal.customer || !paymentModal.amount) return;
    recordCustomerPayment(paymentModal.customer.id, paymentModal.amount, paymentModal.paymentMethod);
    setPaymentModal({ open: false, customer: null, amount: '', paymentMethod: 'Cash' });
  };

  return (
    <div className="page-content">
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            Customer Accounts & Khata Ledger
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
            Track contractor credit accounts, painter balances, and retail homeowner history
          </p>
        </div>

        <button className="btn btn-accent" onClick={() => setIsAddCustomerOpen(true)}>
          <Plus size={16} /> Add New Customer
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="metrics-grid" style={{ marginBottom: '20px' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Registered Accounts</span>
            <div className="metric-icon-wrap navy">
              <Users size={20} />
            </div>
          </div>
          <div className="metric-value">{customers.length}</div>
          <div className="metric-footer">
            <span>Contractors, master painters & homeowners</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Outstanding Khata Credit</span>
            <div className="metric-icon-wrap orange">
              <Wallet size={20} />
            </div>
          </div>
          <div className="metric-value">
            {settings.currency}
            {totalOutstandingCredit.toLocaleString('en-IN')}
          </div>
          <div className="metric-footer">
            <span style={{ color: 'var(--orange-600)', fontWeight: 600 }}>
              Across {customers.filter((c) => (c.outstandingBalance || 0) > 0).length} active credit accounts
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body" style={{ padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="search-input-wrapper" style={{ gridColumn: 'span 2' }}>
              <Search size={16} />
              <input
                type="text"
                className="form-control"
                placeholder="Search customers by name, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {customerTypes.map((t) => (
                  <option key={t} value={t}>
                    {t === 'ALL' ? 'All Account Types' : `${t}s`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="form-select"
                value={filterBalance}
                onChange={(e) => setFilterBalance(e.target.value)}
              >
                <option value="ALL">All Balance Statuses</option>
                <option value="HAS_BALANCE">⚠️ Has Outstanding Balance</option>
                <option value="ZERO">✅ Clear / Zero Balance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Type</th>
                <th>Contact Details</th>
                <th>Lifetime Purchases</th>
                <th>Outstanding Khata</th>
                <th>Last Transaction</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => {
                const hasBalance = (c.outstandingBalance || 0) > 0;
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>ID: {c.id}</div>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          c.customerType === 'Contractor'
                            ? 'badge-brand'
                            : c.customerType === 'Painter'
                            ? 'badge-warning'
                            : 'badge-neutral'
                        }`}
                      >
                        {c.customerType}
                      </span>
                    </td>

                    <td>
                      {c.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                          <Phone size={12} color="var(--slate-500)" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                      {c.address && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                          <MapPin size={12} />
                          <span>{c.address}</span>
                        </div>
                      )}
                    </td>

                    <td>
                      <strong style={{ color: 'var(--slate-800)' }}>
                        {settings.currency}
                        {(c.totalPurchases || 0).toLocaleString('en-IN')}
                      </strong>
                    </td>

                    <td>
                      {hasBalance ? (
                        <div>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--rose-600)' }}>
                            {settings.currency}
                            {c.outstandingBalance.toLocaleString('en-IN')}
                          </span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--rose-600)', fontWeight: 600 }}>
                            Due from site
                          </div>
                        </div>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle size={12} /> Clear (₹0)
                        </span>
                      )}
                    </td>

                    <td style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      {c.lastPurchaseDate || 'Recent'}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setSelectedCustomerForPurchases(c);
                            setIsPurchasesModalOpen(true);
                          }}
                          title="View Supabase Buying History & Invoices (కొనుగోలు చరిత్ర)"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <ShoppingBag size={13} color="var(--orange-500)" />
                          <span>History</span>
                        </button>
                        {hasBalance ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-accent"
                            onClick={() => setPaymentModal({ open: true, customer: c, amount: c.outstandingBalance, paymentMethod: 'Cash' })}
                            title="Record payment received against Khata credit"
                          >
                            <ArrowDownRight size={13} /> Settle / Pay
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={() => setPaymentModal({ open: true, customer: c, amount: '', paymentMethod: 'Cash' })}
                          >
                            Deposit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <Users size={20} color="var(--orange-500)" />
                Add Demonstration Customer / Contractor
              </div>
              <button onClick={() => setIsAddCustomerOpen(false)} style={{ color: 'var(--slate-400)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name / Agency Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Subhash Contractor or Prem Painter"
                    value={newCustData.name}
                    onChange={(e) => setNewCustData({ ...newCustData, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Account Type *</label>
                    <select
                      className="form-select"
                      value={newCustData.customerType}
                      onChange={(e) => setNewCustData({ ...newCustData, customerType: e.target.value })}
                    >
                      <option value="Contractor">Contractor (Thekedar)</option>
                      <option value="Painter">Master Painter (Karigar)</option>
                      <option value="Commercial">Commercial / Builder</option>
                      <option value="Homeowner">Retail Homeowner</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. +91 98765-43210"
                      value={newCustData.phone}
                      onChange={(e) => setNewCustData({ ...newCustData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Shop / Site Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Site 4, Green Avenue"
                    value={newCustData.address}
                    onChange={(e) => setNewCustData({ ...newCustData, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Outstanding Balance / Khata Credit ({settings.currency})</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="0"
                    value={newCustData.outstandingBalance}
                    onChange={(e) => setNewCustData({ ...newCustData, outstandingBalance: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddCustomerOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  Save Customer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment / Settle Khata Modal */}
      {paymentModal.open && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Wallet size={20} color="var(--emerald-600)" />
                Record Khata Payment Received
              </div>
              <button
                onClick={() => setPaymentModal({ open: false, customer: null, amount: '', paymentMethod: 'Cash' })}
                style={{ color: 'var(--slate-400)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <div className="modal-body">
                <div style={{ background: 'var(--slate-50)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Customer Account</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                    {paymentModal.customer?.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--rose-600)', fontWeight: 700, marginTop: '4px' }}>
                    Current Outstanding Balance: {settings.currency}
                    {paymentModal.customer?.outstandingBalance?.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount Paid by Customer ({settings.currency}) *</label>
                  <input
                    type="number"
                    min="1"
                    max={paymentModal.customer?.outstandingBalance || 999999}
                    required
                    className="form-control"
                    placeholder="Enter payment amount"
                    value={paymentModal.amount}
                    onChange={(e) => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Mode *</label>
                  <select
                    className="form-select"
                    value={paymentModal.paymentMethod}
                    onChange={(e) => setPaymentModal({ ...paymentModal, paymentMethod: e.target.value })}
                  >
                    <option value="Cash">Cash in Hand</option>
                    <option value="UPI (GPay / PhonePe)">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Bank NEFT / IMPS">Bank NEFT / IMPS Transfer</option>
                    <option value="Cheque">Account Payee Cheque</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPaymentModal({ open: false, customer: null, amount: '', paymentMethod: 'Cash' })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Record & Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Buying History & Supabase Analytics Dossier Modal */}
      <CustomerPurchasesModal
        isOpen={isPurchasesModalOpen}
        onClose={() => {
          setIsPurchasesModalOpen(false);
          setSelectedCustomerForPurchases(null);
        }}
        customer={selectedCustomerForPurchases}
        onRecordPayment={(c) => {
          setIsPurchasesModalOpen(false);
          setPaymentModal({ open: true, customer: c, amount: c.outstandingBalance, paymentMethod: 'Cash' });
        }}
      />
    </div>
  );
};
