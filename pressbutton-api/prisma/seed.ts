// @ts-nocheck
import { PrismaClient, ButtonChoice } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  // 准备好问题模板 / Prepare question templates
  const questionTemplates = [
    {
      positive: '你拥有数不清的钱',
      negative: '你会失去你所有的家人',
    },
    {
      positive: '你的猫可以活30年',
      negative: '你不能拥有其他任何宠物',
    },
    {
      positive: '你每天获得500块',
      negative: '你没有其他任何经济来源',
    },
    {
      positive: '你能读懂所有动物的想法',
      negative: '所有动物都能读懂你的想法',
    },
    {
      positive: '你永远不会生病',
      negative: '你永远不能吃甜食',
    },
    {
      positive: '你能预知未来一周的事情',
      negative: '你不能改变任何你预知的事情',
    },
    {
      positive: '你能瞬间传送到任何地方',
      negative: '每次传送都会随机失去一个记忆',
    },
    {
      positive: '你能控制时间流速',
      negative: '你的寿命会按比例缩短',
    },
    {
      positive: '你拥有完美的记忆力',
      negative: '你不能忘记任何痛苦的回忆',
    },
    {
      positive: '你能和已故的人对话',
      negative: '活着的人再也听不到你的声音',
    },
    {
      positive: '你能隐身',
      negative: '你永远不能再变回可见状态',
    },
    {
      positive: '你拥有无限的知识',
      negative: '你失去所有的情感',
    },
    {
      positive: '你能飞行',
      negative: '你永远不能接触地面',
    },
    {
      positive: '你能让任何人爱上你',
      negative: '你永远不能体验真正的爱情',
    },
    {
      positive: '你能治愈任何疾病',
      negative: '你承受被治愈者的所有痛苦',
    },
    {
      positive: '你拥有永恒的青春',
      negative: '你看着所有爱的人慢慢老去',
    },
    {
      positive: '你能实现任何愿望',
      negative: '每个愿望都会以意想不到的方式扭曲',
    },
    {
      positive: '你能和世界上任何人交换身体',
      negative: '你不能控制何时交换回来',
    },
    {
      positive: '你能复活一个人',
      negative: '你必须牺牲另一个人的生命',
    },
    {
      positive: '你能成为世界首富',
      negative: '你的每一分钱都来自别人的痛苦',
    },
  ];

  // 评论模板 / Comment templates
  const commentTemplates = [
    '这个选择太难了！我完全不知道该怎么选择。',
    '我觉得好处远大于坏处，我会按下按钮。',
    '坏处太可怕了，我绝对不会按这个按钮。',
    '这种两难的选择真的很考验人性。',
    '如果是你，你会怎么选择呢？',
    '我想了很久，还是觉得不值得冒险。',
    '生活本身就充满了这样的选择，很现实。',
    '好处虽然诱人，但代价太高了。',
    '这让我想起了哲学课上讨论的道德难题。',
    '每个人的价值观不同，选择也会不同。',
    '我宁愿维持现状，也不愿意冒这个险。',
    '有时候得到什么就意味着要失去什么。',
    '这个问题设计得很巧妙，很有启发性。',
    '我觉得这种交换完全不公平。',
    '如果能改变一些条件就好了。',
    '这种假设性的问题总是让人深思。',
    '我的选择可能会随着年龄增长而改变。',
    '这考验的不仅是理性，还有情感。',
    '现实中很少有这么极端的选择。',
    '但如果真的面临这种选择，我可能会崩溃。'
  ];

  // 创建密码哈希 / Create password hash (same for all users)
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 创建10个测试用户 / Create 10 test users
  const users: any[] = [];
  for (let i = 1; i <= 10; i++) {
    console.log(`👤 Creating user test${i}...`);
    const user = await prisma.user.upsert({
      where: { email: `test${i}@test.com` },
      update: {},
      create: {
        email: `test${i}@test.com`,
        name: `Test User ${i}`,
        password: hashedPassword,
        accountType: 'REGULAR',
      },
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users successfully!`);

  // 为每个用户创建2个问题 / Create 2 questions for each user
  const questions: any[] = [];
  let questionCounter = 1;

  for (let userIndex = 0; userIndex < users.length; userIndex++) {
    const user = users[userIndex];
    console.log(`❓ Creating questions for ${user.name}...`);

    // 为每个用户创建2个问题
    for (let questionIndex = 0; questionIndex < 2; questionIndex++) {
      // 从模板中选择问题（循环使用）
      const templateIndex = (userIndex * 2 + questionIndex) % questionTemplates.length;
      const template = questionTemplates[templateIndex];

      const question = await prisma.question.upsert({
        where: { id: questionCounter },
        update: {},
        create: {
          positiveOutcome: template.positive,
          negativeOutcome: template.negative,
          authorId: user.id,
        },
      });

      questions.push(question);
      questionCounter++;
    }
  }

  console.log(`✅ Created ${questions.length} questions successfully!`);

  // 为每个问题创建评论和投票 / Create comments and votes for each question
  for (let questionIndex = 0; questionIndex < questions.length; questionIndex++) {
    const question = questions[questionIndex];
    console.log(`💬 Creating comments and votes for question ${question.id}...`);

    // 为每个问题创建2个评论 / Create 2 comments for each question
    for (let commentIndex = 0; commentIndex < 2; commentIndex++) {
      // 随机选择一个用户作为评论者（不一定是问题作者）
      const randomUserIndex = Math.floor(Math.random() * users.length);
      const commenter = users[randomUserIndex];

      // 随机选择一个评论模板
      const randomCommentIndex = Math.floor(Math.random() * commentTemplates.length);
      const commentContent = commentTemplates[randomCommentIndex];

      await prisma.comment.create({
        data: {
          content: commentContent,
          userId: commenter.id,
          questionId: question.id,
        },
      });
    }

    // 为每个问题创建0-3个随机投票 / Create 0-3 random votes for each question
    const voteCount = Math.floor(Math.random() * 4); // 0-3个投票
    const votersUsed = new Set(); // 防止同一用户重复投票

    for (let voteIndex = 0; voteIndex < voteCount; voteIndex++) {
      // 随机选择一个还没投票的用户
      let randomUserIndex;
      let attempts = 0;
      do {
        randomUserIndex = Math.floor(Math.random() * users.length);
        attempts++;
      } while (votersUsed.has(randomUserIndex) && attempts < 20); // 最多尝试20次避免无限循环

      if (attempts < 20) { // 只有找到可用用户才创建投票
        const voter = users[randomUserIndex];
        votersUsed.add(randomUserIndex);

        // 随机选择投票选项 / Randomly choose vote option
        const choices: ButtonChoice[] = ['PRESS', 'DONT_PRESS'];
        const randomChoice = choices[Math.floor(Math.random() * choices.length)];

        await prisma.vote.create({
          data: {
            choice: randomChoice,
            userId: voter.id,
            questionId: question.id,
          },
        });
      }
    }

    console.log(`   ✅ Created 2 comments and ${voteCount} votes for question ${question.id}`);
  }

  console.log('🎉 Seed data created successfully!');
  console.log(`📊 Summary:`);
  console.log(`   👥 Users: ${users.length}`);
  console.log(`   ❓ Questions: ${questions.length}`);
  console.log(`   💬 Comments: ${questions.length * 2}`);
  console.log(`   🗳️  Votes: Random (0-3 per question)`);
  console.log('🔐 All users have password: 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
