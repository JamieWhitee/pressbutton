import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { QuestionsDto } from './dto/questions.dto';

describe('QuestionsController', () => {
  let controller: QuestionsController;
  let service: QuestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        {
          provide: QuestionsService,
          useValue: {
            getAllQuestions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<QuestionsController>(QuestionsController);
    service = module.get<QuestionsService>(QuestionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllQuestions', () => {
    it('should return an array of questions', async () => {
      // Arrange: Setup test data
      const mockQuestions: QuestionsDto[] = [
        {
          id: 1,
          positiveOutcome: 'You get $1 million dollars',
          negativeOutcome: 'But a random person dies',
          authorId: 1,
          createdAt: new Date('2025-08-29T10:30:00Z'),
          updatedAt: new Date('2025-08-29T10:30:00Z'),
        },
        {
          id: 2,
          positiveOutcome: 'You become immortal',
          negativeOutcome: 'But you feel constant pain',
          authorId: 2,
          createdAt: new Date('2025-08-29T11:00:00Z'),
          updatedAt: new Date('2025-08-29T11:00:00Z'),
        },
      ];

      // Mock the service method to return our test data
      jest.spyOn(service, 'getAllQuestions').mockResolvedValue(mockQuestions);

      // Act: Call the controller method
      const result = await controller.getAllQuestions();

      // Assert: Check the results
      expect(result).toEqual(mockQuestions);
      expect(result).toHaveLength(2);
      expect(service.getAllQuestions).toHaveBeenCalledTimes(1);
      expect(service.getAllQuestions).toHaveBeenCalledWith();
    });

    it('should return empty array when no questions exist', async () => {
      // Arrange: Mock empty result
      jest.spyOn(service, 'getAllQuestions').mockResolvedValue([]);

      // Act: Call the controller method
      const result = await controller.getAllQuestions();

      // Assert: Check the results
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(service.getAllQuestions).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors properly', async () => {
      // Arrange: Mock service to throw error
      const errorMessage = 'Database connection failed';
      jest
        .spyOn(service, 'getAllQuestions')
        .mockRejectedValue(new Error(errorMessage));

      // Act & Assert: Expect the error to be thrown
      await expect(controller.getAllQuestions()).rejects.toThrow(errorMessage);
      expect(service.getAllQuestions).toHaveBeenCalledTimes(1);
    });
  });
});
