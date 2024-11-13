const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { avatar, bio } = req.body;

    const updatedProfile = await prisma.profile.upsert({
      where: {
        userId: userId,
      },
      update: {
        avatar,
        bio,
      },
      create: {
        userId,
        avatar,
        bio,
      },
    });

    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(400).json({ error: "Failed to update profile" });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const { password, ...userWithoutPassword } = profile;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: "Failed to fetch profile" });
  }
};

module.exports = {
  updateProfile,
  getProfile,
};