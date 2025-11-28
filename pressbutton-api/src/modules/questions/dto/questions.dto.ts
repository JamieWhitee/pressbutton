import { ApiProperty } from '@nestjs/swagger';

export class QuestionsDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the question',
  })
  id: number;

  @ApiProperty({
    example: 'You get $1 million dollars',
    description: 'The positive outcome if the button is pressed',
  })
  positiveOutcome: string;

  @ApiProperty({
    example: 'But a random person dies',
    description: 'The negative outcome if the button is pressed',
  })
  negativeOutcome: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the user who created this question',
  })
  authorId: number;

  @ApiProperty({
    example: '2025-08-29T10:30:00Z',
    description: 'When the question was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-08-29T10:30:00Z',
    description: 'When the question was last updated',
  })
  updatedAt: Date;
}
