import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITokenBlacklist extends Document {
  token: string;
  expiresAt: Date;
  revokedAt: Date;
}

interface ITokenBlacklistModel extends Model<ITokenBlacklist> {
  isBlacklisted(token: string): Promise<boolean>;
  add(token: string, expiresAt: Date): Promise<void>;
}

const TokenBlacklistSchema = new Schema<ITokenBlacklist, ITokenBlacklistModel>({
  token: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: Date.now }
});

TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

TokenBlacklistSchema.statics.isBlacklisted = async function(token: string): Promise<boolean> {
  const result = await this.findOne({ token });
  return !!result;
};

TokenBlacklistSchema.statics.add = async function(token: string, expiresAt: Date): Promise<void> {
  await this.create({ token, expiresAt });
};

export const TokenBlacklist = mongoose.model<ITokenBlacklist, ITokenBlacklistModel>('TokenBlacklist', TokenBlacklistSchema);
