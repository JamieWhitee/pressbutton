// src/auth/auth.service.ts
// This service contains all authentication business logic
// Think of it as the "brain" that handles user registration, password hashing, etc.

import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  // Inject services for database access and JWT token generation
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Generate JWT access token for authenticated user
  // This token will be used for subsequent API requests
  private async generateTokens(user: {
    id: number;
    email: string;
  }): Promise<{ access_token: string }> {
    // JWT payload - data encoded in the token
    const payload = {
      sub: user.id, // subject (user ID) - standard JWT claim
      email: user.email,
    };

    // Sign the token with secret key and expiration time
    const access_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
    });

    return { access_token };
  }

  // Hash password before storing in database
  // Never store plain text passwords!
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // Higher = more secure but slower
    return bcrypt.hash(password, saltRounds);
  }

  // Check if user with email already exists
  // Prevents duplicate registrations
  private async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Main registration logic
  async register(registerDto: RegisterDto): Promise<UserResponseDto> {
    const { email, password, name } = registerDto;

    // Step 1: Check if user already exists
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Step 2: Hash the password
    const hashedPassword = await this.hashPassword(password);

    // Step 3: Create user in database
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword, // Store hashed, not plain text
        name,
      },
    });

    // Step 4: Return user data without password
    // Transform database result to match UserResponseDto
    return {
      id: user.id,
      email: user.email,
      // Convert null to undefined to satisfy UserResponseDto type
      name: user.name ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Login user with email and password
  // This method handles user authentication and returns user data with JWT token
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Step 1: Find user by email
    // We use our private helper method for consistency
    const existingUser = await this.findUserByEmail(email);
    if (!existingUser) {
      // Return 404 if user doesn't exist - helps distinguish from wrong password
      throw new NotFoundException('User with this email does not exist');
    }

    // Step 2: Verify password using bcrypt
    // bcrypt.compare() safely compares plain text password with hashed version
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      // Return 401 for wrong password - different from "user not found"
      throw new UnauthorizedException('Invalid password');
    }

    // Step 3: Generate JWT access token
    const tokens = await this.generateTokens({
      id: existingUser.id,
      email: existingUser.email,
    });

    // Step 4: Return user data with access token
    return {
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name ?? undefined, // Convert null to undefined
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
      },
      access_token: tokens.access_token,
      token_type: 'Bearer',
    };
  }
}
