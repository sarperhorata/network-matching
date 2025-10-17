import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus } from './entities/event.entity';
import { EventParticipant, ParticipantStatus } from './entities/event-participant.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(EventParticipant)
    private participantsRepository: Repository<EventParticipant>,
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<{ events: Event[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [events, total] = await this.eventsRepository.findAndCount({
      where: { status: EventStatus.PUBLISHED },
      order: { startDate: 'ASC' },
      skip,
      take: limit,
    });

    return {
      events,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Event | null> {
    return this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer'],
    });
  }

  async create(createEventDto: CreateEventDto, organizerId: string): Promise<Event> {
    const event = this.eventsRepository.create({
      ...createEventDto,
      organizerId,
      status: EventStatus.DRAFT,
    });

    return this.eventsRepository.save(event);
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.eventsRepository.update(id, updateEventDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.eventsRepository.delete(id);
  }

  async joinEvent(eventId: string, userId: string, message?: string): Promise<EventParticipant> {
    const event = await this.findOne(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is not available for joining');
    }

    // Check if already joined
    const existingParticipant = await this.participantsRepository.findOne({
      where: { eventId, userId },
    });

    if (existingParticipant) {
      throw new BadRequestException('Already joined this event');
    }

    // Check capacity
    if (event.capacity && event.capacity > 0) {
      const currentParticipants = await this.participantsRepository.count({
        where: { eventId, status: ParticipantStatus.APPROVED },
      });

      if (currentParticipants >= event.capacity) {
        throw new BadRequestException('Event is full');
      }
    }

    const participant = this.participantsRepository.create({
      eventId,
      userId,
      status: event.requiresApproval ? ParticipantStatus.PENDING : ParticipantStatus.APPROVED,
    });

    return this.participantsRepository.save(participant);
  }

  async checkIn(eventId: string, userId: string): Promise<EventParticipant> {
    const participant = await this.participantsRepository.findOne({
      where: { eventId, userId },
    });

    if (!participant) {
      throw new NotFoundException('Not registered for this event');
    }

    if (participant.status !== ParticipantStatus.APPROVED) {
      throw new BadRequestException('Participation not approved');
    }

    participant.hasCheckedIn = true;
    participant.checkInTime = new Date();

    return this.participantsRepository.save(participant);
  }

  async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    return this.participantsRepository.find({
      where: { eventId },
      relations: ['user'],
    });
  }

  async approveParticipant(eventId: string, participantId: string): Promise<EventParticipant> {
    const participant = await this.participantsRepository.findOne({
      where: { id: participantId, eventId },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    participant.status = ParticipantStatus.APPROVED;
    return this.participantsRepository.save(participant);
  }

  async rejectParticipant(eventId: string, participantId: string): Promise<EventParticipant> {
    const participant = await this.participantsRepository.findOne({
      where: { id: participantId, eventId },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    participant.status = ParticipantStatus.REJECTED;
    return this.participantsRepository.save(participant);
  }

  async generateQRCode(eventId: string): Promise<string> {
    const event = await this.findOne(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Generate QR code data (in production, this would generate actual QR code)
    return `oniki://event/${eventId}/checkin`;
  }
}

