import { z } from 'zod';

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().uuid()
});

export type ChatRequestType = z.infer<typeof chatRequestSchema>;
