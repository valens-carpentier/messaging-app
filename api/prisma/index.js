const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    await prisma.user.create({
        data: {
          username: 'alice123',
          email: 'alice@prisma.io',
          password: 'hashedPasswordHere',
          status: 'OFFLINE',
          profile: {
            create: { bio: 'I like turtles' },
          },
        },
      })
    
      const allUsers = await prisma.user.findMany({
        include: {
          profile: true,
          sentMessages: true,
          receivedMessages: true
        },
      })
      console.dir(allUsers, { depth: null })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })