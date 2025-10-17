import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JoinEventDto } from './dto/join-event.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return this.eventsService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @Post()
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

