import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../src/utils/jwt';

describe('JWT utilities', () => {
  it('sign + verify restores payload claims', () => {
    const token = signToken({
      sub: '507f1f77bcf86cd799439011',
      role: 'student',
      email: 'citizen@votewise.ai',
    });
    const out = verifyToken(token);
    expect(out.sub).toBe('507f1f77bcf86cd799439011');
    expect(out.role).toBe('student');
    expect(out.email).toBe('citizen@votewise.ai');
  });

  it('rejects malformed JWT material', () => {
    expect(() => verifyToken('not-a-real-jwt')).toThrow();
    const valid = signToken({
      sub: '507f191e810c19729de860ea',
      role: 'first_time_voter',
      email: 'v@w.ai',
    });
    expect(() =>
      verifyToken(`${valid.slice(0, Math.max(10, valid.length - 15))}_tampered`),
    ).toThrow();
  });
});
