import Message from './chat.model';

export const saveMessage = async (
  sender: string,
  receiver: string,
  content: string
) => {
  const message = await Message.create({ sender, receiver, content });
  return message;
};

export const getChatHistory = async (
  user1: string,
  user2: string
) => {
  return Message.find({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 },
    ],
  }).sort({ createdAt: 1 });
};
