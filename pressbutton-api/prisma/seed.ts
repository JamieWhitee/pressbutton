import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // upsert 一个用户当示例
  await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { email: 'alice@example.com', name: 'Alice' },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect()); // 注意：不是 async 回调
