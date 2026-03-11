import { Request, Response } from 'express';
import { Room } from './room.model';

export const createRoom = async (req: any, res: Response) => {
  const { name, durationMinutes } = req.body;

  const expiresAt = new Date(
    Date.now() + durationMinutes * 60 * 1000
  );

  const room = await Room.create({
    name,
    creator: req.user.id,
    participants: [req.user.id],
    expiresAt,
  });

  res.status(201).json(room);
};

export const getActiveRooms = async (_: Request, res: Response) => {
  const rooms = await Room.find({
    expiresAt: { $gt: new Date() },
  }).populate('creator', 'name');

  res.json(rooms);
};

export const joinRoom = async (req: any, res: Response) => {
  const room = await Room.findById(req.params.roomId);

  if (!room) return res.status(404).json({ message: 'Room not found' });

  if (room.expiresAt < new Date())
    return res.status(400).json({ message: 'Room expired' });

  if (room.participants.length >= room.maxParticipants)
    return res.status(400).json({ message: 'Room full' });

  if (!room.participants.includes(req.user.id)) {
    room.participants.push(req.user.id);
    await room.save();
  }

  res.json(room);
};
