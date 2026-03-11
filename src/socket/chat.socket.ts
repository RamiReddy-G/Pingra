import { Server, Socket } from 'socket.io';
import { saveMessage } from '../modules/chat/chat.service';

export const chatSocket = (io: Server, socket: Socket) => {
  socket.on('private_message', async ({ to, message }) => {
    try {
      const senderId = socket.data.userId;
      const receiverId = to.toString();

      const savedMessage = await saveMessage(
        senderId,
        receiverId,
        message
      );

      // Send ONLY to receiver
      io.to(receiverId).emit('private_message', savedMessage);

      console.log(`Message ${savedMessage._id} from ${senderId} → ${receiverId}`);
    } catch (error) {
      console.error('private_message error', error);
    }
  });
  socket.on('typing_start', ({ to }) => {
  io.to(to).emit('typing_start', {
    from: socket.data.userId,
  });
});

socket.on('typing_stop', ({ to }) => {
  io.to(to).emit('typing_stop', {
    from: socket.data.userId,
  });
});
};
