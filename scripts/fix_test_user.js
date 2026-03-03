const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = "ahmad@test.com";
  const password = "123456";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true
    },
    create: {
      name: "Ahmed Test",
      email,
      username: "ahmed_tester",
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true
    }
  });

  console.log("USER_READY:", user.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
