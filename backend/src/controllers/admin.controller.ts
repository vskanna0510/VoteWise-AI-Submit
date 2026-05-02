import { Request, Response, NextFunction } from 'express';
import { ChatLog } from '../models/ChatLog';
import { User } from '../models/User';
import { FAQ } from '../models/FAQ';

export const analytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [totalUsers, totalChats, refusedChats, intentStats, roleStats, faqViews] = await Promise.all([
      User.countDocuments(),
      ChatLog.countDocuments(),
      ChatLog.countDocuments({ safetyStatus: 'refused' }),
      ChatLog.aggregate([
        { $group: { _id: '$intent', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      FAQ.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } },
      ]),
    ]);

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalChats,
        refusedChats,
        refusalRate: totalChats > 0 ? Math.round((refusedChats / totalChats) * 100) : 0,
        intentDistribution: intentStats,
        roleDistribution: roleStats,
        totalFaqViews: faqViews[0]?.totalViews ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
