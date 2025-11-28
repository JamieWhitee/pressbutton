import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsService } from './questions.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        {
          provide: PrismaService,
          useValue: {
            question: {
              findMany: jest.fn(),
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllQuestions', () => {
    it('should return an array of questions', async () => {
      const mockQuestions = [
        {
          id: 1,
          positiveOutcome: 'You get $1M',
          negativeOutcome: 'Someone dies',
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Directly access the mock function from the provider's value to avoid unbound method issues
      const findManyMock = prisma.question.findMany as jest.Mock;
      findManyMock.mockResolvedValue(mockQuestions);

      const result = await service.getAllQuestions();
      expect(result).toEqual(mockQuestions);
      // Ensure the mock function was called
      expect(findManyMock).toHaveBeenCalled();
    });
  });
});
