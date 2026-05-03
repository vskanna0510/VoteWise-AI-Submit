import { describe, it, expect } from 'vitest';
import { chatSchema } from '../src/validators/chat.schema';

describe('chatSchema', () => {
  it('parses assistant chat minimum fields', () => {
    const out = chatSchema.parse({
      prompt: 'How do I register?',
      sessionId: 'sess-aaaaaaaa',
    });
    expect(out.context).toBeUndefined();
  });

  it('accepts bounded context attachments', () => {
    const out = chatSchema.parse({
      prompt: 'Next step?',
      sessionId: 'abcd-5678-xxxx',
      context: {
        role: 'student',
        language: 'en',
        learningStage: 'learn',
        checklistProgress: 40,
      },
    });
    expect(out.context?.learningStage).toBe('learn');
  });

  it('rejects overlong prompts', () => {
    const prompt = 'x'.repeat(2001);
    expect(() =>
      chatSchema.parse({ prompt, sessionId: '1234-5678-9abc-def0' }),
    ).toThrow();
  });
});
