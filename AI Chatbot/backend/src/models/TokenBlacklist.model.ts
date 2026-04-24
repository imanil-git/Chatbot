import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITokenBlacklist extends Document {
  jti: string;
  expiresAt: Date;
  revokedAt: Date;
}

interface ITokenBlacklistModel extends Model<ITokenBlacklist> {
  // Check if a specific jti is blacklisted
  isBlacklisted(jti: string): Promise<boolean>;
  // Add a jti to the blacklist database
  add(jti: string, expiresAt: Date): Promise<void>;
}

const TokenBlacklistSchema = new Schema<ITokenBlacklist, ITokenBlacklistModel>({
  jti: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: Date.now }
});

// Automatically delete documents when expiresAt is reached
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

TokenBlacklistSchema.statics.isBlacklisted = async function(jti: string): Promise<boolean> {
  const result = await this.findOne({ jti });
  return !!result;
};

TokenBlacklistSchema.statics.add = async function(jti: string, expiresAt: Date): Promise<void> {
  await this.create({ jti, expiresAt });
};

export const TokenBlacklist = mongoose.model<ITokenBlacklist, ITokenBlacklistModel>('TokenBlacklist', TokenBlacklistSchema);
