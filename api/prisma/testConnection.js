const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('Database connection successful')
    
    // Try to query users
    const users = await prisma.user.findMany()
    console.log('Users in database:', users.length)
    
  } catch (error) {
    console.error('Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection() 