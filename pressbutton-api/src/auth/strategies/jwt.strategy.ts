// src/auth/strategies/jwt.strategy.ts
// JWT Strategy for Passport - handles token validation
// This strategy automatically validates JWT tokens in protected routes

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

// JWT Payload interface - defines what data is stored in the token
interface JwtPayload {
  sub: number; // subject (user ID)
  email: string;
  iat?: number; // issued at
  exp?: number; // expires at
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      // Extract JWT from Authorization header as Bearer token
      // Example: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Don't ignore token expiration - tokens will expire after JWT_EXPIRES_IN
      ignoreExpiration: false,

      // Secret key for verifying token signature (same as signing key)
      // Use non-null assertion since we know JWT_SECRET exists
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  // This method is called automatically when a valid JWT is found
  // The payload contains the decoded JWT data
  async validate(payload: JwtPayload) {
    // Extract user ID from JWT payload (sub = subject)
    const userId = payload.sub;

    // Verify the user still exists in database
    // This prevents using tokens of deleted users
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      // Only select fields we need (security: don't load password)
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If user doesn't exist, reject the token
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return user data - this will be available as req.user in controllers
    // NestJS automatically attaches this to the request object
    return user;
  }
}
