import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * Data Transfer Object (DTO) for creating a new question with JWT authentication
 * This class defines the structure and validation rules for authenticated question creation
 * The authorId is automatically extracted from the JWT token, so it's not included here
 */
export class CreateQuestionAuthDto {
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
}
