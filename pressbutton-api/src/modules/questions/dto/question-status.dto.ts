import { ApiProperty } from '@nestjs/swagger';

export class QuestionStatusDto {
  @ApiProperty({
    description: 'Total number of positive votes',
    example: 150,
  })
  positiveVotes: number;

  @ApiProperty({
    description: 'Total number of negative votes',
    example: 75,
  })
  negativeVotes: number;

  @ApiProperty({
    description: 'Total number of all votes',
    example: 225,
  })
  totalVotes: number;

  @ApiProperty({
    description: 'Percentage of positive votes',
    example: 66.67,
  })
  positivePercentage: number;
}
