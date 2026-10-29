import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_SETTINGS
} from '../data/initialData';

const AppContext = createContext();

// Normalizers to seamlessly map between backend PostgreSQL columns and UI state
const normalizeProduct = (p) => ({
  ...p,
  id: p.id,
  name: p.name,
  brand: p.brand,
  category: p.category,
  packSize: p.pack_size || p.packSize,
  pack_size: p.pack_size || p.packSize,
  unitOfMeasure: p.unit_of_measure || p.unitOfMeasure || 'L',
  shadeCode: p.shade_code || p.shadeCode,
  shade_code: p.shade_code || p.shadeCode,
  shadeHex: p.shade_hex || p.shadeHex || '#FAFAFA',
  shade_hex: p.shade_hex || p.shadeHex || '#FAFAFA',
  finish: p.finish || 'Standard Sheen',
  unitPrice: Number(p.selling_price ?? p.unitPrice ?? 0),
  selling_price: Number(p.selling_price ?? p.unitPrice ?? 0),
  costPrice: Number(p.cost_price ?? p.costPrice ?? 0),
  cost_price: Number(p.cost_price ?? p.costPrice ?? 0),
  mrp: p.mrp ? Number(p.mrp) : Number((p.selling_price ?? p.unitPrice) * 1.15),
  minThreshold: Number(p.reorder_threshold ?? p.minThreshold ?? 5),
  reorder_threshold: Number(p.reorder_threshold ?? p.minThreshold ?? 5),
  openingStock: Number(p.opening_stock ?? p.openingStock ?? 0),
  opening_stock: Number(p.opening_stock ?? p.openingStock ?? 0),
  stockReceived: Number(p.stock_received ?? p.stockReceived ?? 0),
  stock_received: Number(p.stock_received ?? p.stockReceived ?? 0),
  soldQuantity: Number(p.sold_quantity ?? p.soldQuantity ?? 0),
  sold_quantity: Number(p.sold_quantity ?? p.soldQuantity ?? 0),
  damagedStock: Number(p.damaged_stock ?? p.damagedStock ?? 0),
  damaged_stock: Number(p.damaged_stock ?? p.damagedStock ?? 0),
  currentStock: Number(p.current_stock ?? p.currentStock ?? 0),
  current_stock: Number(p.current_stock ?? p.currentStock ?? 0),
  distributor: p.distributor || '',
  locationRack: p.rack_location || p.locationRack || 'Main Shelf',
  rack_location: p.rack_location || p.locationRack || 'Main Shelf',
});

const normalizeCustomer = (c) => ({
  ...c,
  id: c.id,
  name: c.name,
  customerType: c.customer_type || c.customerType || 'Homeowner',
  customer_type: c.customer_type || c.customerType || 'Homeowner',
  phone: c.phone || '',
  address: c.address || '',
  creditLimit: Number(c.credit_limit ?? c.creditLimit ?? 0),
  outstandingBalance: Number(c.outstanding_balance ?? c.outstandingBalance ?? 0),
  outstanding_balance: Number(c.outstanding_balance ?? c.outstandingBalance ?? 0),
  totalPurchases: Number(c.total_purchases ?? c.totalPurchases ?? 0),
  lastPurchaseDate: c.last_purchase_date || c.lastPurchaseDate || new Date().toISOString().split('T')[0],
});

const normalizeSale = (s) => ({
  ...s,
  id: s.id,
  billNumber: s.bill_number || s.billNumber,
  bill_number: s.bill_number || s.billNumber,
  customerName: s.customer_name || s.customerName,
  customer_name: s.customer_name || s.customerName,
  customerPhone: s.customer_phone || s.customerPhone,
  customer_phone: s.customer_phone || s.customerPhone,
  date: s.confirmed_at
    ? new Date(s.confirmed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : s.date || new Date().toLocaleDateString('en-IN'),
  subtotal: Number(s.subtotal || 0),
  discount: Number(s.discount || 0),
  netTotal: Number(s.net_total ?? s.netTotal ?? 0),
  net_total: Number(s.net_total ?? s.netTotal ?? 0),
  paymentMode: s.payment_mode || s.paymentMode,
  payment_mode: s.payment_mode || s.paymentMode,
  paymentStatus: s.payment_status || s.paymentStatus || 'Paid',
  items: (s.items || []).map((it) => ({
    ...it,
    productName: it.product_name || it.productName,
    product_name: it.product_name || it.productName,
    packSize: it.pack_size || it.packSize,
    pack_size: it.pack_size || it.packSize,
    shadeCode: it.shade_code || it.shadeCode,
    shade_code: it.shade_code || it.shadeCode,
    unitPrice: Number(it.unit_price ?? it.unitPrice ?? 0),
    quantity: Number(it.quantity || 0),
    total: Number(it.total || 0),
  })),
});

const normalizeSettings = (s) => ({
  ...s,
  shopId: s.shopId || s.shop_id || 'SHOP-HYD-042',
  shop_id: s.shopId || s.shop_id || 'SHOP-HYD-042',
  shopName: s.name || s.shopName || 'SAARTHI Paints & Hardware Depot',
  name: s.name || s.shopName || 'SAARTHI Paints & Hardware Depot',
  tagline: s.tagline || 'Authorized Dealer — Asian Paints, Berger & Dr. Fixit',
  ownerName: s.owner_name || s.ownerName || '',
  phone: s.phone || '',
  email: s.email || '',
  address: s.address || '',
  gstin: s.gstin || '',
  billPrefix: s.bill_prefix || s.billPrefix || 'PB-2026-',
  bill_prefix: s.bill_prefix || s.billPrefix || 'PB-2026-',
  nextBillNumber: Number(s.next_bill_number || s.nextBillNumber || 1045),
  next_bill_number: Number(s.next_bill_number || s.nextBillNumber || 1045),
  currency: s.currency || '₹',
  lowStockThreshold: Number(s.low_stock_threshold || s.lowStockThreshold || 5),
  billFooterNote: s.bill_footer_note || s.billFooterNote || '',
});

export const DEFAULT_PLUGINS = [
  {
    id: 'ai-copilot',
    name: 'AI Paint Copilot & Voice',
    description: 'Multilingual Telugu & English AI voice assistant with instant stock lookups, billing calculations & paint consultation.',
    category: 'ai',
    version: 'v2.4 Neural',
    iconName: 'Bot',
    enabled: true,
    badge: 'AI Core'
  },
  {
    id: 'ai-demand-forecast',
    name: 'Predictive Paint Demand Forecasting',
    description: 'Autonomous neural engine predicting seasonal exterior paint surges and depot stockouts 14 days in advance.',
    category: 'ai',
    version: 'v3.1 ML',
    iconName: 'BrainCircuit',
    enabled: true,
    badge: 'Neural'
  },
  {
    id: 'ai-tint-matcher',
    name: 'Smart Shade & Tinting Formulator',
    description: 'Calculates exact base paint tint codes, colorant shot volumes (Y, B, R), and custom shade tint costs.',
    category: 'ai',
    version: 'v1.8 Precision',
    iconName: 'Sparkles',
    enabled: true,
    badge: 'Spectra'
  },
  {
    id: 'ai-khata-risk',
    name: 'Khata Credit Risk Intelligence',
    description: 'AI credit scoring for painters & contractors to recommend safe borrowing limits before credit billing.',
    category: 'ai',
    version: 'v2.0 RiskGuard',
    iconName: 'ShieldCheck',
    enabled: true,
    badge: 'Financial'
  },
  {
    id: 'real-hardware-terminal',
    name: 'Physical POS & Thermal Printing',
    description: 'Production ESC/POS thermal receipt & A4 legal invoice generation with strict serial bill numbering.',
    category: 'real',
    version: 'v4.0 Hardware',
    iconName: 'Printer',
    enabled: true,
    badge: 'Hardware'
  },
  {
    id: 'real-depot-sync',
    name: 'Depot Inward Goods & Challan Ledger',
    description: 'Direct verification with Asian Paints, Berger & Dulux regional depots with inward challan number validation.',
    category: 'real',
    version: 'v2.2 Sync',
    iconName: 'Truck',
    enabled: true,
    badge: 'Depot'
  },
  {
    id: 'real-barcode-scanner',
    name: 'Barcode & Can QR Fast-POS Scanner',
    description: 'High-speed keyboard-wedge barcode and QR code reader directly streaming tins into cart.',
    category: 'real',
    version: 'v1.5 HID',
    iconName: 'Scan',
    enabled: true,
    badge: 'Terminal'
  },
  {
    id: 'real-upi-reconcile',
    name: 'Dynamic UPI QR & Cash Drawer Guard',
    description: 'Generates on-screen NPCI dynamic QR codes with instant transaction settlement confirmation.',
    category: 'real',
    version: 'v3.0 PayReady',
    iconName: 'QrCode',
    enabled: true,
    badge: 'Settlement'
  }
];

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState(() => INITIAL_PRODUCTS.map(normalizeProduct));
  const [customers, setCustomers] = useState(() => INITIAL_CUSTOMERS.map(normalizeCustomer));
  const [sales, setSales] = useState(() => INITIAL_SALES.map(normalizeSale));
  const [settings, setSettings] = useState(() => normalizeSettings(INITIAL_SETTINGS));

  // Mode & Plugin state: 'ai' (AI Copilot Mode) | 'real' (Physical Paint Shop Terminal Mode)
  const [appMode, setAppModeState] = useState(() => {
    return localStorage.getItem('saarthi_app_mode') || 'ai';
  });

  const [plugins, setPlugins] = useState(() => {
    try {
      const saved = localStorage.getItem('saarthi_plugins');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return DEFAULT_PLUGINS;
  });

  const [activePage, setActivePage] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendStatus, setBackendStatus] = useState('Connecting to backend...');

  // Toast notification helper
  const notify = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification((curr) => (curr && curr.id ? null : curr));
    }, 4500);
  };

  const setAppMode = (newMode) => {
    setAppModeState(newMode);
    localStorage.setItem('saarthi_app_mode', newMode);
    if (newMode === 'ai') {
      notify('Switched to 🤖 AI Copilot Mode — Autonomous forecasts, voice copilot & tinting calculator active.');
    } else {
      notify('Switched to 🏢 Real Mode — Physical shop terminal, hardware printer & depot ledger active.');
    }
  };

  const togglePlugin = (pluginId) => {
    setPlugins((prev) => {
      const updated = prev.map((p) => (p.id === pluginId ? { ...p, enabled: !p.enabled } : p));
      localStorage.setItem('saarthi_plugins', JSON.stringify(updated));
      const target = updated.find((p) => p.id === pluginId);
      if (target) {
        notify(`Plugin "${target.name}" is now ${target.enabled ? 'Enabled' : 'Disabled'}.`, target.enabled ? 'success' : 'info');
      }
      return updated;
    });
  };

  // Sync data from Express Backend
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const healthRes = await api.health.check();
      if (healthRes.success) {
        setIsBackendConnected(true);
        setBackendStatus(healthRes.data.database);

        // Fetch real data in parallel
        const [prodRes, custRes, salesRes, settingsRes] = await Promise.all([
          api.inventory.getBalances().catch(() => api.products.list()),
          api.customers.list(),
          api.sales.list(),
          api.settings.get(),
        ]);

        if (prodRes?.data) setProducts(prodRes.data.map(normalizeProduct));
        if (custRes?.data) setCustomers(custRes.data.map(normalizeCustomer));
        if (salesRes?.data) setSales(salesRes.data.map(normalizeSale));
        if (settingsRes?.data) setSettings(normalizeSettings(settingsRes.data));
      }
    } catch (err) {
      console.warn('Backend not currently reachable. Operating in local demonstration mode:', err.message);
      setIsBackendConnected(false);
      setBackendStatus('Local Demo Engine (Start backend server on port 5000 to connect)');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // 1. Add Product Formulation
  const addProduct = async (productData) => {
    try {
      if (isBackendConnected) {
        const payload = {
          name: productData.name,
          brand: productData.brand,
          category: productData.category,
          pack_size: productData.packSize || productData.pack_size,
          unit_of_measure: productData.unitOfMeasure || 'L',
          shade_code: productData.shadeCode || productData.shade_code,
          shade_hex: productData.shadeHex || productData.shade_hex || '#FFFFFF',
          finish: productData.finish || 'Standard Sheen',
          rack_location: productData.locationRack || productData.rack_location || 'Main Shelf',
          selling_price: Number(productData.unitPrice || productData.selling_price),
          cost_price: Number(productData.costPrice || productData.cost_price || 0),
          mrp: productData.mrp ? Number(productData.mrp) : undefined,
          reorder_threshold: Number(productData.minThreshold || productData.reorder_threshold || 5),
          opening_stock: Number(productData.currentStock || productData.opening_stock || 0),
          distributor: productData.distributor || null,
        };

        const res = await api.products.create(payload);
        if (res.success) {
          const normalized = normalizeProduct(res.data);
          setProducts((prev) => [normalized, ...prev]);
          notify(`Product "${normalized.name}" added to backend catalog.`);
          return normalized;
        }
      }
    } catch (err) {
      notify(err.message || 'Failed to add product on backend', 'warning');
      throw err;
    }

    // Fallback to local session state
    const localProduct = normalizeProduct({
      ...productData,
      id: `PRD-${Date.now().toString().slice(-4)}`,
      opening_stock: Number(productData.currentStock || 0),
      current_stock: Number(productData.currentStock || 0),
    });
    setProducts((prev) => [localProduct, ...prev]);
    notify(`Product "${localProduct.name}" added to catalog.`);
    return localProduct;
  };

  // 2. Inward Depot Stock
  const addStock = async (productId, quantity, invoiceNo = '', notes = '') => {
    const qty = Number(quantity);
    if (!qty || qty <= 0) return;

    try {
      if (isBackendConnected) {
        const res = await api.inventory.receiveStock({
          product_id: productId,
          quantity: qty,
          invoice_no: invoiceNo,
          notes,
        });

        if (res.success) {
          notify(`Received ${qty} units into stock via backend.`);
          await refreshData();
          return;
        }
      }
    } catch (err) {
      notify(err.message || 'Failed to record inward stock on backend', 'warning');
      throw err;
    }

    // Fallback
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newCurrent = Number(item.currentStock || 0) + qty;
          return {
            ...item,
            stockReceived: (item.stockReceived || 0) + qty,
            currentStock: newCurrent,
            current_stock: newCurrent,
          };
        }
        return item;
      })
    );
    notify(`Received ${qty} units into stock${invoiceNo ? ` (Invoice #${invoiceNo})` : ''}.`);
  };

  // 3. Record Damaged Stock
  const recordDamaged = async (productId, quantity, reason = 'Leakage/Damaged') => {
    const qty = Number(quantity);
    if (!qty || qty <= 0) return;

    try {
      if (isBackendConnected) {
        const res = await api.inventory.recordDamage({
          product_id: productId,
          quantity: qty,
          reason,
        });

        if (res.success) {
          notify(`Recorded ${qty} damaged units on server. Stock adjusted.`, 'warning');
          await refreshData();
          return;
        }
      }
    } catch (err) {
      notify(err.message || 'Failed to record damaged stock on backend', 'warning');
      throw err;
    }

    // Fallback
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newCurrent = Math.max(0, (item.currentStock || 0) - qty);
          return {
            ...item,
            damagedStock: (item.damagedStock || 0) + qty,
            currentStock: newCurrent,
            current_stock: newCurrent,
          };
        }
        return item;
      })
    );
    notify(`Recorded ${qty} damaged units (${reason}). Stock adjusted.`, 'warning');
  };

  // 4. Create & Confirm Sale Atomically
  const createSale = async (saleData) => {
    const idempotencyKey = `idem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      if (isBackendConnected) {
        // Step A: Create draft bill
        const draftPayload = {
          bill_number: saleData.billNumber?.trim() || undefined,
          customer_id: saleData.customerId || undefined,
          customer_name: saleData.customerName || 'Walk-in Retail Buyer',
          customer_phone: saleData.customerPhone || undefined,
          payment_mode: saleData.paymentMode || 'Cash',
          discount: Number(saleData.discount || 0),
          notes: saleData.notes || undefined,
          items: saleData.items.map((it) => ({
            product_id: it.productId || it.product_id,
            quantity: Number(it.quantity),
            unit_price: Number(it.unitPrice || it.unit_price),
          })),
        };

        const draftRes = await api.sales.createDraft(draftPayload);
        if (!draftRes.success) {
          throw new Error(draftRes.error?.message || 'Could not create paper bill draft');
        }

        const draftId = draftRes.data.id;

        // Step B: Atomically confirm bill
        const confirmRes = await api.sales.confirm(draftId, idempotencyKey);
        if (confirmRes.success) {
          const confirmed = normalizeSale(confirmRes.data);
          notify(`Paper Bill #${confirmed.billNumber} confirmed atomically. Stock deducted.`);
          await refreshData();
          return confirmed;
        }
      }
    } catch (err) {
      notify(err.message || 'Failed to confirm sale on server', 'warning');
      throw err;
    }

    // Fallback local execution
    const saleId = `SALE-${Date.now().toString().slice(-4)}`;
    const billNumber = saleData.billNumber || `${settings.billPrefix}${settings.nextBillNumber}`;
    const newSale = normalizeSale({
      ...saleData,
      id: saleId,
      billNumber,
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      subtotal: Number(saleData.subtotal || 0),
      discount: Number(saleData.discount || 0),
      netTotal: Number(saleData.netTotal || 0),
      paymentStatus: saleData.paymentMode === 'Khata / Credit' ? 'Added to Khata' : 'Paid',
    });

    // Update inventory
    setProducts((prev) => {
      const updated = [...prev];
      saleData.items.forEach((item) => {
        const prodIndex = updated.findIndex((p) => p.id === (item.productId || item.product_id));
        if (prodIndex > -1) {
          const prod = updated[prodIndex];
          const soldQty = Number(item.quantity);
          const newCurrent = Math.max(0, (prod.currentStock || 0) - soldQty);
          updated[prodIndex] = {
            ...prod,
            soldQuantity: (prod.soldQuantity || 0) + soldQty,
            currentStock: newCurrent,
            current_stock: newCurrent,
          };
        }
      });
      return updated;
    });

    // Update customer Khata
    if (saleData.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === saleData.customerId) {
            const isKhata = saleData.paymentMode === 'Khata / Credit';
            return {
              ...c,
              totalPurchases: (c.totalPurchases || 0) + newSale.netTotal,
              outstandingBalance: isKhata
                ? (c.outstandingBalance || 0) + newSale.netTotal
                : c.outstandingBalance || 0,
            };
          }
          return c;
        })
      );
    }

    setSales((prev) => [newSale, ...prev]);
    setSettings((prev) => ({
      ...prev,
      nextBillNumber: (prev.nextBillNumber || 1000) + 1,
    }));

    notify(`Paper Bill #${billNumber} confirmed. Stock and sales ledger updated.`);
    return newSale;
  };

  // 5. Add Customer
  const addCustomer = async (customerData) => {
    try {
      if (isBackendConnected) {
        const payload = {
          name: customerData.name,
          customer_type: customerData.customerType || customerData.customer_type || 'Homeowner',
          phone: customerData.phone || undefined,
          address: customerData.address || undefined,
          credit_limit: Number(customerData.creditLimit || 0),
          outstanding_balance: Number(customerData.outstandingBalance || 0),
        };

        const res = await api.customers.create(payload);
        if (res.success) {
          const normalized = normalizeCustomer(res.data);
          setCustomers((prev) => [normalized, ...prev]);
          notify(`Customer account "${normalized.name}" created on backend.`);
          return normalized;
        }
      }
    } catch (err) {
      notify(err.message || 'Failed to create customer on backend', 'warning');
      throw err;
    }

    const localCustomer = normalizeCustomer({
      ...customerData,
      id: `CUST-${Date.now().toString().slice(-4)}`,
    });
    setCustomers((prev) => [localCustomer, ...prev]);
    notify(`Customer "${localCustomer.name}" added.`);
    return localCustomer;
  };

  // 6. Record Customer Khata Payment
  const recordCustomerPayment = async (customerId, amount, paymentMethod = 'Cash') => {
    const payAmt = Number(amount);
    if (!payAmt || payAmt <= 0) return;

    try {
      if (isBackendConnected) {
        const res = await api.customers.recordPayment(customerId, {
          amount: payAmt,
          payment_mode: paymentMethod === 'Khata / Credit' ? 'Cash' : paymentMethod,
        });

        if (res.success) {
          notify(`Payment of ${settings.currency}${payAmt.toLocaleString('en-IN')} recorded on backend.`);
          await refreshData();
          return;
        }
      }
    } catch (err) {
      notify(err.message || 'Failed to record customer payment on backend', 'warning');
      throw err;
    }

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            outstandingBalance: Math.max(0, (c.outstandingBalance || 0) - payAmt),
          };
        }
        return c;
      })
    );
    notify(`Received ${settings.currency}${payAmt.toLocaleString('en-IN')} via ${paymentMethod}.`);
  };

  // 7. Update Settings
  const updateSettings = async (newSettings) => {
    try {
      if (isBackendConnected) {
        const payload = {
          name: newSettings.shopName || newSettings.name,
          shop_id: newSettings.shopId || newSettings.shop_id || undefined,
          tagline: newSettings.tagline,
          owner_name: newSettings.ownerName || newSettings.owner_name,
          phone: newSettings.phone,
          email: newSettings.email || undefined,
          address: newSettings.address,
          gstin: newSettings.gstin,
          bill_prefix: newSettings.billPrefix || newSettings.bill_prefix,
          next_bill_number: Number(newSettings.nextBillNumber || newSettings.next_bill_number),
          currency: newSettings.currency,
          low_stock_threshold: Number(newSettings.lowStockThreshold || newSettings.low_stock_threshold),
          bill_footer_note: newSettings.billFooterNote || newSettings.bill_footer_note,
        };

        const res = await api.settings.update(payload);
        if (res.success) {
          setSettings(normalizeSettings(res.data));
          notify('Shop settings saved to backend.');
          return;
        }
      }
    } catch (err) {
      notify(err.message || 'Failed to update settings on backend', 'warning');
      throw err;
    }

    setSettings((prev) => normalizeSettings({ ...prev, ...newSettings }));
    notify('Shop settings saved.');
  };

  // Reset to original demo data
  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS.map(normalizeProduct));
    setCustomers(INITIAL_CUSTOMERS.map(normalizeCustomer));
    setSales(INITIAL_SALES.map(normalizeSale));
    setSettings(normalizeSettings(INITIAL_SETTINGS));
    notify('Local view reset to demonstration paint data.', 'info');
  };

  // Derived statistics
  const lowStockProducts = products.filter(
    (p) => p.currentStock <= (p.minThreshold || settings.lowStockThreshold || 5)
  );

  const totalInventoryValuation = products.reduce(
    (sum, p) => sum + (p.currentStock || 0) * (p.unitPrice || 0),
    0
  );

  const totalStockUnits = products.reduce(
    (sum, p) => sum + (p.currentStock || 0),
    0
  );

  const totalOutstandingCredit = customers.reduce(
    (sum, c) => sum + (c.outstandingBalance || 0),
    0
  );

  return (
    <AppContext.Provider
      value={{
        products,
        customers,
        sales,
        settings,
        activePage,
        setActivePage,
        notification,
        notify,
        isLoading,
        isBackendConnected,
        backendStatus,
        refreshData,
        addProduct,
        addStock,
        recordDamaged,
        createSale,
        addCustomer,
        recordCustomerPayment,
        updateSettings,
        resetToDefaults,
        lowStockProducts,
        totalInventoryValuation,
        totalStockUnits,
        totalOutstandingCredit,
        appMode,
        setAppMode,
        plugins,
        togglePlugin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
