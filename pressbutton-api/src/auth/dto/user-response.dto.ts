// src/auth/dto/user-response.dto.ts
// This defines what data we send back after successful registration
// IMPORTANT: Never include password in response for security!

export class UserResponseDto {
  // User's unique identifier from database
  id: number;

  // User's email address
  email: string;

  // User's name (can be null if not provided during registration)
  name?: string;

  // When the user account was created
  createdAt: Date;

  // Optional: You might want to add updatedAt too
  updatedAt: Date;

  // NOTE: We deliberately exclude 'password' field for security
  // Frontend should never receive password hashes
}
