// src/auth/dto/login.dto.ts
// Data Transfer Object (DTO) for user login requests
// This validates incoming login data before it reaches the service layer

import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  // Email validation: Must be valid email format
  // Example: "user@example.com" ✅, "invalid-email" ❌
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  // Password validation: Must be string with minimum 6 characters
  // This matches our registration requirements for consistency
  @IsString({ message: 'Password must be string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
