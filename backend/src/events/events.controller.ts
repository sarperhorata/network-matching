import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JoinEventDto } from './dto/join-event.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published events', description: 'Returns a paginated list of published events' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Items per page' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of events',
    schema: {
      example: {
        events: [{
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Tech Networking Mixer 2025',
          description: 'Connect with tech professionals',
          startDate: '2025-11-15T18:00:00.000Z',
          endDate: '2025-11-15T21:00:00.000Z',
          location: 'Istanbul Tech Hub',
          categories: ['Technology Conference', 'Networking Mixer'],
          capacity: 100,
          status: 'published',
          isPublic: true
        }],
        total: 50,
        totalPages: 5
      }
    }
  })
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return this.eventsService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID', description: 'Returns detailed event information' })
  @ApiParam({ name: 'id', description: 'Event UUID' })
  @ApiResponse({ status: 200, description: 'Event details' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @Post()
  @ApiOperation({ summary: 'Create new event', description: 'Create a new event (Organizers only)' })
  @ApiBody({
    type: CreateEventDto,
    examples: {
      event: {
        summary: 'Tech Event Example',
        value: {
          title: 'AI & Blockchain Summit 2025',
          description: 'Join us for the biggest tech networking event',
          startDate: '2025-11-15T18:00:00.000Z',
          endDate: '2025-11-15T21:00:00.000Z',
          location: 'Istanbul Tech Hub',
          address: 'Maslak Mahallesi, Sarıyer',
          city: 'Istanbul',
          country: 'Turkey',
          categories: ['Technology Conference', 'Networking Mixer'],
          capacity: 100,
          isPublic: true,
          requiresApproval: false
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Organizers only' })
  async create(@Request() req, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  async joinEvent(@Param('id') id: string, @Request() req, @Body() joinEventDto: JoinEventDto) {
    return this.eventsService.joinEvent(id, req.user.id, joinEventDto.message);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/check-in')
  async checkIn(@Param('id') id: string, @Request() req) {
    return this.eventsService.checkIn(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/participants')
  async getParticipants(@Param('id') id: string) {
    return this.eventsService.getEventParticipants(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @Post(':id/approve/:participantId')
  async approveParticipant(@Param('id') id: string, @Param('participantId') participantId: string) {
    return this.eventsService.approveParticipant(id, participantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @Post(':id/reject/:participantId')
  async rejectParticipant(@Param('id') id: string, @Param('participantId') participantId: string) {
    return this.eventsService.rejectParticipant(id, participantId);
  }

  @Get(':id/qr-code')
  async generateQRCode(@Param('id') id: string) {
    return this.eventsService.generateQRCode(id);
  }
}

