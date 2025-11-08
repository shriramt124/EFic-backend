import mongoose, { Schema, InferSchemaType, Model } from 'mongoose';

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String },
  thumbnailUrl: { type: String },
  repoUrl: { type: String },
  liveUrl: { type: String },
  tags: [{ type: String }],
  featured: { type: Boolean, default: false },
}, { timestamps: true });

ProjectSchema.index({ name: 'text', slug: 1 });

export type Project = InferSchemaType<typeof ProjectSchema> & { _id: string };

export const ProjectModel: Model<Project> =
  (mongoose.models.Project as Model<Project>) || mongoose.model<Project>('Project', ProjectSchema);
