import { Schema, model, Document } from 'mongoose';

export interface IQuizQuestion extends Document {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  isActive: boolean;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true, trim: true, maxlength: 500 },
    options: {
      type: [String],
      validate: [(v: string[]) => v.length >= 2 && v.length <= 6, 'options must be 2-6'],
      required: true,
    },
    correctIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, required: true, maxlength: 1000 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy', index: true },
    topic: { type: String, required: true, lowercase: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const QuizQuestion = model<IQuizQuestion>('QuizQuestion', QuizQuestionSchema);
