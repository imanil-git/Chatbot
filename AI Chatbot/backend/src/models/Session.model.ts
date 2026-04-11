import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ISession extends Document {
  sessionId: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ISessionModel extends Model<ISession> {
  appendMessage(sessionId: string, message: IMessage): Promise<ISession>;
}

const messageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const sessionSchema = new Schema<ISession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  messages: { type: [messageSchema], default: [] }
}, {
  timestamps: true
});

sessionSchema.statics.appendMessage = async function(sessionId: string, message: IMessage) {
  return this.findOneAndUpdate(
    { sessionId },
    { $push: { messages: message } },
    { new: true, upsert: true }
  );
};

export const Session = mongoose.model<ISession, ISessionModel>('Session', sessionSchema);
