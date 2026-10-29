import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

const AUTH_HEADER = 'Bearer mock-owner-token';

describe('Validation Layer', () => {
  test('POST /api/products should reject payload missing required fields', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', AUTH_HEADER)
      .send({
        // Missing name, brand, category, pack_size, shade_code, selling_price
        rack_location: 'Aisle 1',
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(res.body.error.details));
  });

  test('POST /api/products should reject negative selling price', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', AUTH_HEADER)
      .send({
        name: 'Test Paint',
        brand: 'Asian Paints',
        category: 'Interior Emulsion',
        pack_size: '20 L',
        shade_code: '0112 Morning Sun',
        selling_price: -450, // Negative!
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  test('POST /api/sales/draft should reject sale with empty items array', async () => {
    const res = await request(app)
      .post('/api/sales/draft')
      .set('Authorization', AUTH_HEADER)
      .send({
        customer_name: 'Test Buyer',
        items: [], // Empty!
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  test('POST /api/sales/draft should reject item with zero or negative quantity', async () => {
    const res = await request(app)
      .post('/api/sales/draft')
      .set('Authorization', AUTH_HEADER)
      .send({
        customer_name: 'Test Buyer',
        items: [
          {
            product_id: '10000000-0000-0000-0000-000000000001',
            quantity: 0, // Zero!
          },
        ],
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  test('POST /api/inventory/receive should reject negative quantity', async () => {
    const res = await request(app)
      .post('/api/inventory/receive')
      .set('Authorization', AUTH_HEADER)
      .send({
        product_id: '10000000-0000-0000-0000-000000000001',
        quantity: -5,
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });
});
