import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

const FaqSchema = new Schema({
  question: { type: String, required: true },
  answerHtml: { type: String },
  answerJson: { type: Schema.Types.Mixed },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true }
}, { timestamps: true });

FaqSchema.index({ order: 1 });

export type Faq = InferSchemaType<typeof FaqSchema> & { _id: string };

export const FaqModel: Model<Faq> =
  (mongoose.models.Faq as Model<Faq>) || mongoose.model<Faq>('Faq', FaqSchema);
