// Centralized API Client for SAARTHI Backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = localStorage.getItem('saarthi_auth_token') || 'mock-owner-token';
    this.shopId = localStorage.getItem('saarthi_shop_id') || '00000000-0000-0000-0000-000000000001';
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('saarthi_auth_token', token);
    } else {
      localStorage.removeItem('saarthi_auth_token');
    }
  }

  setShopId(shopId) {
    this.shopId = shopId;
    if (shopId) {
      localStorage.setItem('saarthi_shop_id', shopId);
    } else {
      localStorage.removeItem('saarthi_shop_id');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(this.shopId ? { 'x-shop-id': this.shopId } : {}),
      ...(options.headers || {}),
    };

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data?.error?.message || `API request failed with status ${response.status}`);
        error.status = response.status;
        error.code = data?.error?.code || 'API_ERROR';
        error.details = data?.error?.details || null;
        throw error;
      }

      return data;
    } catch (err) {
      // If network error (backend down / unreachable)
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const netErr = new Error('Cannot connect to backend server. Is backend running on ' + this.baseUrl + '?');
        netErr.code = 'NETWORK_ERROR';
        throw netErr;
      }
      throw err;
    }
  }

  // Health check
  health = {
    check: () => this.request('/health', { method: 'GET' }),
  };

  // Products API
  products = {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/products${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    get: (id) => this.request(`/products/${id}`, { method: 'GET' }),
    create: (data) => this.request('/products', { method: 'POST', body: data }),
    update: (id, data) => this.request(`/products/${id}`, { method: 'PUT', body: data }),
  };

  // Inventory API
  inventory = {
    getBalances: () => this.request('/inventory/balances', { method: 'GET' }),
    getMovements: (productId) => {
      const query = productId ? `?product_id=${productId}` : '';
      return this.request(`/inventory/movements${query}`, { method: 'GET' });
    },
    receiveStock: (data) => this.request('/inventory/receive', { method: 'POST', body: data }),
    recordDamage: (data) => this.request('/inventory/damage', { method: 'POST', body: data }),
    recordReversal: (data) => this.request('/inventory/reversal', { method: 'POST', body: data }),
  };

  // Sales API
  sales = {
    createDraft: (data) => this.request('/sales/draft', { method: 'POST', body: data }),
    get: (id) => this.request(`/sales/${id}`, { method: 'GET' }),
    confirm: (id, idempotencyKey) =>
      this.request(`/sales/${id}/confirm`, {
        method: 'POST',
        headers: idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : {},
        body: { idempotency_key: idempotencyKey },
      }),
    list: (status = 'confirmed') => this.request(`/sales?status=${status}`, { method: 'GET' }),
    getDailySummary: () => this.request('/sales/analytics/daily-summary', { method: 'GET' }),
  };

  // Customers API
  customers = {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/customers${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    get: (id) => this.request(`/customers/${id}`, { method: 'GET' }),
    getPurchases: (id) => this.request(`/customers/${id}/purchases`, { method: 'GET' }),
    create: (data) => this.request('/customers', { method: 'POST', body: data }),
    recordPayment: (customerId, data) =>
      this.request(`/customers/${customerId}/payments`, { method: 'POST', body: data }),
  };

  // Reports API
  reports = {
    getSalesSummary: (period = 'today') =>
      this.request(`/reports/sales-summary?period=${period}`, { method: 'GET' }),
    getLowStock: () => this.request('/reports/low-stock', { method: 'GET' }),
  };

  // Settings API
  settings = {
    get: () => this.request('/settings', { method: 'GET' }),
    update: (data) => this.request('/settings', { method: 'PUT', body: data }),
  };
}

export const api = new ApiClient(API_BASE_URL);
