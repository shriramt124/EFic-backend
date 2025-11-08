import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

const CategorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String },
}, { timestamps: true });

CategorySchema.index({ name: 1, slug: 1 });

export type Category = InferSchemaType<typeof CategorySchema> & { _id: string };

export const CategoryModel: Model<Category> =
  (mongoose.models.Category as Model<Category>) || mongoose.model<Category>('Category', CategorySchema);
