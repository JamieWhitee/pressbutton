// src/auth/dto/auth-response.dto.ts
// Response DTO for authentication operations that include JWT tokens
// Used for login responses to provide both user data and access token

export class AuthResponseDto {
  // User information (same as UserResponseDto)
  user: {
    id: number;
    email: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
  };

  // JWT access token for authenticated requests
  // Frontend should include this in Authorization header: "Bearer <token>"
  access_token: string;

  // Token type - always "Bearer" for JWT tokens
  token_type: string;

  // Token expiration time in seconds (optional, helpful for frontend)
  expires_in?: number;
}
