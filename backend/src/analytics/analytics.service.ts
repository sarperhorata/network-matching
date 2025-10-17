import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { EventParticipant } from '../events/entities/event-participant.entity';
import { Match } from '../matches/entities/match.entity';
import { Meeting } from '../meetings/entities/meeting.entity';
import { Message } from '../messages/entities/message.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(EventParticipant)
    private participantsRepository: Repository<EventParticipant>,
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    @InjectRepository(Meeting)
    private meetingsRepository: Repository<Meeting>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async getEventAnalytics(eventId: string): Promise<any> {
    const totalParticipants = await this.participantsRepository.count({
      where: { eventId },
    });

    const checkedInParticipants = await this.participantsRepository.count({
      where: { eventId, hasCheckedIn: true },
    });

    const totalMatches = await this.matchesRepository.count({
      where: { eventId },
    });

    const totalMeetings = await this.meetingsRepository.count({
      where: { eventId },
    });

    return {
      eventId,
      totalParticipants,
      checkInRate: totalParticipants > 0 ? (checkedInParticipants / totalParticipants) * 100 : 0,
      matchingRate: totalParticipants > 0 ? (totalMatches / totalParticipants) * 100 : 0,
      meetingRate: totalMatches > 0 ? (totalMeetings / totalMatches) * 100 : 0,
      totalMatches,
      totalMeetings,
    };
  }

  async getUserAnalytics(userId: string): Promise<any> {
    const eventsAttended = await this.participantsRepository.count({
      where: { userId, hasCheckedIn: true },
    });

    const totalMatches = await this.matchesRepository.count({
      where: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    });

    const totalMeetings = await this.meetingsRepository.count({
      where: [
        { participant1Id: userId },
        { participant2Id: userId },
      ],
    });

    const messagesSent = await this.messagesRepository.count({
      where: { senderId: userId },
    });

    const messagesReceived = await this.messagesRepository.count({
      where: { receiverId: userId },
    });

    return {
      userId,
      eventsAttended,
      totalMatches,
      totalMeetings,
      messagesSent,
      messagesReceived,
      networkGrowth: totalMatches,
    };
  }

  async getOrganizerAnalytics(organizerId: string): Promise<any> {
    const totalEvents = await this.eventsRepository.count({
      where: { organizerId },
    });

    const events = await this.eventsRepository.find({
      where: { organizerId },
    });

    let totalParticipants = 0;
    let totalMatches = 0;
    let totalMeetings = 0;

    for (const event of events) {
      const participants = await this.participantsRepository.count({
        where: { eventId: event.id },
      });

      const matches = await this.matchesRepository.count({
        where: { eventId: event.id },
      });

      const meetings = await this.meetingsRepository.count({
        where: { eventId: event.id },
      });

      totalParticipants += participants;
      totalMatches += matches;
      totalMeetings += meetings;
    }

    return {
      organizerId,
      totalEvents,
      totalParticipants,
      avgParticipantsPerEvent: totalEvents > 0 ? totalParticipants / totalEvents : 0,
      totalMatches,
      totalMeetings,
    };
  }
}

