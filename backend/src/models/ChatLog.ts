import { Schema, model, Document, Types } from 'mongoose';

export interface IChatLog extends Document {
  userId?: Types.ObjectId;
  sessionId: string;
  prompt: string;
  response: string;
  intent: string;
  userType: string;
  confidence: number;
  safetyStatus: 'safe' | 'refused' | 'flagged';
  latencyMs: number;
  createdAt: Date;
}

const ChatLogSchema = new Schema<IChatLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, required: true, index: true },
    prompt: { type: String, required: true, maxlength: 4000 },
    response: { type: String, required: true, maxlength: 8000 },
    intent: { type: String, default: 'unknown', index: true },
    userType: { type: String, default: 'unknown' },
    confidence: { type: Number, default: 0 },
    safetyStatus: {
      type: String,
      enum: ['safe', 'refused', 'flagged'],
      default: 'safe',
      index: true,
    },
    latencyMs: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ChatLog = model<IChatLog>('ChatLog', ChatLogSchema);
