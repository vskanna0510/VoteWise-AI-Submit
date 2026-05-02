import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { askAssistant } from '../services/geminiService';
import { ChatLog } from '../models/ChatLog';
import type { ChatInput } from '../validators/chat.schema';

export const chat = async (
  req: Request<unknown, unknown, ChatInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const start = Date.now();
    const { prompt, sessionId, context } = req.body;

    const result = await askAssistant(prompt, context ?? {});
    const latencyMs = Date.now() - start;

    // Fire-and-forget logging (don't fail the request if it errors)
    ChatLog.create({
      userId: req.user?.sub ? new Types.ObjectId(req.user.sub) : undefined,
      sessionId,
      prompt,
      response: result.text,
      intent: result.intent,
      userType: context?.role ?? 'guest',
      confidence: result.confidence,
      safetyStatus: result.safetyStatus,
      latencyMs,
    }).catch(() => undefined);

    res.json({
      success: true,
      ...result,
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};
