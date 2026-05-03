import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../src/validators/auth.schema';

describe('registerSchema', () => {
  it('requires strong password composition', () => {
    expect(() =>
      registerSchema.parse({
        name: 'Ada',
        email: 'Ada@Example.COM',
        password: 'weak',
        role: 'student',
      }),
    ).toThrow();
    const ok = registerSchema.parse({
      name: 'Ada',
      email: 'Ada@Example.COM',
      password: 'Str0ngPass',
      role: 'student',
    });
    expect(ok.email).toBe('ada@example.com');
  });

  it('applies sane length bounds', () => {
    expect(() =>
      registerSchema.parse({
        name: 'A',
        email: 'a@b.co',
        password: 'Str0ngPass',
      }),
    ).toThrow();
  });
});

describe('loginSchema', () => {
  it('normalizes email casing', () => {
    const out = loginSchema.parse({
      email: 'User@SITE.org',
      password: 'anything',
    });
    expect(out.email).toBe('user@site.org');
  });
});
