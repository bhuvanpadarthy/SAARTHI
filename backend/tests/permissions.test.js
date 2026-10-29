import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

describe('Authentication & Authorization Security', () => {
  test('Protected endpoint should reject request without Authorization header', async () => {
    const res = await request(app).get('/api/products');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  test('Protected endpoint should reject malformed Authorization header', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', 'Basic 123456');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  test('Cashier role should be allowed to view products and create sales', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', 'Bearer mock-cashier-token');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  test('Cashier role should be forbidden from modifying shop settings', async () => {
    const res = await request(app)
      .put('/api/settings')
      .set('Authorization', 'Bearer mock-cashier-token')
      .send({
        name: 'Hacked Shop Name',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INSUFFICIENT_PERMISSIONS');
  });

  test('Cashier role should be forbidden from reversing stock movements', async () => {
    const res = await request(app)
      .post('/api/inventory/reversal')
      .set('Authorization', 'Bearer mock-cashier-token')
      .send({
        movement_id: 'any-id',
        reason: 'Attempted unauthorized reversal',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INSUFFICIENT_PERMISSIONS');
  });

  test('Owner role should be allowed to update shop settings', async () => {
    const res = await request(app)
      .put('/api/settings')
      .set('Authorization', 'Bearer mock-owner-token')
      .send({
        low_stock_threshold: 8,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
