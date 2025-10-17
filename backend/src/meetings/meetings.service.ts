import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting, MeetingStatus } from './entities/meeting.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private meetingsRepository: Repository<Meeting>,
  ) {}

  async create(createMeetingDto: CreateMeetingDto, requesterId: string): Promise<Meeting> {
    // Validate that requester is one of the participants
    if (createMeetingDto.participant1Id !== requesterId && createMeetingDto.participant2Id !== requesterId) {
      throw new BadRequestException('You can only schedule meetings you are part of');
    }

    // Check if meeting already exists between these participants
    const existingMeeting = await this.meetingsRepository.findOne({
      where: [
        {
          participant1Id: createMeetingDto.participant1Id,
          participant2Id: createMeetingDto.participant2Id,
          eventId: createMeetingDto.eventId,
        },
        {
          participant1Id: createMeetingDto.participant2Id,
          participant2Id: createMeetingDto.participant1Id,
          eventId: createMeetingDto.eventId,
        },
      ],
    });

    if (existingMeeting) {
      throw new BadRequestException('Meeting already exists between these participants');
    }

    const meeting = this.meetingsRepository.create({
      ...createMeetingDto,
      status: MeetingStatus.PENDING,
    });

    return this.meetingsRepository.save(meeting);
  }

  async findByUser(userId: string): Promise<Meeting[]> {
    return this.meetingsRepository.find({
      where: [
        { participant1Id: userId },
        { participant2Id: userId },
      ],
      relations: ['participant1', 'participant2', 'event'],
      order: { scheduledTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Meeting> {
    const meeting = await this.meetingsRepository.findOne({
      where: { id },
      relations: ['participant1', 'participant2', 'event'],
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return meeting;
  }

  async update(id: string, updateMeetingDto: UpdateMeetingDto): Promise<Meeting> {
    const meeting = await this.findOne(id);

    await this.meetingsRepository.update(id, updateMeetingDto);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: MeetingStatus, userId: string): Promise<Meeting> {
    const meeting = await this.findOne(id);

    // Validate that user is part of the meeting
    if (meeting.participant1Id !== userId && meeting.participant2Id !== userId) {
      throw new BadRequestException('You can only update meetings you are part of');
    }

    // Validate status transitions
    if (status === MeetingStatus.CONFIRMED && meeting.status !== MeetingStatus.PENDING) {
      throw new BadRequestException('Can only confirm pending meetings');
    }

    if (status === MeetingStatus.CANCELLED && meeting.status === MeetingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed meetings');
    }

    await this.meetingsRepository.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const meeting = await this.findOne(id);
    await this.meetingsRepository.delete(id);
  }

  async generateCalendarLink(id: string): Promise<string> {
    const meeting = await this.findOne(id);

    // Generate iCal format link for calendar integration
    const startTime = new Date(meeting.scheduledTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour meeting

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icalContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Oniki.net//Meeting//EN
BEGIN:VEVENT
UID:${meeting.id}@oniki.net
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:Meeting with ${meeting.participant1.firstName} ${meeting.participant1.lastName}
DESCRIPTION:Scheduled meeting via Oniki.net networking platform
LOCATION:${meeting.location || 'Online'}
END:VEVENT
END:VCALENDAR
    `.trim();

    // Return data URL for iCal file
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(icalContent)}`;
  }

  async getUpcomingMeetings(userId: string): Promise<Meeting[]> {
    const now = new Date();
    return this.meetingsRepository.find({
      where: [
        {
          participant1Id: userId,
          scheduledTime: { $gte: now } as any,
          status: MeetingStatus.CONFIRMED,
        },
        {
          participant2Id: userId,
          scheduledTime: { $gte: now } as any,
          status: MeetingStatus.CONFIRMED,
        },
      ],
      relations: ['participant1', 'participant2', 'event'],
      order: { scheduledTime: 'ASC' },
    });
  }
}

