const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;  // This comes from the auth middleware

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        recipientId
      }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: "Failed to send message" });
  }
};

const getMessagesByRecipientID = async (req, res) => {
    try {
        const userId = req.user.id;
        const { recipientId } = req.params;

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    // Messages sent from logged-in user to specific recipient
                    { AND: [{ senderId: userId }, { recipientId: recipientId }] },
                    // Messages received by logged-in user from specific recipient
                    { AND: [{ senderId: recipientId }, { recipientId: userId }] }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                recipient: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        res.status(200).json(messages);
    } catch (error) {
        res.status(400).json({ error: "Failed to fetch messages" });
    }
};

module.exports = {
  sendMessage,
  getMessagesByRecipientID
};