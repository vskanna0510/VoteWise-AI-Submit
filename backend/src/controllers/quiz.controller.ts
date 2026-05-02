import { Request, Response, NextFunction } from 'express';
import { QuizQuestion } from '../models/QuizQuestion';
import { User } from '../models/User';
import { HttpError } from '../middleware/error';
import type { QuizSubmitInput } from '../validators/quiz.schema';
import crypto from 'crypto';

export const listQuestions = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questions = await QuizQuestion.find({ isActive: true })
      .select('question options topic difficulty')
      .lean();
    res.json({ success: true, questions });
  } catch (err) {
    next(err);
  }
};

export const submitQuiz = async (
  req: Request<unknown, unknown, QuizSubmitInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { answers } = req.body;
    const ids = answers.map((a) => a.questionId);
    const questions = await QuizQuestion.find({ _id: { $in: ids } }).lean();
    const map = new Map(questions.map((q) => [String(q._id), q]));

    let correct = 0;
    const result = answers.map((a) => {
      const q = map.get(a.questionId);
      const isCorrect = !!q && q.correctIndex === a.selectedIndex;
      if (isCorrect) correct += 1;
      return {
        questionId: a.questionId,
        correct: isCorrect,
        correctIndex: q?.correctIndex,
        explanation: q?.explanation,
      };
    });

    const total = answers.length;
    const score = Math.round((correct / Math.max(total, 1)) * 100);
    const passed = score >= 70;
    const certificateId = passed
      ? `VW-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
      : undefined;

    if (req.user?.sub) {
      await User.findByIdAndUpdate(req.user.sub, {
        $max: { quizScore: score },
        $set: { learningStage: passed ? 'mastery' : 'practice' },
      });
    }

    res.json({
      success: true,
      total,
      correct,
      score,
      passed,
      certificateId,
      result,
    });
  } catch (err) {
    next(err);
  }
};
