import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { GenerateMatchesDto } from './dto/generate-matches.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return { message: 'Get all matches - to be implemented' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate')
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
  async getEventMatches(@Param('eventId') eventId: string) {
    return this.matchesService.findByEvent(eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getUserMatches(@Param('userId') userId: string) {
    return this.matchesService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommendations/:userId')
  async getRecommendedMatches(@Param('userId') userId: string) {
    return this.matchesService.getRecommendedMatches(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':matchId/status')
  async updateMatchStatus(
    @Param('matchId') matchId: string,
    @Body() body: { status: string }
  ) {
    return this.matchesService.updateMatchStatus(matchId, body.status as any);
  }
}

