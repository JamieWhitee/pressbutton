import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // upsert 一个用户当示例
  await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      name: 'Test User',
      password: '123456', // 临时密码，实际应用中需要哈希
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
