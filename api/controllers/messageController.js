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
  getAvailableUsers
};