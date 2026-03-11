import { Request, Response } from 'express';
import { registerUser, loginUser } from './auth.service';
import { getAllUsersExceptMe } from './auth.service';
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};
export const getUsers = async (req: any, res: any) => {
  try {
    const users = await getAllUsersExceptMe(req.userId);
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
