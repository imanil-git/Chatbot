import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service';

export const handleChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, sessionId } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const generator = ChatService.sendMessage(sessionId, message);

    for await (const chunk of generator) {
      res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    next(error);
  }
};
