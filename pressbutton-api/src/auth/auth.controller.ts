import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  // Inject AuthService to access business logic
  constructor(private readonly authService: AuthService) {}

  // POST /api/v1/auth/register
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    // @Body() extracts JSON from request body and validates it
    // registerDto will be automatically validated using class-validator decorators
    // If validation fails, NestJS automatically returns 400 Bad Request

    return this.authService.register(registerDto);
    // If successful: returns 201 Created with user data
    // If email exists: returns 409 Conflict
    // If validation fails: returns 400 Bad Request
  }

  // POST /api/v1/auth/login
  // Authenticate user with email and password - now returns JWT token!
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    // @Body() automatically validates LoginDto using class-validator decorators
    // If validation fails, NestJS returns 400 Bad Request before reaching service

    return this.authService.login(loginDto);
    // Possible responses:
    // 200 OK: Login successful, returns user data WITH JWT access token
    // 400 Bad Request: Invalid email format or password too short
    // 404 Not Found: User with email doesn't exist
    // 401 Unauthorized: Password is incorrect
  }

  // GET /api/v1/auth/profile
  // Protected route - requires valid JWT token in Authorization header
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user: UserResponseDto }): UserResponseDto {
    // @UseGuards(JwtAuthGuard) protects this route
    // Only users with valid JWT tokens can access this endpoint
    // The JWT strategy automatically attaches user data to req.user

    return req.user;
    // Returns current user's profile data (without password)
    // Usage: Frontend sends "Authorization: Bearer <jwt_token>" header
  }
}
