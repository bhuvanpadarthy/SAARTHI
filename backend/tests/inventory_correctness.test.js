import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { store, DEFAULT_SHOP_ID } from '../src/storage/store.js';

const AUTH_HEADER = 'Bearer mock-owner-token';

describe('Inventory & Sales Correctness', () => {
  beforeEach(() => {
    store.reset();
  });

  test('Draft bill must NEVER deduct stock', async () => {
    // Royale Luxury 20L initial stock is 3
    const productBefore = await store.getProduct('10000000-0000-0000-0000-000000000001', DEFAULT_SHOP_ID);
    const initialStock = productBefore.current_stock;
    assert.equal(initialStock, 3);

    // 1. Create a draft paper bill for 2 units
    const res = await request(app)
      .post('/api/sales/draft')
      .set('Authorization', AUTH_HEADER)
      .send({
        customer_name: 'Walk-in Draft Buyer',
        items: [
          {
            product_id: '10000000-0000-0000-0000-000000000001',
            quantity: 2,
          },
        ],
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'draft');

    // 2. Stock must still remain exactly 3!
    const productAfter = await store.getProduct('10000000-0000-0000-0000-000000000001', DEFAULT_SHOP_ID);
    assert.equal(productAfter.current_stock, 3, 'Draft bill must not alter stock');

    // 3. No stock movement should exist for this draft
    const movements = await store.getStockMovements(DEFAULT_SHOP_ID, '10000000-0000-0000-0000-000000000001');
    const draftMovement = movements.find((m) => m.reference_id === res.body.data.id);
    assert.equal(draftMovement, undefined, 'No stock movement must be posted for a draft');
  });

  test('Confirmed sale must atomically deduct stock and record traceable movement', async () => {
    const productBefore = await store.getProduct('10000000-0000-0000-0000-000000000001', DEFAULT_SHOP_ID);
    const initialStock = productBefore.current_stock;

    // 1. Create draft
    const draftRes = await request(app)
      .post('/api/sales/draft')
      .set('Authorization', AUTH_HEADER)
      .send({
        customer_name: 'Verified Buyer',
        items: [
          {
            product_id: '10000000-0000-0000-0000-000000000001',
            quantity: 2,
          },
        ],
      });

    const saleId = draftRes.body.data.id;

    // 2. Confirm sale
    const confirmRes = await request(app)
      .post(`/api/sales/${saleId}/confirm`)
      .set('Authorization', AUTH_HEADER)
      .send({
        idempotency_key: 'idem-key-test-01',
      });

    assert.equal(confirmRes.status, 200);
    assert.equal(confirmRes.body.success, true);
    assert.equal(confirmRes.body.data.status, 'confirmed');

    // 3. Stock must be decremented by exactly 2
    const productAfter = await store.getProduct('10000000-0000-0000-0000-000000000001', DEFAULT_SHOP_ID);
    assert.equal(productAfter.current_stock, initialStock - 2);

    // 4. Movement ledger must contain signed deduction entry
    const movements = await store.getStockMovements(DEFAULT_SHOP_ID, '10000000-0000-0000-0000-000000000001');
    const saleMovement = movements.find((m) => m.reference_id === saleId);
    assert.ok(saleMovement, 'Stock movement must be recorded');
    assert.equal(saleMovement.movement_type, 'sale_deduction');
    assert.equal(saleMovement.quantity, -2);
    assert.equal(saleMovement.balance_before, initialStock);
    assert.equal(saleMovement.balance_after, initialStock - 2);
  });

  test('Insufficient stock must cause immediate transaction rejection and leave stock intact', async () => {
    const productBefore = await store.getProduct('10000000-0000-0000-0000-000000000001', DEFAULT_SHOP_ID);
    const initialStock = productBefore.current_stock; // 3

    // 1. Create draft requesting 10 tins (exceeds available 3)
    const draftRes = await request(app)
      .post('/api/sales/draft')
      .set('Authorization', AUTH_HEADER)
      .send({
        customer_name: 'Over-buyer',
        items: [
          {
            product_id: '10000000-0000-0000-0000-000000000001',
            quantity: 10,
          },
        ],
      });

    const saleId = draftRes.body.data.id;

    // 2. Attempt confirmation
    const confirmRes = await request(app)
      .post(`/api/sales/${saleId}/confirm`)
      .set('Authorization', AUTH_HEADER)
      .send();

    assert.equal(confirmRes.status, 400);
    assert.equal(confirmRes.body.success, false);
    assert.equal(confirmRes.body.error.code, 'INSUFFICIENT_STOCK');

    // 3. Verify stock is completely unchanged!
    const productAfter = await store.getProduct('10000000-0000-0000-0000-000000000001', DEFAULT_SHOP_ID);
    assert.equal(productAfter.current_stock, initialStock);
  });

  test('Duplicate bill posting with same idempotency key must replay safely without double deduction', async () => {
    const productBefore = await store.getProduct('10000000-0000-0000-0000-000000000001', DEFAULT_SHOP_ID);
    const initialStock = productBefore.current_stock; // 3

    const draftRes = await request(app)
      .post('/api/sales/draft')
      .set('Authorization', AUTH_HEADER)
      .send({
        customer_name: 'Idempotency Buyer',
        items: [
          {
            product_id: '10000000-0000-0000-0000-000000000001',
            quantity: 1,
          },
        ],
      });

    const saleId = draftRes.body.data.id;
    const idempotencyKey = 'IDEMPOTENT-SERIAL-999';

    // First confirm call
    const res1 = await request(app)
      .post(`/api/sales/${saleId}/confirm`)
      .set('Authorization', AUTH_HEADER)
      .send({ idempotency_key: idempotencyKey });

    assert.equal(res1.status, 200);

    // Second confirm call with identical idempotency key (e.g. repeated user button clicks)
    const res2 = await request(app)
      .post(`/api/sales/${saleId}/confirm`)
      .set('Authorization', AUTH_HEADER)
      .send({ idempotency_key: idempotencyKey });

    assert.equal(res2.status, 200);

    // Verify stock was decremented ONLY ONCE (from 3 to 2, not to 1)
    const productAfter = await store.getProduct('10000000-0000-0000-0000-000000000001', DEFAULT_SHOP_ID);
    assert.equal(productAfter.current_stock, initialStock - 1);
  });

  test('Duplicate bill number must be rejected on creation', async () => {
    // 1. Create first draft with explicit bill number
    const res1 = await request(app)
      .post('/api/sales/draft')
      .set('Authorization', AUTH_HEADER)
      .send({
        bill_number: 'PB-DUP-TEST-01',
        items: [{ product_id: '10000000-0000-0000-0000-000000000001', quantity: 1 }],
      });
    assert.equal(res1.status, 201);

    // 2. Attempt creating second draft with the exact same bill number
    const res2 = await request(app)
      .post('/api/sales/draft')
      .set('Authorization', AUTH_HEADER)
      .send({
        bill_number: 'PB-DUP-TEST-01',
        items: [{ product_id: '10000000-0000-0000-0000-000000000001', quantity: 1 }],
      });

    assert.equal(res2.status, 409);
    assert.equal(res2.body.success, false);
    assert.match(res2.body.error.message, /already in use/i);
  });

  test('Excessive damaged stock entry exceeding balance must be strictly rejected', async () => {
    const product = await store.getProduct('10000000-0000-0000-0000-000000000001', DEFAULT_SHOP_ID);
    assert.equal(product.current_stock, 3);

    // Attempt to record 10 units of damage when only 3 are in stock
    const res = await request(app)
      .post('/api/inventory/damage')
      .set('Authorization', AUTH_HEADER)
      .send({
        product_id: product.id,
        quantity: 10,
        reason: 'Broken drum during transit',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'EXCESSIVE_DAMAGE_RECORD');

    // Stock must stay 3
    const productAfter = await store.getProduct(product.id, DEFAULT_SHOP_ID);
    assert.equal(productAfter.current_stock, 3);
  });

  test('Concurrent sales serialization prevents overselling limited inventory', async () => {
    // Product has 3 in stock
    const product = await store.getProduct('10000000-0000-0000-0000-000000000001', DEFAULT_SHOP_ID);
    assert.equal(product.current_stock, 3);

    // Create 2 separate drafts, each for 2 units (Total requested = 4, but stock is only 3)
    const draft1 = await store.createDraftSale({
      shop_id: DEFAULT_SHOP_ID,
      items: [{ product_id: product.id, quantity: 2 }],
    });

    const draft2 = await store.createDraftSale({
      shop_id: DEFAULT_SHOP_ID,
      items: [{ product_id: product.id, quantity: 2 }],
    });

    // Execute confirmations concurrently
    const [res1, res2] = await Promise.allSettled([
      store.confirmSaleAtomic(DEFAULT_SHOP_ID, draft1.id, 'idem-c1', 'user-01'),
      store.confirmSaleAtomic(DEFAULT_SHOP_ID, draft2.id, 'idem-c2', 'user-01'),
    ]);

    // One must succeed, and one must be rejected with INSUFFICIENT_STOCK!
    const results = [res1, res2];
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    assert.equal(fulfilled.length, 1, 'Only one sale should succeed');
    assert.equal(rejected.length, 1, 'The conflicting sale must be rejected');
    assert.match(rejected[0].reason.message, /insufficient stock/i);

    // Balance must be exactly 3 - 2 = 1, never negative!
    const productFinal = await store.getProduct(product.id, DEFAULT_SHOP_ID);
    assert.equal(productFinal.current_stock, 1);
  });

  test('Stock reconciliation: derived stock from ledger matches current stock', async () => {
    const balances = await store.getInventoryBalances(DEFAULT_SHOP_ID);
    for (const b of balances) {
      assert.ok(b.current_stock >= 0, 'Current stock must be non-negative');
      assert.equal(typeof b.stock_received, 'number');
      assert.equal(typeof b.sold_quantity, 'number');
      assert.equal(typeof b.damaged_stock, 'number');
    }
  });

  test('Customer payment reduces Khata balance and logs payment record', async () => {
    const customer = await store.getCustomer('20000000-0000-0000-0000-000000000001', DEFAULT_SHOP_ID);
    const balanceBefore = customer.outstanding_balance; // 14500

    const res = await request(app)
      .post(`/api/customers/${customer.id}/payments`)
      .set('Authorization', AUTH_HEADER)
      .send({
        amount: 4500,
        payment_mode: 'UPI',
        reference_no: 'UPI-REF-00124',
        notes: 'Settlement for Green Park project',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.amount, 4500);
    assert.equal(res.body.data.balance_before, balanceBefore);
    assert.equal(res.body.data.balance_after, balanceBefore - 4500);

    const customerAfter = await store.getCustomer(customer.id, DEFAULT_SHOP_ID);
    assert.equal(customerAfter.outstanding_balance, balanceBefore - 4500);
  });
});
