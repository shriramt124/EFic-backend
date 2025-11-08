import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

const TestimonialSchema = new Schema({
  author: { type: String, required: true },
  role: { type: String },
  avatarUrl: { type: String },
  content: { type: String, required: true },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

TestimonialSchema.index({ author: 1 });

export type Testimonial = InferSchemaType<typeof TestimonialSchema> & { _id: string };

export const TestimonialModel: Model<Testimonial> =
  (mongoose.models.Testimonial as Model<Testimonial>) || mongoose.model<Testimonial>('Testimonial', TestimonialSchema);
