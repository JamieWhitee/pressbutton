import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ButtonChoice } from '@prisma/client';

export class VoteDto {
  @ApiProperty({
    description: 'User ID who is voting',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description:
      'Vote choice - either PRESS (willing to press the button) or DONT_PRESS (not willing to press)',
    enum: ButtonChoice,
    example: ButtonChoice.PRESS,
  })
  @IsEnum(ButtonChoice)
  @IsNotEmpty()
  choice: ButtonChoice;
}
