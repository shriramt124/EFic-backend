import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

const PostSchema = new Schema({
  // Primary blog metadata
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  coverImageUrl: { type: String },
  readTime: { type: Number, default: 0 }, // minutes estimate
  url: { type: String }, // canonical / external link if needed

  // Content (retain option to store both formats for flexibility)
  contentHtml: { type: String },
  contentJson: { type: Schema.Types.Mixed },

  // Optional supporting data
  excerpt: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  publishedAt: { type: Date },
}, { timestamps: true });

PostSchema.index({ title: 'text', excerpt: 'text', slug: 1 });

export type Post = InferSchemaType<typeof PostSchema> & { _id: string };

export const PostModel: Model<Post> =
  (mongoose.models.Post as Model<Post>) || mongoose.model<Post>('Post', PostSchema);
