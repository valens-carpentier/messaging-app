const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  try {
    // Update all online users to offline
    await prisma.user.updateMany({
      where: { status: 'ONLINE' },
      data: { status: 'OFFLINE' }
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = cleanup;