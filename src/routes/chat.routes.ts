import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import { getChatHistory } from '../modules/chat/chat.service';

const router = Router();

router.get('/:userId', authMiddleware, async (req: any, res) => {
  const myId = req.userId;
  const otherId = req.params.userId;

  const messages = await getChatHistory(myId, otherId);
  res.json(messages);
});

export default router;
