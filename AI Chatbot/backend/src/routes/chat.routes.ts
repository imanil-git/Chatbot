import { Router } from 'express';
import { handleChat } from '../controllers/chat.controller';
import { validate } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { chatRequestSchema } from '../validators/chat.validators';

const router = Router();

router.post('/', requireAuth, validate(chatRequestSchema), handleChat);

export default router;
