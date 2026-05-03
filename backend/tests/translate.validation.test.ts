import { describe, it, expect } from 'vitest';
import { translateBodySchema } from '../src/validators/translate.schema';

describe('translateBodySchema', () => {
  it('accepts minimal valid payloads', () => {
    const out = translateBodySchema.parse({
      texts: ['Hello'],
      target: 'hi',
    });
    expect(out.source).toBe('en');
    expect(out.texts).toEqual(['Hello']);
  });

  it('rejects empty text fragments', () => {
    expect(() =>
      translateBodySchema.parse({ texts: [''], target: 'hi' }),
    ).toThrow();
  });

  it('caps array length', () => {
    const texts = Array.from({ length: 101 }, (_, i) => `t${i}`);
    expect(() => translateBodySchema.parse({ texts, target: 'ta' })).toThrow();
  });

  it('rejects unsupported language codes', () => {
    expect(() =>
      translateBodySchema.parse({
        texts: ['x'],
        // @ts-expect-error intentional invalid target for defensive testing
        target: 'xx',
      }),
    ).toThrow();
  });
});
