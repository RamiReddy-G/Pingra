import jwt from 'jsonwebtoken';

const authMiddleware = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token');

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as any;

    req.userId = decoded.id.toString();
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export default authMiddleware;
