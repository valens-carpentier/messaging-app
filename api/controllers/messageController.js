const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;
    let imageUrl = null;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const message = await prisma.message.create({
      data: {
        content: content || null,
        imageUrl,
        senderId,
        recipientId
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
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
                    // Messages sent by logged-in user to specific recipient
                    { AND: [{ senderId: userId }, { recipientId }] },
                    // Messages received by logged-in user from specific recipient
                    { AND: [{ senderId: recipientId }, { recipientId: userId }] }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            },
            select: {
                id: true,
                content: true,
                imageUrl: true,
                createdAt: true,
                senderId: true,
                recipientId: true,
                sender: {
                    select: {
                        username: true
                    }
                },
                recipient: {
                    select: {
                        username: true
                    }
                }
            }
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(400).json({ error: "Failed to fetch messages" });
    }
};

const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all unique users that the current user has interacted with
        const conversations = await prisma.user.findMany({
            where: {
                OR: [
                    // Users who have sent messages to the current user
                    {
                        sentMessages: {
                            some: {
                                recipientId: userId
                            }
                        }
                    },
                    // Users who have received messages from the current user
                    {
                        receivedMessages: {
                            some: {
                                senderId: userId
                            }
                        }
                    }
                ]
            },
            select: {
                id: true,
                username: true,
                status: true,
                profile: {
                    select: {
                        avatar: true
                    }
                },
                // Get the latest message for sorting
                sentMessages: {
                    where: {
                        recipientId: userId
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                },
                receivedMessages: {
                    where: {
                        senderId: userId
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        });

        // Format the response
        const formattedConversations = conversations.map(conv => ({
            userId: conv.id,
            username: conv.username,
            status: conv.status,
            avatar: conv.profile?.avatar,
            lastMessage: getLastMessage(conv.sentMessages, conv.receivedMessages)
        }));

        // Sort by latest message
        formattedConversations.sort((a, b) => {
            const dateA = a.lastMessage?.createdAt || 0;
            const dateB = b.lastMessage?.createdAt || 0;
            return new Date(dateB) - new Date(dateA);
        });

        res.status(200).json(formattedConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(400).json({ error: "Failed to fetch conversations" });
    }
};

// Helper function to get the most recent message between sent and received
const getLastMessage = (sent, received) => {
    const sentMessage = sent[0];
    const receivedMessage = received[0];

    if (!sentMessage && !receivedMessage) return null;
    if (!sentMessage) return receivedMessage;
    if (!receivedMessage) return sentMessage;

    return new Date(sentMessage.createdAt) > new Date(receivedMessage.createdAt)
        ? sentMessage
        : receivedMessage;
};

const getAvailableUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } }, // Exclude the current user
        ]
      },
      select: {
        id: true,
        username: true,
        status: true,
        profile: {
          select: {
            avatar: true
          }
        }
      },
      orderBy: {
        username: 'asc'
      }
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching available users:', error);
    res.status(400).json({ error: "Failed to fetch users" });
  }
};

module.exports = {
  sendMessage,
  getMessagesByRecipientID,
  getConversations,
  getAvailableUsers,
  upload
};