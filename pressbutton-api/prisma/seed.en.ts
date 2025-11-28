/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient, ButtonChoice } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  const questionTemplates = [
    {
      positive: 'You have unlimited money',
      negative: 'You lose all your family',
    },
    {
      positive: 'Your cat can live for 30 years',
      negative: 'You cannot own any other pets',
    },
    {
      positive: 'You get $500 every day',
      negative: 'You have no other source of income',
    },
    {
      positive: "You can read all animals' minds",
      negative: 'All animals can read your mind',
    },
    { positive: 'You never get sick', negative: 'You can never eat sweets' },
    {
      positive: 'You can see one week into the future',
      negative: 'You cannot change anything you foresee',
    },
    {
      positive: 'You can teleport anywhere instantly',
      negative: 'You lose a random memory each time',
    },
    {
      positive: 'You can control time',
      negative: 'Your lifespan shortens proportionally',
    },
    {
      positive: 'You have perfect memory',
      negative: 'You cannot forget any painful memories',
    },
    {
      positive: 'You can talk to the deceased',
      negative: 'The living can no longer hear you',
    },
    {
      positive: 'You can become invisible',
      negative: 'You can never become visible again',
    },
    {
      positive: 'You have infinite knowledge',
      negative: 'You lose all emotions',
    },
    { positive: 'You can fly', negative: 'You can never touch the ground' },
    {
      positive: 'You can make anyone fall in love with you',
      negative: 'You can never experience true love',
    },
    {
      positive: 'You can cure any disease',
      negative: 'You absorb all the pain of those you heal',
    },
    {
      positive: 'You have eternal youth',
      negative: 'You watch everyone you love grow old',
    },
    {
      positive: 'You can grant any wish',
      negative: 'Each wish twists in unexpected ways',
    },
    {
      positive: 'You can swap bodies with anyone',
      negative: 'You cannot control when you swap back',
    },
    {
      positive: 'You can resurrect one person',
      negative: 'You must sacrifice another life',
    },
    {
      positive: 'You become the richest person alive',
      negative: "Every dollar comes from someone else's suffering",
    },
  ];

  const commentTemplates = [
    'This choice is so difficult! I have no idea what to choose.',
    'I think the benefit outweighs the consequence, I would press it.',
    'The consequence is too terrible, I would never press this button.',
    'This kind of dilemma really tests human nature.',
    'If it were you, what would you choose?',
    "I thought about it for a long time, but it's still not worth the risk.",
    'Life itself is full of such choices, very realistic.',
    'The benefit is tempting, but the price is too high.',
    'This reminds me of moral dilemmas discussed in philosophy class.',
    'Everyone has different values, so choices will differ.',
  ];

  const hashedPassword = await bcrypt.hash('123456', 10);

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

  const questions: any[] = [];
  let questionCounter = 1;

  for (let userIndex = 0; userIndex < users.length; userIndex++) {
    const user = users[userIndex];
    console.log(`❓ Creating questions for ${user.name}...`);

    for (let questionIndex = 0; questionIndex < 2; questionIndex++) {
      const templateIndex =
        (userIndex * 2 + questionIndex) % questionTemplates.length;
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

  for (
    let questionIndex = 0;
    questionIndex < questions.length;
    questionIndex++
  ) {
    const question = questions[questionIndex];
    console.log(
      `💬 Creating comments and votes for question ${question.id}...`,
    );

    for (let commentIndex = 0; commentIndex < 2; commentIndex++) {
      const randomUserIndex = Math.floor(Math.random() * users.length);
      const commenter = users[randomUserIndex];
      const randomCommentIndex = Math.floor(
        Math.random() * commentTemplates.length,
      );
      const commentContent = commentTemplates[randomCommentIndex];

      await prisma.comment.create({
        data: {
          content: commentContent,
          userId: commenter.id,
          questionId: question.id,
        },
      });
    }

    const voteCount = Math.floor(Math.random() * 4);
    const votersUsed = new Set();

    for (let voteIndex = 0; voteIndex < voteCount; voteIndex++) {
      let randomUserIndex;
      let attempts = 0;
      do {
        randomUserIndex = Math.floor(Math.random() * users.length);
        attempts++;
      } while (votersUsed.has(randomUserIndex) && attempts < 20);

      if (attempts < 20) {
        const voter = users[randomUserIndex];
        votersUsed.add(randomUserIndex);
        const choices: ButtonChoice[] = ['PRESS', 'DONT_PRESS'];
        const randomChoice =
          choices[Math.floor(Math.random() * choices.length)];

        await prisma.vote.create({
          data: {
            choice: randomChoice,
            userId: voter.id,
            questionId: question.id,
          },
        });
      }
    }

    console.log(
      `   ✅ Created 2 comments and ${voteCount} votes for question ${question.id}`,
    );
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
