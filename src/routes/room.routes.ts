import { Router } from 'express';
import {
  createRoom,
  getActiveRooms,
  joinRoom,
} from '../modules/rooms/room.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createRoom);
router.get('/', authMiddleware, getActiveRooms);
router.post('/:roomId/join', authMiddleware, joinRoom);

export default router;
