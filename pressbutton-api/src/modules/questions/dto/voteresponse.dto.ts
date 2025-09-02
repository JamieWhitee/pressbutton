import { ApiProperty } from '@nestjs/swagger';
import { ButtonChoice } from '@prisma/client';

export class VoteResponseDto {
  @ApiProperty({
    description: 'ID of the created vote',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Question ID that was voted on',
    example: 1,
  })
  questionId: number;

  @ApiProperty({
    description: 'User ID who voted',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'Vote choice made',
    enum: ButtonChoice,
  })
  choice: ButtonChoice;

  @ApiProperty({
    description: 'Timestamp when vote was created',
  })
  createdAt: Date;
}
