import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ButtonChoice } from '@prisma/client';

/**
 * DTO for voting on questions - only contains the choice, user ID comes from JWT
 * 投票DTO - 只包含选择，用户ID来自JWT令牌
 */
export class VoteChoiceDto {
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
