import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserRole } from '../config/constants';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  email: string;
}

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_SECRET) as JwtPayload;
