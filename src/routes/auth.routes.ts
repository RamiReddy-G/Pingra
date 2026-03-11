import { Router } from 'express';
import { register, login } from '../modules/auth/auth.controller';
import { getUsers } from '../modules/auth/auth.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', authMiddleware, getUsers);

export default router;
