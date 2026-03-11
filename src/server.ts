import './config/env';
import http from 'http';
import app from './app';
import connectDB from './config/db';
import { initSocket } from './socket';
import { Room } from './modules/rooms/room.model';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

connectDB();

setInterval(async () => {
  await Room.deleteMany({ expiresAt: { $lt: new Date() } });
  console.log('Expired rooms cleaned');
}, 60000); // every 1 minute

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
