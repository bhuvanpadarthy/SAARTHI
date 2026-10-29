import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

describe('Health API', () => {
  test('GET /api/health should return UP status and server metadata', async () => {
    const res = await request(app).get('/api/health');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'UP');
    assert.ok(res.body.data.uptime >= 0);
    assert.ok(res.body.data.timestamp);
    assert.ok(res.body.data.database);
  });

  test('GET /api/unknown-endpoint should return 404 with standard error format', async () => {
    const res = await request(app).get('/api/unknown-route-xyz');

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'ROUTE_NOT_FOUND');
  });
});
