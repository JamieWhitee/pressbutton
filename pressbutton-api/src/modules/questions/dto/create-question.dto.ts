import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, MinLength } from 'class-validator';

/**
 * Data Transfer Object (DTO) for creating a new question
 * This class defines the structure and validation rules for question creation requests
 */
export class CreateQuestionDto {
  @ApiProperty({
    description:
      'The positive outcome that happens if the user presses the button',
    example:
      'You will gain superpowers and become the strongest person on Earth',
    minLength: 5,
  })
  @IsString({ message: 'Positive outcome must be a string' })
  @IsNotEmpty({ message: 'Positive outcome cannot be empty' })
  @MinLength(5, {
    message: 'Positive outcome must be at least 5 characters long',
  })
  positiveOutcome: string;

  @ApiProperty({
    description:
      'The negative outcome that happens if the user presses the button',
    example: 'You will lose all your memories of your loved ones',
    minLength: 5,
  })
  @IsString({ message: 'Negative outcome must be a string' })
  @IsNotEmpty({ message: 'Negative outcome cannot be empty' })
  @MinLength(5, {
    message: 'Negative outcome must be at least 5 characters long',
  })
  negativeOutcome: string;

  @ApiProperty({
    description: 'The ID of the user who is creating this question',
    example: 1,
    type: 'integer',
  })
  @IsNumber({}, { message: 'Author ID must be a number' })
  @IsNotEmpty({ message: 'Author ID is required' })
  authorId: number;
}
