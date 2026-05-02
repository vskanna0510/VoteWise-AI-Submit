import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { signToken } from '../utils/jwt';
import { env } from '../config/env';
import { HttpError } from '../middleware/error';
import type { RegisterInput, LoginInput } from '../validators/auth.schema';

const sanitize = (u: any) => ({
  id: u._id.toString(),
  name: u.name,
  email: u.email,
  role: u.role,
  language: u.language,
  learningStage: u.learningStage,
  checklistProgress: u.checklistProgress,
  quizScore: u.quizScore,
  accessibility: u.accessibility,
});

export const register = async (
  req: Request<unknown, unknown, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role, language } = req.body;

    const existing = await User.findOne({ email });
    if (existing) throw new HttpError(409, 'Email already in use');

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash, role, language });
    const token = signToken({ sub: user._id.toString(), role: user.role, email: user.email });
    res.status(201).json({ success: true, token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request<unknown, unknown, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new HttpError(401, 'Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, 'Invalid credentials');

    const token = signToken({ sub: user._id.toString(), role: user.role, email: user.email });
    res.json({ success: true, token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new HttpError(401, 'Authentication required');
    const user = await User.findById(req.user.sub);
    if (!user) throw new HttpError(404, 'User not found');
    res.json({ success: true, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
};
