import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { GenerateMatchesDto } from './dto/generate-matches.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Matches')
@ApiBearerAuth('JWT-auth')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all matches for current user' })
  @ApiResponse({ status: 200, description: 'List of all user matches' })
  async findAll(@Request() req) {
    return this.matchesService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  @ApiOperation({ 
    summary: 'Generate AI-powered matches',
    description: 'Uses 4 algorithms: Rule-based, NLP Semantic, Behavioral Analytics, Hybrid Enhanced'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Match scores generated successfully',
    schema: {
      example: {
        matches: [
          {
            userId: 'user-123',
            score: 87,
            algorithms: {
              ruleBased: 85,
              semantic: 90,
              behavioral: 82,
              hybrid: 87
            },
            reasons: ['Same industry', 'Common interests', 'Similar goals']
          }
        ]
      }
    }
  })
  async generateMatches(@Body() generateDto: GenerateMatchesDto) {
    const matchScores = await this.matchesService.generateMatches(
      generateDto.eventId,
      generateDto.userId
    );

    if (generateDto.eventId) {
      // Create matches in database for event
      await this.matchesService.createMatchesFromScores(generateDto.eventId, matchScores);
    }

    return { matches: matchScores };
  }

  @UseGuards(JwtAuthGuard)
  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get all matches for a specific event' })
  @ApiResponse({ status: 200, description: 'Event matches retrieved' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEventMatches(@Param('eventId') eventId: string) {
    return this.matchesService.findByEvent(eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all matches for a specific user' })
  @ApiResponse({ status: 200, description: 'User matches retrieved' })
  async getUserMatches(@Param('userId') userId: string) {
    return this.matchesService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommendations/:userId')
  @ApiOperation({ 
    summary: 'Get personalized match recommendations',
    description: 'AI-powered recommendations based on user profile and behavior'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Personalized recommendations',
    schema: {
      example: [
        {
          userId: 'user-456',
          score: 92,
          confidence: 'high',
          reasons: ['Shared AI/ML interest', 'Same city', 'Networking goal match']
        }
      ]
    }
  })
  async getRecommendedMatches(@Param('userId') userId: string) {
    return this.matchesService.getRecommendedMatches(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':matchId/status')
  @ApiOperation({ summary: 'Update match status (accept/reject/connected)' })
  @ApiResponse({ status: 200, description: 'Match status updated' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async updateMatchStatus(
    @Param('matchId') matchId: string,
    @Body() body: { status: string }
  ) {
    return this.matchesService.updateMatchStatus(matchId, body.status as any);
  }
}

