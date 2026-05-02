import { Schema, model, Document } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: 'registration' | 'voting' | 'eligibility' | 'process' | 'general';
  tags: string[];
  views: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true, trim: true, maxlength: 300 },
    answer: { type: String, required: true, trim: true, maxlength: 4000 },
    category: {
      type: String,
      enum: ['registration', 'voting', 'eligibility', 'process', 'general'],
      default: 'general',
      index: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    views: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

FAQSchema.index({ question: 'text', answer: 'text', tags: 'text' });

export const FAQ = model<IFAQ>('FAQ', FAQSchema);
