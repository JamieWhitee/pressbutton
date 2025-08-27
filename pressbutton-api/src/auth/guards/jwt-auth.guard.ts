// src/auth/guards/jwt-auth.guard.ts
// Guard that protects routes requiring authentication
// Usage: @UseGuards(JwtAuthGuard) on controllers or individual methods

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // This guard automatically:
  // 1. Extracts JWT token from Authorization header
  // 2. Validates token using JwtStrategy
  // 3. Attaches user data to request object (req.user)
  // 4. Blocks access if token is invalid/missing
}
