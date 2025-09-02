import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

/**
 * Data Transfer Object (DTO) for deleting a question
 * This class defines the structure and validation rules for question deletion requests
 */
export class DeleteQuestionDto {
  @ApiProperty({
    description:
      'The unique identifier of the question to be deleted. This question must exist and belong to the specified author.',
    example: 1,
    type: 'integer',
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Question ID is required' })
  @IsNumber({}, { message: 'Question ID must be a number' })
  questionId: number;

  @ApiProperty({
    description:
      'The unique identifier of the author (user) who owns the question. Only the question owner can delete their own questions.',
    example: 1,
    type: 'integer',
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Author ID is required' })
  @IsNumber({}, { message: 'Author ID must be a number' })
  authorId: number;
}
