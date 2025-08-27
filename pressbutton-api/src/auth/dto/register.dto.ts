// src/auth/dto/register.dto.ts
// This defines what data the registration endpoint accepts
// Think of it as a "contract" - users must send exactly this structure

import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;
}
