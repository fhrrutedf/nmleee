const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courseId = 'b1f384c3-a29a-48ba-8d93-560f37912b1c';
  const email = 'muhammadalbosta@gmail.com';

  console.log(`Checking enrollment for ${email} in ${courseId}...`);
  
  const enrollment = await prisma.courseEnrollment.findFirst({
    where: {
      courseId: courseId,
      studentEmail: {
        equals: email,
        mode: 'insensitive'
      }
    }
  });

  console.log('Enrollment found:', enrollment);
}

main().catch(console.error).finally(() => prisma.$disconnect());
