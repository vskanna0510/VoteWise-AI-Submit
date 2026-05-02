import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ok');
    expect(res.body.features).toBeDefined();
    expect(typeof res.body.features.translation).toBe('boolean');
  });
});
