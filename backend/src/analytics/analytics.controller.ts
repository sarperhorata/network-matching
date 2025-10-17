import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('event/:eventId')
  async getEventAnalytics(@Param('eventId') eventId: string) {
    return this.analyticsService.getEventAnalytics(eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getUserAnalytics(@Param('userId') userId: string) {
    return this.analyticsService.getUserAnalytics(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @Get('organizer/:organizerId')
  async getOrganizerAnalytics(@Param('organizerId') organizerId: string) {
    return this.analyticsService.getOrganizerAnalytics(organizerId);
  }
}

