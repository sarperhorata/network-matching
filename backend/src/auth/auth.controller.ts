import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Create a new user account with email and password. Returns user data and JWT token.'
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      participant: {
        summary: 'Participant Registration',
        value: {
          email: 'john.doe@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'participant',
          company: 'Tech Corp',
          position: 'Software Engineer',
          industries: ['Technology', 'Finance'],
          interests: ['Artificial Intelligence', 'Blockchain'],
          networkingGoals: ['Find Business Partners', 'Knowledge Sharing']
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'participant',
          company: 'Tech Corp',
          position: 'Software Engineer'
        }
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Login user',
    description: 'Authenticate user with email and password. Returns JWT token for subsequent requests.'
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      user: {
        summary: 'User Login',
        value: {
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged in',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'participant'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('me')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Returns the profile of the currently authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Current user profile',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john.doe@example.com',
        role: 'participant',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Tech Corp',
        position: 'Software Engineer',
        bio: 'Passionate about AI and networking',
        industries: ['Technology', 'Finance'],
        interests: ['Artificial Intelligence', 'Blockchain'],
        networkingGoals: ['Find Business Partners'],
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        isActive: true,
        createdAt: '2025-10-17T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  // OAuth endpoints (Google)
  @Get('google')
  @ApiOperation({ 
    summary: 'Login/Register with Google OAuth',
    description: 'Redirects to Google OAuth consent screen. After authorization, redirects back with JWT token.'
  })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirects to Google OAuth',
    headers: {
      Location: {
        description: 'Google OAuth authorization URL',
        schema: { type: 'string' }
      }
    }
  })
  async googleAuth() {
    // Implementation note: Requires @nestjs/passport and passport-google-oauth20
    // Setup: Configure GoogleStrategy in auth.module.ts
    return { 
      message: 'Google OAuth endpoint',
      note: 'Requires GoogleStrategy setup and GOOGLE_CLIENT_ID/SECRET env vars',
      setupGuide: 'See backend/src/common/strategies/google.strategy.ts (to be created)'
    };
  }

  @Get('google/callback')
  @ApiOperation({ 
    summary: 'Google OAuth callback',
    description: 'Handles Google OAuth callback, creates/logs in user, returns JWT token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OAuth successful, returns JWT token',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'john.doe@gmail.com',
          firstName: 'John',
          lastName: 'Doe',
          provider: 'google',
          role: 'participant'
        }
      }
    }
  })
  async googleAuthCallback() {
    // Implementation handled by GoogleStrategy
    return { message: 'Google OAuth callback - handled by Passport strategy' };
  }

  // OAuth endpoints (LinkedIn)
  @Get('linkedin')
  @ApiOperation({ 
    summary: 'Login/Register with LinkedIn OAuth',
    description: 'Redirects to LinkedIn OAuth consent screen. After authorization, redirects back with JWT token.'
  })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirects to LinkedIn OAuth',
    headers: {
      Location: {
        description: 'LinkedIn OAuth authorization URL',
        schema: { type: 'string' }
      }
    }
  })
  async linkedinAuth() {
    // Implementation note: Requires passport-linkedin-oauth2
    // Setup: Configure LinkedInStrategy in auth.module.ts
    return { 
      message: 'LinkedIn OAuth endpoint',
      note: 'Requires LinkedInStrategy setup and LINKEDIN_CLIENT_ID/SECRET env vars',
      setupGuide: 'See backend/src/common/strategies/linkedin.strategy.ts (to be created)'
    };
  }

  @Get('linkedin/callback')
  @ApiOperation({ 
    summary: 'LinkedIn OAuth callback',
    description: 'Handles LinkedIn OAuth callback, creates/logs in user, returns JWT token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OAuth successful, returns JWT token',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'john.doe@linkedin.com',
          firstName: 'John',
          lastName: 'Doe',
          provider: 'linkedin',
          linkedinUrl: 'https://linkedin.com/in/johndoe',
          role: 'participant'
        }
      }
    }
  })
  async linkedinAuthCallback() {
    // Implementation handled by LinkedInStrategy
    return { message: 'LinkedIn OAuth callback - handled by Passport strategy' };
  }
}

