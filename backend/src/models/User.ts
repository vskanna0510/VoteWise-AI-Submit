import { Schema, model, Document, Types } from 'mongoose';
import { USER_ROLES, LEARNING_STAGES, SUPPORTED_LANGUAGES, UserRole, LearningStage, Language } from '../config/constants';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  language: Language;
  learningStage: LearningStage;
  checklistProgress: number; // 0..100
  quizScore: number;
  accessibility: {
    fontSize: 'sm' | 'md' | 'lg' | 'xl';
    highContrast: boolean;
    dyslexiaFont: boolean;
    voiceInput: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true, default: 'first_time_voter', index: true },
    language: { type: String, enum: SUPPORTED_LANGUAGES, default: 'en' },
    learningStage: { type: String, enum: LEARNING_STAGES, default: 'discover' },
    checklistProgress: { type: Number, default: 0, min: 0, max: 100 },
    quizScore: { type: Number, default: 0, min: 0 },
    accessibility: {
      fontSize: { type: String, enum: ['sm', 'md', 'lg', 'xl'], default: 'md' },
      highContrast: { type: Boolean, default: false },
      dyslexiaFont: { type: Boolean, default: false },
      voiceInput: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1, role: 1 });

export const User = model<IUser>('User', UserSchema);
