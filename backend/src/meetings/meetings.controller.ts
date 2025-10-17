import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MeetingStatus } from './entities/meeting.entity';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.meetingsService.findByUser(userId);
    }
    return { message: 'Get all meetings - to be implemented' };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createMeetingDto: CreateMeetingDto) {
    return this.meetingsService.create(createMeetingDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateMeetingDto: UpdateMeetingDto) {
    return this.meetingsService.update(id, updateMeetingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.meetingsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getUserMeetings(@Param('userId') userId: string) {
    return this.meetingsService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/accept')
  async acceptMeeting(@Param('id') id: string, @Request() req) {
    return this.meetingsService.updateStatus(id, MeetingStatus.CONFIRMED, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/decline')
  async declineMeeting(@Param('id') id: string, @Request() req) {
    return this.meetingsService.updateStatus(id, MeetingStatus.CANCELLED, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/complete')
  async completeMeeting(@Param('id') id: string, @Request() req) {
    return this.meetingsService.updateStatus(id, MeetingStatus.COMPLETED, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/calendar-link')
  async getCalendarLink(@Param('id') id: string) {
    return this.meetingsService.generateCalendarLink(id);
  }
}

