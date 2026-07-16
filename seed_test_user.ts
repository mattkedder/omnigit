import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if test user already exists
  let user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://github.com/ghost.png',
        accounts: {
          create: {
            type: 'oauth',
            provider: 'github',
            providerAccountId: '123456789',
            access_token: 'dummy_oauth_token',
          }
        },
        sessions: {
          create: {
            sessionToken: 'dummy_session_token_123',
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        }
      }
    });
    console.log('✅ Created Test User:', user.name);
  } else {
    console.log('Test User already exists.');
  }

  console.log('\n--- HOW TO LOG IN ---');
  console.log('1. Open your browser to http://localhost:3000');
  console.log('2. Open Developer Tools (F12 or Cmd+Option+I) -> Application Tab -> Cookies');
  console.log('3. Add a new cookie:');
  console.log('   Name: next-auth.session-token');
  console.log('   Value: dummy_session_token_123');
  console.log('4. Refresh the page! You will instantly be logged in and see the PAT dialog.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
