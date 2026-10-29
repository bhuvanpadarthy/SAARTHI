import { v4 as uuidv4 } from 'uuid';
import { getSupabase, isSupabaseConfigured } from '../config/supabase.js';

// Realistic initial dataset for local offline development, testing, and fallback
const DEFAULT_SHOP_ID = '00000000-0000-0000-0000-000000000001';

const getInitialState = () => ({
  shops: [
    {
      id: DEFAULT_SHOP_ID,
      shop_id: 'SHOP-HYD-042',
      name: 'SRI BASKARA PAINTS AGENCIES',
      tagline: 'Authorized Dealer — Asian Paints, Berger & Dr. Fixit',
      owner_name: 'V. K. Aggarwal & Sons',
      phone: '+91 98765-01234',
      email: 'saarthi.paints@example.com',
      address: 'Shop 14-16, Paints & Hardware Market, GT Road',
      gstin: '07AAAAA1234B1Z5',
      bill_prefix: 'PB-2026-',
      next_bill_number: 1045,
      currency: '₹',
      low_stock_threshold: 5,
      bill_footer_note: 'Goods once tinted to custom shade cannot be returned or exchanged.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  shop_members: [
    {
      id: 'member-owner-001',
      shop_id: DEFAULT_SHOP_ID,
      user_id: 'usr-admin-01',
      role: 'owner',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'member-cashier-001',
      shop_id: DEFAULT_SHOP_ID,
      user_id: 'usr-cashier-01',
      role: 'cashier',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  products: [
    {
      id: '10000000-0000-0000-0000-000000000001',
      shop_id: DEFAULT_SHOP_ID,
      name: 'Royale Luxury Interior Emulsion',
      brand: 'Asian Paints',
      category: 'Interior Emulsion',
      pack_size: '20 L',
      unit_of_measure: 'L',
      shade_code: '0422 Pearl Glow',
      shade_hex: '#F5EBE1',
      finish: 'Soft Sheen',
      rack_location: 'Aisle 1 - Bay B',
      selling_price: 8450.0,
      cost_price: 7100.0,
      mrp: 9600.0,
      reorder_threshold: 4,
      opening_stock: 8,
      current_stock: 3, // Low stock
      distributor: 'Asian Paints Regional Depot',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      shop_id: DEFAULT_SHOP_ID,
      name: 'Royale Luxury Interior Emulsion',
      brand: 'Asian Paints',
      category: 'Interior Emulsion',
      pack_size: '4 L',
      unit_of_measure: 'L',
      shade_code: '0112 Morning Sun',
      shade_hex: '#FFF3B0',
      finish: 'Soft Sheen',
      rack_location: 'Aisle 1 - Bay C',
      selling_price: 1950.0,
      cost_price: 1620.0,
      mrp: 2200.0,
      reorder_threshold: 6,
      opening_stock: 12,
      current_stock: 17,
      distributor: 'Asian Paints Regional Depot',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      shop_id: DEFAULT_SHOP_ID,
      name: 'Apex Ultima Exterior Emulsion',
      brand: 'Asian Paints',
      category: 'Exterior Emulsion',
      pack_size: '20 L',
      unit_of_measure: 'L',
      shade_code: 'L102 Apcolite White',
      shade_hex: '#FAFAFA',
      finish: 'High Sheen Exterior',
      rack_location: 'Aisle 2 - Bay A',
      selling_price: 7800.0,
      cost_price: 6500.0,
      mrp: 8900.0,
      reorder_threshold: 5,
      opening_stock: 10,
      current_stock: 3, // Low stock
      distributor: 'Asian Paints Regional Depot',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      shop_id: DEFAULT_SHOP_ID,
      name: 'WeatherCoat Long Life 10 Exterior',
      brand: 'Berger Paints',
      category: 'Exterior Emulsion',
      pack_size: '20 L',
      unit_of_measure: 'L',
      shade_code: '7811 Mint Frost',
      shade_hex: '#D1FAE5',
      finish: 'Silicone & PU Sheen',
      rack_location: 'Aisle 2 - Bay C',
      selling_price: 7950.0,
      cost_price: 6600.0,
      mrp: 9100.0,
      reorder_threshold: 4,
      opening_stock: 6,
      current_stock: 2, // Critical Low Stock
      distributor: 'Berger Distribution Hub',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '10000000-0000-0000-0000-000000000005',
      shop_id: DEFAULT_SHOP_ID,
      name: 'Dr. Fixit Dampshield 2K Waterproofing',
      brand: 'Dr. Fixit',
      category: 'Waterproofing & Chemical',
      pack_size: '15 Kg',
      unit_of_measure: 'Kg',
      shade_code: 'WP-GREY Grey Slurry',
      shade_hex: '#94A3B8',
      finish: 'Flexible Waterproof Coating',
      rack_location: 'Aisle 5 - Chemicals',
      selling_price: 3200.0,
      cost_price: 2700.0,
      mrp: 3750.0,
      reorder_threshold: 5,
      opening_stock: 12,
      current_stock: 10,
      distributor: 'Pidilite Industrial Distributors',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '10000000-0000-0000-0000-000000000006',
      shop_id: DEFAULT_SHOP_ID,
      name: 'Royale Luxury Interior Emulsion',
      brand: 'Asian Paints',
      category: 'Interior Emulsion',
      pack_size: '1 L',
      unit_of_measure: 'L',
      shade_code: '0422 Pearl Glow',
      shade_hex: '#F5EBE1',
      finish: 'Soft Sheen',
      rack_location: 'Aisle 1 - Bay B',
      selling_price: 560.0,
      cost_price: 470.0,
      mrp: 620.0,
      reorder_threshold: 10,
      opening_stock: 30,
      current_stock: 24,
      distributor: 'Asian Paints Regional Depot',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '10000000-0000-0000-0000-000000000007',
      shop_id: DEFAULT_SHOP_ID,
      name: 'TruCare Interior Wall Primer (Water Based)',
      brand: 'Asian Paints',
      category: 'Primer & Undercoat',
      pack_size: '1 L',
      unit_of_measure: 'L',
      shade_code: 'PRIMER-WT Pure White',
      shade_hex: '#FFFFFF',
      finish: 'Matte Base Coat',
      rack_location: 'Aisle 4 - Base',
      selling_price: 210.0,
      cost_price: 165.0,
      mrp: 240.0,
      reorder_threshold: 10,
      opening_stock: 35,
      current_stock: 30,
      distributor: 'Asian Paints Regional Depot',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  customers: [
    {
      id: '20000000-0000-0000-0000-000000000001',
      shop_id: DEFAULT_SHOP_ID,
      name: 'Ramesh Sharma (Contractor)',
      customer_type: 'Contractor',
      phone: '+91 98765-11223',
      address: 'Site 4, Green Park Enclave',
      credit_limit: 50000.0,
      outstanding_balance: 14500.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      shop_id: DEFAULT_SHOP_ID,
      name: 'Vijay Painter (Master Karigar)',
      customer_type: 'Painter',
      phone: '+91 98112-33445',
      address: 'Near Old Bus Stand, Ward 8',
      credit_limit: 20000.0,
      outstanding_balance: 3800.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      shop_id: DEFAULT_SHOP_ID,
      name: 'Amit Verma',
      customer_type: 'Homeowner',
      phone: '+91 98334-55667',
      address: 'House 142, Model Town',
      credit_limit: 0.0,
      outstanding_balance: 0.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '20000000-0000-0000-0000-000000000004',
      shop_id: DEFAULT_SHOP_ID,
      name: 'Bhuvan',
      customer_type: 'Homeowner',
      phone: '+91 99887-66554',
      address: 'Main Road, Shop Town',
      credit_limit: 25000.0,
      outstanding_balance: 0.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  sales: [
    {
      id: '30000000-0000-0000-0000-000000000001',
      shop_id: DEFAULT_SHOP_ID,
      customer_id: '20000000-0000-0000-0000-000000000001',
      customer_name: 'Ramesh Sharma (Contractor)',
      customer_phone: '+91 98765-11223',
      bill_number: 'PB-2026-1041',
      idempotency_key: 'seed-sale-001',
      status: 'confirmed',
      subtotal: 24750.0,
      discount: 1000.0,
      net_total: 23750.0,
      payment_mode: 'Khata / Credit',
      payment_status: 'Added to Khata',
      notes: 'Initial exterior painting contractor order for Site 4.',
      confirmed_at: '2026-10-21T10:30:00.000Z',
      created_at: '2026-10-21T10:30:00.000Z',
      updated_at: '2026-10-21T10:30:00.000Z',
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      shop_id: DEFAULT_SHOP_ID,
      customer_id: '20000000-0000-0000-0000-000000000001',
      customer_name: 'Ramesh Sharma (Contractor)',
      customer_phone: '+91 98765-11223',
      bill_number: 'PB-2026-1044',
      idempotency_key: 'seed-sale-002',
      status: 'confirmed',
      subtotal: 16900.0,
      discount: 500.0,
      net_total: 16400.0,
      payment_mode: 'UPI',
      payment_status: 'Paid',
      notes: 'Royale luxury emulsion for master bedroom suite.',
      confirmed_at: '2026-10-23T11:15:00.000Z',
      created_at: '2026-10-23T11:15:00.000Z',
      updated_at: '2026-10-23T11:15:00.000Z',
    },
    {
      id: '30000000-0000-0000-0000-000000000003',
      shop_id: DEFAULT_SHOP_ID,
      customer_id: '20000000-0000-0000-0000-000000000002',
      customer_name: 'Vijay Painter (Master Karigar)',
      customer_phone: '+91 98112-33445',
      bill_number: 'PB-2026-1042',
      idempotency_key: 'seed-sale-003',
      status: 'confirmed',
      subtotal: 7800.0,
      discount: 0.0,
      net_total: 7800.0,
      payment_mode: 'Cash',
      payment_status: 'Paid',
      notes: 'Enamel & Primer for doors/windows renovation.',
      confirmed_at: '2026-10-22T14:20:00.000Z',
      created_at: '2026-10-22T14:20:00.000Z',
      updated_at: '2026-10-22T14:20:00.000Z',
    },
  ],
  sale_items: [
    {
      id: '40000000-0000-0000-0000-000000000001',
      sale_id: '30000000-0000-0000-0000-000000000001',
      product_id: '10000000-0000-0000-0000-000000000003',
      product_name: 'Apex Ultima Exterior Emulsion',
      brand: 'Asian Paints',
      pack_size: '20 L',
      shade_code: 'EX-101 Terracotta Warm',
      unit_of_measure: 'L',
      quantity: 2,
      unit_price: 7850.0,
      total: 15700.0,
      created_at: '2026-10-21T10:30:00.000Z',
    },
    {
      id: '40000000-0000-0000-0000-000000000002',
      sale_id: '30000000-0000-0000-0000-000000000001',
      product_id: '10000000-0000-0000-0000-000000000004',
      product_name: 'WeatherCoat Long Life 10 Exterior',
      brand: 'Berger Paints',
      pack_size: '20 L',
      shade_code: '7811 Mint Frost',
      unit_of_measure: 'L',
      quantity: 1,
      unit_price: 7950.0,
      total: 7950.0,
      created_at: '2026-10-21T10:30:00.000Z',
    },
    {
      id: '40000000-0000-0000-0000-000000000003',
      sale_id: '30000000-0000-0000-0000-000000000002',
      product_id: '10000000-0000-0000-0000-000000000001',
      product_name: 'Royale Luxury Interior Emulsion',
      brand: 'Asian Paints',
      pack_size: '20 L',
      shade_code: '0422 Pearl Glow',
      unit_of_measure: 'L',
      quantity: 2,
      unit_price: 8450.0,
      total: 16900.0,
      created_at: '2026-10-23T11:15:00.000Z',
    },
    {
      id: '40000000-0000-0000-0000-000000000004',
      sale_id: '30000000-0000-0000-0000-000000000003',
      product_id: '10000000-0000-0000-0000-000000000002',
      product_name: 'Royale Luxury Interior Emulsion',
      brand: 'Asian Paints',
      pack_size: '4 L',
      shade_code: '0112 Morning Sun',
      unit_of_measure: 'L',
      quantity: 4,
      unit_price: 1950.0,
      total: 7800.0,
      created_at: '2026-10-22T14:20:00.000Z',
    },
  ],
  stock_movements: [],
  customer_payments: [
    {
      id: '50000000-0000-0000-0000-000000000001',
      shop_id: DEFAULT_SHOP_ID,
      customer_id: '20000000-0000-0000-0000-000000000001',
      amount: 9250.0,
      payment_mode: 'UPI',
      reference_no: 'UPI-77441199',
      balance_before: 23750.0,
      balance_after: 14500.0,
      notes: 'Part-payment received after Site 4 primer work completed.',
      created_by: 'usr-admin-01',
      created_at: '2026-10-22T16:00:00.000Z',
    },
  ],
  audit_logs: [],
});

class AsyncLock {
  constructor() {
    this.locks = new Map();
  }

  async acquire(keys) {
    const sortedKeys = [...new Set(keys)].sort();
    for (const key of sortedKeys) {
      while (this.locks.has(key)) {
        await this.locks.get(key);
      }
      let release;
      const promise = new Promise((resolve) => {
        release = resolve;
      });
      promise.release = release;
      this.locks.set(key, promise);
    }
    return () => {
      for (const key of sortedKeys) {
        const lock = this.locks.get(key);
        if (lock) {
          this.locks.delete(key);
          lock.release();
        }
      }
    };
  }
}

class DataStore {
  constructor() {
    this.lock = new AsyncLock();
    this.reset();
  }

  reset() {
    this.state = getInitialState();
  }

  // Shop operations
  async getShop(shopId) {
    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('shops').select('*').eq('id', shopId).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) return data;
    }
    return this.state.shops.find((s) => s.id === shopId) || this.state.shops[0];
  }

  async updateShop(shopId, updates) {
    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('shops')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', shopId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const shopIndex = this.state.shops.findIndex((s) => s.id === shopId);
    if (shopIndex === -1) {
      throw new Error(`Shop with ID ${shopId} not found`);
    }
    this.state.shops[shopIndex] = {
      ...this.state.shops[shopIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.state.shops[shopIndex];
  }

  // Shop Membership & RBAC
  async getMember(shopId, userId) {
    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('shop_members')
        .select('*')
        .eq('shop_id', shopId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    }

    return (
      this.state.shop_members.find(
        (m) => m.shop_id === shopId && m.user_id === userId && m.is_active
      ) || null
    );
  }

  // Products
  async listProducts(shopId, filters = {}) {
    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      let query = supabase.from('products').select('*').eq('shop_id', shopId).eq('is_active', true);
      if (filters.brand && filters.brand !== 'ALL') query = query.eq('brand', filters.brand);
      if (filters.category && filters.category !== 'ALL') query = query.eq('category', filters.category);
      if (filters.pack_size && filters.pack_size !== 'ALL') query = query.eq('pack_size', filters.pack_size);
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,shade_code.ilike.%${filters.search}%`
        );
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }

    return this.state.products.filter((p) => {
      if (p.shop_id !== shopId || !p.is_active) return false;
      if (filters.brand && filters.brand !== 'ALL' && p.brand !== filters.brand) return false;
      if (filters.category && filters.category !== 'ALL' && p.category !== filters.category) return false;
      if (filters.pack_size && filters.pack_size !== 'ALL' && p.pack_size !== filters.pack_size) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.shade_code.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (filters.stock_status === 'LOW') {
        if (p.current_stock > p.reorder_threshold) return false;
      } else if (filters.stock_status === 'OUT') {
        if (p.current_stock > 0) return false;
      }
      return true;
    });
  }

  async getProduct(id, shopId) {
    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('shop_id', shopId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    }

    return this.state.products.find((p) => p.id === id && p.shop_id === shopId) || null;
  }

  async createProduct(productData) {
    // Check product identity uniqueness
    const exists = this.state.products.some(
      (p) =>
        p.shop_id === productData.shop_id &&
        p.brand.toLowerCase() === productData.brand.toLowerCase() &&
        p.name.toLowerCase() === productData.name.toLowerCase() &&
        p.pack_size.toLowerCase() === productData.pack_size.toLowerCase() &&
        p.shade_code.toLowerCase() === productData.shade_code.toLowerCase()
    );

    if (exists) {
      const err = new Error(
        `Product formulation already exists: ${productData.brand} ${productData.name} (${productData.pack_size}, Shade: ${productData.shade_code})`
      );
      err.statusCode = 409;
      throw err;
    }

    const openingStock = Number(productData.opening_stock || productData.current_stock || 0);
    const newProduct = {
      id: uuidv4(),
      shop_id: productData.shop_id,
      name: productData.name,
      brand: productData.brand,
      category: productData.category,
      pack_size: productData.pack_size,
      unit_of_measure: productData.unit_of_measure || 'L',
      shade_code: productData.shade_code,
      shade_hex: productData.shade_hex || '#FFFFFF',
      finish: productData.finish || 'Standard Finish',
      rack_location: productData.rack_location || 'Main Shelf',
      selling_price: Number(productData.selling_price),
      cost_price: Number(productData.cost_price || 0),
      mrp: productData.mrp ? Number(productData.mrp) : null,
      reorder_threshold: Number(productData.reorder_threshold || 5),
      opening_stock: openingStock,
      current_stock: openingStock,
      distributor: productData.distributor || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.products.unshift(newProduct);

    // Initial stock movement if openingStock > 0
    if (openingStock > 0) {
      this.state.stock_movements.push({
        id: uuidv4(),
        shop_id: productData.shop_id,
        product_id: newProduct.id,
        movement_type: 'opening_balance',
        quantity: openingStock,
        balance_before: 0,
        balance_after: openingStock,
        reference_type: 'initial_setup',
        reference_id: null,
        reason: 'Initial opening stock setup',
        created_by: productData.created_by || null,
        created_at: new Date().toISOString(),
      });
    }

    return newProduct;
  }

  async updateProduct(id, shopId, updates) {
    const prodIndex = this.state.products.findIndex((p) => p.id === id && p.shop_id === shopId);
    if (prodIndex === -1) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    const prod = this.state.products[prodIndex];
    this.state.products[prodIndex] = {
      ...prod,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.state.products[prodIndex];
  }

  // Customers
  async listCustomers(shopId, filters = {}) {
    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      let query = supabase.from('customers').select('*').eq('shop_id', shopId);
      if (filters.customer_type && filters.customer_type !== 'ALL') {
        query = query.eq('customer_type', filters.customer_type);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }

    return this.state.customers.filter((c) => {
      if (c.shop_id !== shopId) return false;
      if (filters.customer_type && filters.customer_type !== 'ALL' && c.customer_type !== filters.customer_type) {
        return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !(c.phone && c.phone.includes(q))) {
          return false;
        }
      }
      return true;
    });
  }

  async getCustomer(id, shopId) {
    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('customers').select('*').eq('id', id).eq('shop_id', shopId).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    }

    return this.state.customers.find((c) => c.id === id && c.shop_id === shopId) || null;
  }

  async createCustomer(customerData) {
    const newCustomer = {
      id: uuidv4(),
      shop_id: customerData.shop_id,
      name: customerData.name,
      customer_type: customerData.customer_type || 'Homeowner',
      phone: customerData.phone || null,
      address: customerData.address || null,
      credit_limit: Number(customerData.credit_limit || 0),
      outstanding_balance: Number(customerData.outstanding_balance || 0),
      total_purchases: Number(customerData.total_purchases || 0),
      total_orders: Number(customerData.total_orders || 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('customers').insert([newCustomer]).select().single();
      if (error) throw error;
      return data;
    }

    this.state.customers.unshift(newCustomer);
    return newCustomer;
  }

  async recordCustomerPayment(shopId, customerId, amount, paymentMode, referenceNo, notes, userId) {
    const cust = await this.getCustomer(customerId, shopId);
    if (!cust) {
      const err = new Error('Customer account not found');
      err.statusCode = 404;
      throw err;
    }

    const payAmt = Number(amount);
    if (!payAmt || payAmt <= 0) {
      const err = new Error('Payment amount must be greater than zero');
      err.statusCode = 400;
      throw err;
    }

    const balanceBefore = Number(cust.outstanding_balance || 0);
    const balanceAfter = Math.max(0, balanceBefore - payAmt);

    const paymentRecord = {
      id: uuidv4(),
      shop_id: shopId,
      customer_id: customerId,
      amount: payAmt,
      payment_mode: paymentMode || 'Cash',
      reference_no: referenceNo || null,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      notes: notes || null,
      created_by: userId || null,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      const { error: payErr } = await supabase.from('customer_payments').insert([paymentRecord]);
      if (payErr) throw payErr;

      const { error: custErr } = await supabase
        .from('customers')
        .update({ outstanding_balance: balanceAfter, updated_at: new Date().toISOString() })
        .eq('id', customerId);
      if (custErr) throw custErr;

      return paymentRecord;
    }

    cust.outstanding_balance = balanceAfter;
    cust.updated_at = new Date().toISOString();
    this.state.customer_payments.unshift(paymentRecord);
    return paymentRecord;
  }

  // Customer Purchasing History & Buying Analytics
  async getCustomerPurchases(customerId, shopId) {
    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_customer_purchase_dossier', {
          p_shop_id: shopId,
          p_customer_id: customerId,
        });
        if (!rpcError && rpcData?.success) {
          return rpcData;
        }
      } catch (e) {
        // Fall back to table queries if migration 004 RPC not yet executed
      }

      const [custRes, salesRes, paymentsRes] = await Promise.all([
        supabase.from('customers').select('*').eq('id', customerId).eq('shop_id', shopId).single(),
        supabase.from('sales').select('*, sale_items(*)').eq('customer_id', customerId).eq('shop_id', shopId).eq('status', 'confirmed').order('created_at', { ascending: false }),
        supabase.from('customer_payments').select('*').eq('customer_id', customerId).eq('shop_id', shopId).order('created_at', { ascending: false }),
      ]);

      if (custRes.error || !custRes.data) {
        const err = new Error('Customer account not found');
        err.statusCode = 404;
        throw err;
      }

      const customer = custRes.data;
      const sales = salesRes.data || [];
      const payments = paymentsRes.data || [];

      const totalSpent = sales.reduce((sum, s) => sum + Number(s.net_total || 0), 0);
      const ordersCount = sales.length;
      const avgOrder = ordersCount > 0 ? Number((totalSpent / ordersCount).toFixed(2)) : 0;

      const productMap = {};
      sales.forEach((s) => {
        (s.sale_items || []).forEach((item) => {
          const key = `${item.product_name}-${item.pack_size}`;
          if (!productMap[key]) {
            productMap[key] = {
              product_name: item.product_name,
              brand: item.brand,
              pack_size: item.pack_size,
              total_quantity: 0,
              total_spent: 0,
            };
          }
          productMap[key].total_quantity += Number(item.quantity || 0);
          productMap[key].total_spent += Number(item.total || 0);
        });
      });

      const topProducts = Object.values(productMap).sort((a, b) => b.total_spent - a.total_spent).slice(0, 5);

      return {
        success: true,
        customer,
        summary: {
          total_lifetime_spent: totalSpent,
          total_orders_count: ordersCount,
          average_basket_value: avgOrder,
          first_purchase_date: sales[sales.length - 1]?.created_at || null,
          last_purchase_date: sales[0]?.created_at || null,
          current_khata_due: Number(customer.outstanding_balance || 0),
        },
        purchases: sales.map((s) => ({
          id: s.id,
          bill_number: s.bill_number,
          confirmed_at: s.confirmed_at || s.created_at,
          payment_mode: s.payment_mode,
          payment_status: s.payment_status,
          subtotal: Number(s.subtotal || 0),
          discount: Number(s.discount || 0),
          net_total: Number(s.net_total || 0),
          notes: s.notes,
          items: s.sale_items || [],
        })),
        top_products: topProducts,
        khata_payments: payments,
      };
    }

    // Local in-memory state
    const customer = await this.getCustomer(customerId, shopId);
    if (!customer) {
      const err = new Error('Customer account not found');
      err.statusCode = 404;
      throw err;
    }

    const sales = this.state.sales
      .filter((s) => s.shop_id === shopId && s.customer_id === customerId && s.status === 'confirmed')
      .map((s) => {
        const items = this.state.sale_items.filter((it) => it.sale_id === s.id);
        return {
          id: s.id,
          bill_number: s.bill_number,
          confirmed_at: s.confirmed_at || s.created_at,
          payment_mode: s.payment_mode,
          payment_status: s.payment_status,
          subtotal: Number(s.subtotal || 0),
          discount: Number(s.discount || 0),
          net_total: Number(s.net_total || 0),
          notes: s.notes,
          items,
        };
      })
      .sort((a, b) => new Date(b.confirmed_at) - new Date(a.confirmed_at));

    const payments = this.state.customer_payments
      .filter((p) => p.shop_id === shopId && p.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const totalSpent = sales.reduce((sum, s) => sum + (s.net_total || 0), 0);
    const ordersCount = sales.length;
    const avgOrder = ordersCount > 0 ? Number((totalSpent / ordersCount).toFixed(2)) : 0;

    const productMap = {};
    sales.forEach((s) => {
      s.items.forEach((item) => {
        const key = `${item.product_name}-${item.pack_size}`;
        if (!productMap[key]) {
          productMap[key] = {
            product_name: item.product_name,
            brand: item.brand,
            pack_size: item.pack_size,
            total_quantity: 0,
            total_spent: 0,
          };
        }
        productMap[key].total_quantity += Number(item.quantity || 0);
        productMap[key].total_spent += Number(item.total || 0);
      });
    });

    const topProducts = Object.values(productMap).sort((a, b) => b.total_spent - a.total_spent).slice(0, 5);

    return {
      success: true,
      customer,
      summary: {
        total_lifetime_spent: totalSpent,
        total_orders_count: ordersCount,
        average_basket_value: avgOrder,
        first_purchase_date: sales[sales.length - 1]?.confirmed_at || null,
        last_purchase_date: sales[0]?.confirmed_at || null,
        current_khata_due: Number(customer.outstanding_balance || 0),
      },
      purchases: sales,
      top_products: topProducts,
      khata_payments: payments,
    };
  }


  // Sales Lifecycle: Draft Creation (NO STOCK DEDUCTION)
  async createDraftSale(saleData) {
    const shop = await this.getShop(saleData.shop_id);
    let billNumber = saleData.bill_number?.trim();
    if (!billNumber) {
      let candidateNum = shop.next_bill_number || 1001;
      while (
        this.state.sales.some(
          (s) => s.shop_id === saleData.shop_id && s.bill_number === `${shop.bill_prefix}${candidateNum}`
        )
      ) {
        candidateNum++;
      }
      billNumber = `${shop.bill_prefix}${candidateNum}`;
    } else {
      // Verify duplicate bill number in this shop
      const duplicateBill = this.state.sales.find(
        (s) => s.shop_id === saleData.shop_id && s.bill_number === billNumber
      );
      if (duplicateBill) {
        const err = new Error(`Bill number "${billNumber}" is already in use.`);
        err.statusCode = 409;
        throw err;
      }
    }

    const saleId = uuidv4();
    const items = [];
    let subtotal = 0;

    for (const item of saleData.items) {
      const product = await this.getProduct(item.product_id, saleData.shop_id);
      if (!product) {
        const err = new Error(`Product not found with ID ${item.product_id}`);
        err.statusCode = 404;
        throw err;
      }
      const qty = Number(item.quantity);
      if (qty <= 0) {
        const err = new Error(`Item quantity must be greater than zero`);
        err.statusCode = 400;
        throw err;
      }

      const unitPrice = Number(item.unit_price ?? product.selling_price);
      const lineTotal = Number((qty * unitPrice).toFixed(2));
      subtotal += lineTotal;

      items.push({
        id: uuidv4(),
        sale_id: saleId,
        product_id: product.id,
        product_name: product.name,
        brand: product.brand,
        pack_size: product.pack_size,
        shade_code: product.shade_code,
        unit_of_measure: product.unit_of_measure || 'L',
        quantity: qty,
        unit_price: unitPrice,
        total: lineTotal,
        created_at: new Date().toISOString(),
      });
    }

    const discount = Number(saleData.discount || 0);
    const netTotal = Math.max(0, subtotal - discount);

    const draftSale = {
      id: saleId,
      shop_id: saleData.shop_id,
      customer_id: saleData.customer_id || null,
      customer_name: saleData.customer_name || 'Walk-in Retail Buyer',
      customer_phone: saleData.customer_phone || null,
      bill_number: billNumber,
      idempotency_key: saleData.idempotency_key || null,
      status: 'draft', // DRAFT - Stock is never deducted!
      subtotal,
      discount,
      tax_amount: 0,
      net_total: netTotal,
      payment_mode: saleData.payment_mode || 'Cash',
      payment_status: 'Unpaid',
      notes: saleData.notes || null,
      created_by: saleData.created_by || null,
      confirmed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items,
    };

    this.state.sales.unshift(draftSale);
    items.forEach((it) => this.state.sale_items.unshift(it));

    return draftSale;
  }

  async getSale(id, shopId) {
    const sale = this.state.sales.find((s) => s.id === id && s.shop_id === shopId);
    if (!sale) return null;
    const items = this.state.sale_items.filter((it) => it.sale_id === id);
    return { ...sale, items };
  }

  async listSales(shopId, filters = {}) {
    return this.state.sales
      .filter((s) => s.shop_id === shopId && (filters.status ? s.status === filters.status : true))
      .map((s) => {
        const items = this.state.sale_items.filter((it) => it.sale_id === s.id);
        return { ...s, items };
      });
  }

  // Atomic Confirmation: Serialized Row Locking, Idempotency Check, Negative Stock Prevention
  async confirmSaleAtomic(shopId, saleId, idempotencyKey, userId) {
    // 1. Idempotency Check
    if (idempotencyKey) {
      const alreadyConfirmed = this.state.sales.find(
        (s) => s.shop_id === shopId && s.idempotency_key === idempotencyKey && s.status === 'confirmed'
      );
      if (alreadyConfirmed) {
        const items = this.state.sale_items.filter((it) => it.sale_id === alreadyConfirmed.id);
        return {
          ...alreadyConfirmed,
          items,
          idempotent_replay: true,
        };
      }
    }

    // 2. Retrieve Sale
    const saleIndex = this.state.sales.findIndex((s) => s.id === saleId && s.shop_id === shopId);
    if (saleIndex === -1) {
      const err = new Error('Sale draft not found');
      err.statusCode = 404;
      throw err;
    }

    const sale = this.state.sales[saleIndex];
    const items = this.state.sale_items.filter((it) => it.sale_id === saleId);

    if (sale.status === 'confirmed') {
      return { ...sale, items, already_confirmed: true };
    }

    if (sale.status !== 'draft') {
      const err = new Error(`Sale is currently in status "${sale.status}" and cannot be confirmed.`);
      err.statusCode = 400;
      throw err;
    }

    // 3. Acquire row-level locks on product IDs to serialize concurrent deductions
    const productIds = items.map((it) => it.product_id);
    const releaseLock = await this.lock.acquire(productIds);

    try {
      // Check all products for sufficient stock
      for (const item of items) {
        const product = await this.getProduct(item.product_id, shopId);
        if (!product) {
          const err = new Error(`Product ${item.product_name} (${item.product_id}) not found`);
          err.statusCode = 404;
          throw err;
        }

        if (product.current_stock < item.quantity) {
          const err = new Error(
            `Insufficient stock for "${product.name}" (${product.brand}, Shade: ${product.shade_code}, Pack: ${product.pack_size}). Available: ${product.current_stock}, Requested: ${item.quantity}.`
          );
          err.statusCode = 400;
          err.code = 'INSUFFICIENT_STOCK';
          throw err;
        }
      }

      // 4. All checks passed: Deduct stock and log movements
      const movementsCreated = [];
      for (const item of items) {
        const product = await this.getProduct(item.product_id, shopId);
        const balanceBefore = Number(product.current_stock);
        const balanceAfter = Number((balanceBefore - item.quantity).toFixed(3));

        product.current_stock = balanceAfter;
        product.updated_at = new Date().toISOString();

        const movement = {
          id: uuidv4(),
          shop_id: shopId,
          product_id: product.id,
          movement_type: 'sale_deduction',
          quantity: -item.quantity, // signed negative
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          reference_type: 'sale',
          reference_id: saleId,
          reason: `Paper Bill confirmed: ${sale.bill_number}`,
          created_by: userId || null,
          created_at: new Date().toISOString(),
        };

        this.state.stock_movements.push(movement);
        movementsCreated.push(movement);
      }

      // 5. Update Khata if payment mode is Credit
      if (sale.payment_mode === 'Khata / Credit' && sale.customer_id) {
        const customer = await this.getCustomer(sale.customer_id, shopId);
        if (customer) {
          customer.outstanding_balance = Number((customer.outstanding_balance + sale.net_total).toFixed(2));
          customer.updated_at = new Date().toISOString();
        }
      }

      // 6. Confirm Sale & Increment sequence
      sale.status = 'confirmed';
      sale.idempotency_key = idempotencyKey || sale.idempotency_key;
      sale.confirmed_at = new Date().toISOString();
      sale.updated_at = new Date().toISOString();
      sale.payment_status = sale.payment_mode === 'Khata / Credit' ? 'Added to Khata' : 'Paid';

      const shop = await this.getShop(shopId);
      shop.next_bill_number = (shop.next_bill_number || 1000) + 1;

      // 7. Audit Log
      this.state.audit_logs.push({
        id: uuidv4(),
        shop_id: shopId,
        user_id: userId || null,
        action: 'CONFIRM_SALE',
        entity_type: 'sale',
        entity_id: saleId,
        new_values: {
          bill_number: sale.bill_number,
          net_total: sale.net_total,
          customer_name: sale.customer_name,
          payment_mode: sale.payment_mode,
        },
        created_at: new Date().toISOString(),
      });

      return { ...sale, items };
    } finally {
      releaseLock();
    }
  }

  // Inventory Movements: Receive Inward Stock
  async receiveStock(shopId, productId, quantity, invoiceNo, notes, userId) {
    const product = await this.getProduct(productId, shopId);
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      const err = new Error('Quantity received must be greater than zero');
      err.statusCode = 400;
      throw err;
    }

    const balanceBefore = Number(product.current_stock);
    const balanceAfter = Number((balanceBefore + qty).toFixed(3));

    product.current_stock = balanceAfter;
    product.updated_at = new Date().toISOString();

    const movement = {
      id: uuidv4(),
      shop_id: shopId,
      product_id: productId,
      movement_type: 'purchase_received',
      quantity: qty,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      reference_type: 'purchase_invoice',
      reference_id: null,
      reason: `Depot stock inward${invoiceNo ? ` (Invoice #${invoiceNo})` : ''}${notes ? `: ${notes}` : ''}`,
      created_by: userId || null,
      created_at: new Date().toISOString(),
    };

    this.state.stock_movements.push(movement);
    return { product, movement };
  }

  // Inventory Movements: Record Damaged / Leakage
  async recordDamaged(shopId, productId, quantity, reason, userId) {
    const product = await this.getProduct(productId, shopId);
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      const err = new Error('Damaged quantity must be greater than zero');
      err.statusCode = 400;
      throw err;
    }

    // STRICT CHECK: Cannot record more damage than current stock!
    if (qty > product.current_stock) {
      const err = new Error(
        `Cannot record ${qty} damaged units. Current stock for ${product.name} is only ${product.current_stock}.`
      );
      err.statusCode = 400;
      err.code = 'EXCESSIVE_DAMAGE_RECORD';
      throw err;
    }

    const balanceBefore = Number(product.current_stock);
    const balanceAfter = Number((balanceBefore - qty).toFixed(3));

    product.current_stock = balanceAfter;
    product.updated_at = new Date().toISOString();

    const movement = {
      id: uuidv4(),
      shop_id: shopId,
      product_id: productId,
      movement_type: 'damage_leakage',
      quantity: -qty, // signed negative
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      reference_type: 'damage_report',
      reference_id: null,
      reason: reason || 'Transit Leakage / Can Dent',
      created_by: userId || null,
      created_at: new Date().toISOString(),
    };

    this.state.stock_movements.push(movement);
    return { product, movement };
  }

  // Traceable Reversal (Never hard-delete posted movements!)
  async recordReversal(shopId, movementId, reversalReason, userId) {
    const original = this.state.stock_movements.find((m) => m.id === movementId && m.shop_id === shopId);
    if (!original) {
      const err = new Error('Stock movement record not found');
      err.statusCode = 404;
      throw err;
    }

    if (original.movement_type === 'reversal') {
      const err = new Error('Cannot reverse an existing reversal entry');
      err.statusCode = 400;
      throw err;
    }

    const product = await this.getProduct(original.product_id, shopId);
    const reverseQty = -original.quantity; // Invert signed quantity
    const balanceBefore = Number(product.current_stock);
    const balanceAfter = Number((balanceBefore + reverseQty).toFixed(3));

    if (balanceAfter < 0) {
      const err = new Error('Reversal would result in negative current stock balance');
      err.statusCode = 400;
      throw err;
    }

    product.current_stock = balanceAfter;
    product.updated_at = new Date().toISOString();

    const reversalMovement = {
      id: uuidv4(),
      shop_id: shopId,
      product_id: product.id,
      movement_type: 'reversal',
      quantity: reverseQty,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      reference_type: 'reversal_of_movement',
      reference_id: movementId,
      reason: `Audited Reversal of movement ${movementId}: ${reversalReason}`,
      created_by: userId || null,
      created_at: new Date().toISOString(),
    };

    this.state.stock_movements.push(reversalMovement);
    return { product, movement: reversalMovement };
  }

  async getStockMovements(shopId, productId = null) {
    let list = this.state.stock_movements.filter((m) => m.shop_id === shopId);
    if (productId) list = list.filter((m) => m.product_id === productId);
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async getInventoryBalances(shopId) {
    const products = await this.listProducts(shopId);
    const movements = await this.getStockMovements(shopId);

    return products.map((p) => {
      const pMovements = movements.filter((m) => m.product_id === p.id);
      const received = pMovements
        .filter((m) => m.movement_type === 'purchase_received')
        .reduce((sum, m) => sum + m.quantity, 0);
      const sold = pMovements
        .filter((m) => m.movement_type === 'sale_deduction')
        .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
      const damaged = pMovements
        .filter((m) => m.movement_type === 'damage_leakage')
        .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

      const isLow = p.current_stock <= p.reorder_threshold;
      return {
        ...p,
        stock_received: received,
        sold_quantity: sold,
        damaged_stock: damaged,
        is_low_stock: isLow,
      };
    });
  }
}

export const store = new DataStore();
export { DEFAULT_SHOP_ID };
