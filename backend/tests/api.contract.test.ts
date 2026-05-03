import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';

describe('API surface', () => {
  it('GET / exposes service metadata', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('votewise-ai-api');
    expect(res.body.health).toContain('/api/health');
  });

  it('GET /api summarizes primary routes', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body.health).toBe('/api/health');
    expect(res.body.translate).toBe('/api/translate');
    expect(res.body.chat).toBe('/api/chat');
  });

  it('responds with structured 404 hints', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeTruthy();
    expect(JSON.stringify(res.body)).toContain('hint');
  });
});
