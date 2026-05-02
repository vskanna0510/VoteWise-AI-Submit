import { Request, Response, NextFunction } from 'express';
import { TimelineStep } from '../models/TimelineStep';
import { HttpError } from '../middleware/error';

export const listSteps = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const steps = await TimelineStep.find({ isActive: true }).sort({ order: 1 }).lean();
    res.json({ success: true, steps });
  } catch (err) {
    next(err);
  }
};

export const createStep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const step = await TimelineStep.create(req.body);
    res.status(201).json({ success: true, step });
  } catch (err) {
    next(err);
  }
};

export const updateStep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const step = await TimelineStep.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!step) throw new HttpError(404, 'Step not found');
    res.json({ success: true, step });
  } catch (err) {
    next(err);
  }
};
