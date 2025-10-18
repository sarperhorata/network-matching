import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { SpeedDatingService } from './speed-dating.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Speed Dating')
@ApiBearerAuth('JWT-auth')
@Controller('speed-dating')
export class SpeedDatingController {
  constructor(private readonly speedDatingService: SpeedDatingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('sessions')
  @ApiOperation({ summary: 'Create speed dating session' })
  @ApiResponse({ status: 201, description: 'Session created' })
  async createSession(@Body() createDto: any, @Request() req) {
    return this.speedDatingService.createSession(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/:id/join')
  @ApiOperation({ summary: 'Join speed dating session' })
  async joinSession(@Param('id') id: string, @Request() req) {
    return this.speedDatingService.joinSession(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/:id/generate-pairings')
  @ApiOperation({ summary: 'Generate AI pairings for all rounds' })
  async generatePairings(@Param('id') id: string) {
    return this.speedDatingService.generatePairings(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/:id/start')
  @ApiOperation({ summary: 'Start speed dating session' })
  async startSession(@Param('id') id: string) {
    return this.speedDatingService.startSession(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions/:id/current-pairing')
  @ApiOperation({ summary: 'Get current round pairing' })
  async getCurrentPairing(@Param('id') id: string, @Request() req) {
    return this.speedDatingService.getCurrentPairing(id, req.user.id);
  }
}

