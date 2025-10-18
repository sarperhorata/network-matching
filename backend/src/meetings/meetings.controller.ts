import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MeetingStatus } from './entities/meeting.entity';

@ApiTags('Meetings')
@ApiBearerAuth('JWT-auth')
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all meetings (with optional user filter)' })
  @ApiResponse({ status: 200, description: 'List of meetings' })
  async findAll(@Request() req, @Query('userId') userId?: string) {
    if (userId) {
      return this.meetingsService.findByUser(userId);
    }
    return this.meetingsService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new meeting' })
  @ApiBody({
    type: CreateMeetingDto,
    examples: {
      meeting: {
        summary: 'Schedule Meeting',
        value: {
          participantId: 'user-456',
          scheduledTime: '2025-10-25T14:00:00Z',
          duration: 60,
          location: 'Coffee House, İstanbul',
          notes: 'Discuss collaboration opportunities',
          agenda: 'Partnership discussion'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Meeting created successfully' })
  async create(@Request() req, @Body() createMeetingDto: CreateMeetingDto) {
    return this.meetingsService.create(createMeetingDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update meeting details' })
  @ApiParam({ name: 'id', description: 'Meeting ID' })
  @ApiResponse({ status: 200, description: 'Meeting updated successfully' })
  async update(@Param('id') id: string, @Body() updateMeetingDto: UpdateMeetingDto) {
    return this.meetingsService.update(id, updateMeetingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Cancel/delete a meeting' })
  @ApiParam({ name: 'id', description: 'Meeting ID' })
  @ApiResponse({ status: 200, description: 'Meeting deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.meetingsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all meetings for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User meetings retrieved' })
  async getUserMeetings(@Param('userId') userId: string) {
    return this.meetingsService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get meeting details by ID' })
  @ApiParam({ name: 'id', description: 'Meeting ID' })
  @ApiResponse({ status: 200, description: 'Meeting details' })
  @ApiResponse({ status: 404, description: 'Meeting not found' })
  async findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept a meeting invitation' })
  @ApiParam({ name: 'id', description: 'Meeting ID' })
  @ApiResponse({ status: 200, description: 'Meeting accepted and status changed to CONFIRMED' })
  async acceptMeeting(@Param('id') id: string, @Request() req) {
    return this.meetingsService.updateStatus(id, MeetingStatus.CONFIRMED, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/decline')
  @ApiOperation({ summary: 'Decline a meeting invitation' })
  @ApiParam({ name: 'id', description: 'Meeting ID' })
  @ApiResponse({ status: 200, description: 'Meeting declined and status changed to CANCELLED' })
  async declineMeeting(@Param('id') id: string, @Request() req) {
    return this.meetingsService.updateStatus(id, MeetingStatus.CANCELLED, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark meeting as completed' })
  @ApiParam({ name: 'id', description: 'Meeting ID' })
  @ApiResponse({ status: 200, description: 'Meeting marked as COMPLETED' })
  async completeMeeting(@Param('id') id: string, @Request() req) {
    return this.meetingsService.updateStatus(id, MeetingStatus.COMPLETED, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/calendar-link')
  @ApiOperation({ 
    summary: 'Generate iCal calendar link for meeting',
    description: 'Returns calendar link in iCal format for Google Calendar, Outlook, etc.'
  })
  @ApiParam({ name: 'id', description: 'Meeting ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Calendar link generated',
    schema: {
      example: {
        calendarLink: 'data:text/calendar;charset=utf8,BEGIN:VCALENDAR...',
        downloadUrl: '/meetings/123/calendar.ics'
      }
    }
  })
  async getCalendarLink(@Param('id') id: string) {
    return this.meetingsService.generateCalendarLink(id);
  }
}

