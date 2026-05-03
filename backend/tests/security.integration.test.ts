import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';

describe('Security middleware', () => {
  it('returns Helmet-derived security headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-dns-prefetch-control']).toBeTruthy();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('rejects oversized JSON bodies with client error', async () => {
    const junk = Buffer.alloc(1_250_000, 'x').toString();
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send(`{"email":"a@b.co","password":"${junk}"}`);
    expect([413, 400]).toContain(res.status);
  });
});
