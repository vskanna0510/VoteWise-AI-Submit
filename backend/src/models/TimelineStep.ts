import { Schema, model, Document } from 'mongoose';

export interface ITimelineStep extends Document {
  order: number;
  key: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  durationDays: number;
  icon: string;
  color: string;
  resources: { label: string; url: string }[];
  isActive: boolean;
}

const TimelineStepSchema = new Schema<ITimelineStep>(
  {
    order: { type: Number, required: true, unique: true, index: true },
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true },
    shortDescription: { type: String, required: true, maxlength: 240 },
    longDescription: { type: String, required: true, maxlength: 4000 },
    durationDays: { type: Number, default: 1 },
    icon: { type: String, default: 'Calendar' },
    color: { type: String, default: '#8b5cf6' },
    resources: [
      {
        label: { type: String },
        url: { type: String },
      },
    ],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const TimelineStep = model<ITimelineStep>('TimelineStep', TimelineStepSchema);
