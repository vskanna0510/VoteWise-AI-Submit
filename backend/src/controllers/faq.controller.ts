import { Request, Response, NextFunction } from 'express';
import { FAQ } from '../models/FAQ';
import { HttpError } from '../middleware/error';

export const listFaqs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, q } = req.query;
    const filter: Record<string, unknown> = { isActive: true };
    if (category) filter.category = category;
    if (q) filter.$text = { $search: String(q) };
    const faqs = await FAQ.find(filter).sort({ views: -1, createdAt: -1 }).limit(100).lean();
    res.json({ success: true, faqs });
  } catch (err) {
    next(err);
  }
};

export const createFaq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json({ success: true, faq });
  } catch (err) {
    next(err);
  }
};

export const updateFaq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) throw new HttpError(404, 'FAQ not found');
    res.json({ success: true, faq });
  } catch (err) {
    next(err);
  }
};

export const deleteFaq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) throw new HttpError(404, 'FAQ not found');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
