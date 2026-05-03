import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';
import * as ChatLogModule from '../src/models/ChatLog';

describe('POST /api/chat (Gemini path)', () => {
  const geminiSentence =
    'Mock Gemini: Use the Election Commission voter portal or SMS service to verify your enrolment.';
  /** Avoid hitting Mongo when ChatLog.create runs in the controller. */
  let createSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'vitest-fake-gemini-key';
    createSpy = vi.spyOn(ChatLogModule.ChatLog, 'create').mockReturnValue(Promise.resolve() as never);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: geminiSentence }] } }],
        }),
      }),
    );
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    vi.unstubAllGlobals();
    createSpy.mockRestore();
  });

  it('returns source=gemini when fetch returns a candidate', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        prompt: 'How can I verify that I appear on the electoral roll?',
        sessionId: 'integration-test-session-01',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.source).toBe('gemini');
    expect(res.body.text).toBe(geminiSentence);
    expect(res.body.latencyMs).toBeGreaterThanOrEqual(0);

    expect(globalThis.fetch).toHaveBeenCalled();
    const urls = vi.mocked(globalThis.fetch).mock.calls.map(([u]) =>
      typeof u === 'string' ? u : (u as Request).url,
    );
    expect(urls.some((u) => u.includes('generativelanguage.googleapis.com'))).toBe(true);
  });

  it('does not call Gemini when the decision engine refuses the prompt', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        prompt: 'Who should I vote for in this election?',
        sessionId: 'integration-test-session-02',
      });
    expect(res.status).toBe(200);
    expect(res.body.source).toBe('decision-engine');
    expect(res.body.safetyStatus).toBe('refused');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
