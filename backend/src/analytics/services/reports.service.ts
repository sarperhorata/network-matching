import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { EventParticipant } from '../../events/entities/event-participant.entity';
import { Match } from '../../matches/entities/match.entity';
import { Message } from '../../messages/entities/message.entity';
import { Meeting } from '../../meetings/entities/meeting.entity';

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  tenantId?: string;
  eventId?: string;
  userId?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface FunnelStep {
  name: string;
  count: number;
  dropoffRate?: number;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventParticipant)
    private readonly participantRepository: Repository<EventParticipant>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
  ) {}

  /**
   * Generate User Growth Report
   */
  async getUserGrowthReport(filter: ReportFilter): Promise<{
    timeSeries: TimeSeriesData[];
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    growthRate: number;
  }> {
    const { startDate, endDate } = this.getDateRange(filter);

    // Get all users in date range
    const users = await this.userRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'ASC' },
    });

    // Generate time series data
    const timeSeries = this.generateTimeSeries(
      users.map((u) => ({ date: u.createdAt, value: 1 })),
      startDate,
      endDate,
    );

    // Calculate metrics
    const totalUsers = await this.userRepository.count();
    const newUsers = users.length;
    const activeUsers = users.filter((u) => u.isActive).length;

    // Calculate growth rate
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(
      previousPeriodStart.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const previousUsers = await this.userRepository.count({
      where: {
        createdAt: Between(previousPeriodStart, startDate),
      },
    });

    const growthRate = previousUsers > 0 ? ((newUsers - previousUsers) / previousUsers) * 100 : 100;

    return {
      timeSeries,
      totalUsers,
      newUsers,
      activeUsers,
      growthRate: Math.round(growthRate * 10) / 10,
    };
  }

  /**
   * Generate Event Performance Report
   */
  async getEventPerformanceReport(eventId: string): Promise<{
    overview: {
      totalRegistrations: number;
      checkInRate: number;
      matchingRate: number;
      meetingRate: number;
      averageSatisfaction: number;
    };
    participantTimeline: TimeSeriesData[];
    matchDistribution: Array<{ scoreRange: string; count: number }>;
    topMatches: Array<{ user1: string; user2: string; score: number }>;
    demographics: {
      industries: Record<string, number>;
      interests: Record<string, number>;
      companies: Record<string, number>;
    };
  }> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Get participants
    const participants = await this.participantRepository.find({
      where: { eventId },
      relations: ['user'],
    });

    const totalRegistrations = participants.length;
    const checkedIn = participants.filter((p) => p.hasCheckedIn).length;
    const checkInRate = totalRegistrations > 0 ? (checkedIn / totalRegistrations) * 100 : 0;

    // Get matches
    const matches = await this.matchRepository.find({
      where: { eventId },
      relations: ['user1', 'user2'],
    });

    const matchingRate = totalRegistrations > 0 ? (matches.length / totalRegistrations) * 100 : 0;

    // Get meetings
    const meetings = await this.meetingRepository.find({
      where: { eventId },
    });

    const meetingRate = matches.length > 0 ? (meetings.length / matches.length) * 100 : 0;

    // Participant timeline
    const participantTimeline = this.generateTimeSeries(
      participants.map((p) => ({ date: p.joinedAt, value: 1 })),
      event.startDate,
      event.endDate,
    );

    // Match distribution by score
    const matchDistribution = [
      { scoreRange: '0-20', count: matches.filter((m) => m.score < 20).length },
      { scoreRange: '20-40', count: matches.filter((m) => m.score >= 20 && m.score < 40).length },
      { scoreRange: '40-60', count: matches.filter((m) => m.score >= 40 && m.score < 60).length },
      { scoreRange: '60-80', count: matches.filter((m) => m.score >= 60 && m.score < 80).length },
      { scoreRange: '80-100', count: matches.filter((m) => m.score >= 80).length },
    ];

    // Top matches
    const topMatches = matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((m) => ({
        user1: `${m.user1?.firstName} ${m.user1?.lastName}`,
        user2: `${m.user2?.firstName} ${m.user2?.lastName}`,
        score: m.score,
      }));

    // Demographics
    const industries: Record<string, number> = {};
    const interests: Record<string, number> = {};
    const companies: Record<string, number> = {};

    participants.forEach((p) => {
      if (p.user) {
        // Industries
        (p.user.industries || []).forEach((ind) => {
          industries[ind] = (industries[ind] || 0) + 1;
        });

        // Interests
        (p.user.interests || []).forEach((int) => {
          interests[int] = (interests[int] || 0) + 1;
        });

        // Companies
        if (p.user.company) {
          companies[p.user.company] = (companies[p.user.company] || 0) + 1;
        }
      }
    });

    return {
      overview: {
        totalRegistrations,
        checkInRate: Math.round(checkInRate * 10) / 10,
        matchingRate: Math.round(matchingRate * 10) / 10,
        meetingRate: Math.round(meetingRate * 10) / 10,
        averageSatisfaction: 0, // TODO: Calculate from feedback
      },
      participantTimeline,
      matchDistribution,
      topMatches,
      demographics: {
        industries,
        interests,
        companies,
      },
    };
  }

  /**
   * Generate Conversion Funnel Report
   */
  async getConversionFunnel(filter: ReportFilter): Promise<FunnelStep[]> {
    const { startDate, endDate } = this.getDateRange(filter);

    // Step 1: Total users
    const totalUsers = await this.userRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    // Step 2: Email verified
    const emailVerified = await this.userRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
        isEmailVerified: true,
      },
    });

    // Step 3: Profile completed (has industries and interests)
    const profileCompleted = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere("user.industries != '[]'")
      .andWhere("user.interests != '[]'")
      .getCount();

    // Step 4: Joined an event
    const joinedEvent = await this.participantRepository
      .createQueryBuilder('participant')
      .innerJoin('participant.user', 'user')
      .where('user.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .select('DISTINCT participant.userId')
      .getRawMany();

    // Step 5: Got matched
    const gotMatched = await this.matchRepository
      .createQueryBuilder('match')
      .innerJoin(User, 'user', 'user.id = match.user1Id OR user.id = match.user2Id')
      .where('user.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .select('DISTINCT user.id')
      .getRawMany();

    // Step 6: Sent a message
    const sentMessage = await this.messageRepository
      .createQueryBuilder('message')
      .innerJoin('message.sender', 'user')
      .where('user.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .select('DISTINCT message.senderId')
      .getRawMany();

    // Step 7: Scheduled a meeting
    const scheduledMeeting = await this.meetingRepository
      .createQueryBuilder('meeting')
      .innerJoin(User, 'user', 'user.id = meeting.participant1Id OR user.id = meeting.participant2Id')
      .where('user.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .select('DISTINCT user.id')
      .getRawMany();

    const steps: FunnelStep[] = [
      { name: 'Registered', count: totalUsers },
      {
        name: 'Email Verified',
        count: emailVerified,
        dropoffRate: totalUsers > 0 ? ((totalUsers - emailVerified) / totalUsers) * 100 : 0,
      },
      {
        name: 'Profile Completed',
        count: profileCompleted,
        dropoffRate: emailVerified > 0 ? ((emailVerified - profileCompleted) / emailVerified) * 100 : 0,
      },
      {
        name: 'Joined Event',
        count: joinedEvent.length,
        dropoffRate: profileCompleted > 0 ? ((profileCompleted - joinedEvent.length) / profileCompleted) * 100 : 0,
      },
      {
        name: 'Got Matched',
        count: gotMatched.length,
        dropoffRate: joinedEvent.length > 0 ? ((joinedEvent.length - gotMatched.length) / joinedEvent.length) * 100 : 0,
      },
      {
        name: 'Sent Message',
        count: sentMessage.length,
        dropoffRate: gotMatched.length > 0 ? ((gotMatched.length - sentMessage.length) / gotMatched.length) * 100 : 0,
      },
      {
        name: 'Scheduled Meeting',
        count: scheduledMeeting.length,
        dropoffRate: sentMessage.length > 0 ? ((sentMessage.length - scheduledMeeting.length) / sentMessage.length) * 100 : 0,
      },
    ];

    // Round dropoff rates
    steps.forEach((step) => {
      if (step.dropoffRate !== undefined) {
        step.dropoffRate = Math.round(step.dropoffRate * 10) / 10;
      }
    });

    return steps;
  }

  /**
   * Export data to CSV format
   */
  async exportToCSV(
    type: 'users' | 'events' | 'matches' | 'messages' | 'meetings',
    filter: ReportFilter,
  ): Promise<string> {
    const { startDate, endDate } = this.getDateRange(filter);

    let data: any[] = [];
    let headers: string[] = [];

    switch (type) {
      case 'users':
        data = await this.userRepository.find({
          where: {
            createdAt: Between(startDate, endDate),
          },
        });
        headers = ['ID', 'Email', 'Name', 'Company', 'Role', 'Created At'];
        break;

      case 'events':
        data = await this.eventRepository.find({
          where: {
            createdAt: Between(startDate, endDate),
          },
        });
        headers = ['ID', 'Title', 'Location', 'Start Date', 'Status', 'Capacity'];
        break;

      case 'matches':
        data = await this.matchRepository.find({
          where: {
            createdAt: Between(startDate, endDate),
          },
          relations: ['user1', 'user2', 'event'],
        });
        headers = ['ID', 'User 1', 'User 2', 'Event', 'Score', 'Status', 'Created At'];
        break;

      case 'messages':
        data = await this.messageRepository.find({
          where: {
            createdAt: Between(startDate, endDate),
          },
        });
        headers = ['ID', 'Sender', 'Receiver', 'Content', 'Is Read', 'Created At'];
        break;

      case 'meetings':
        data = await this.meetingRepository.find({
          where: {
            createdAt: Between(startDate, endDate),
          },
          relations: ['participant1', 'participant2', 'event'],
        });
        headers = ['ID', 'Participant 1', 'Participant 2', 'Event', 'Scheduled Time', 'Status'];
        break;
    }

    return this.convertToCSV(data, headers);
  }

  /**
   * Get heat map data (user activity by hour and day)
   */
  async getActivityHeatMap(filter: ReportFilter): Promise<{
    data: number[][];
    labels: { days: string[]; hours: string[] };
  }> {
    const { startDate, endDate } = this.getDateRange(filter);

    // Get all user behaviors (check-ins, messages, matches, etc.)
    const checkIns = await this.participantRepository.find({
      where: {
        hasCheckedIn: true,
        // checkedInAt: Between(startDate, endDate),
      },
    });

    const messages = await this.messageRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    // Initialize 7x24 matrix (7 days, 24 hours)
    const heatMap: number[][] = Array(7)
      .fill(0)
      .map(() => Array(24).fill(0));

    // Populate heat map
    [...checkIns, ...messages].forEach((item) => {
      const date = 'createdAt' in item ? item.createdAt : new Date();
      const day = date.getDay(); // 0-6 (Sunday-Saturday)
      const hour = date.getHours(); // 0-23
      heatMap[day][hour]++;
    });

    return {
      data: heatMap,
      labels: {
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      },
    };
  }

  /**
   * Get cohort analysis (retention by signup week)
   */
  async getCohortAnalysis(startDate: Date, endDate: Date): Promise<{
    cohorts: Array<{
      cohortName: string;
      userCount: number;
      retention: {
        week1: number;
        week2: number;
        week4: number;
        week8: number;
      };
    }>;
  }> {
    const cohorts: any[] = [];

    // Generate weekly cohorts
    let current = new Date(startDate);
    while (current < endDate) {
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const cohortUsers = await this.userRepository.find({
        where: {
          createdAt: Between(current, weekEnd),
        },
      });

      if (cohortUsers.length > 0) {
        const cohortName = `Week of ${current.toISOString().split('T')[0]}`;
        const userIds = cohortUsers.map((u) => u.id);

        // Calculate retention
        const retention = {
          week1: await this.calculateRetention(userIds, current, 7),
          week2: await this.calculateRetention(userIds, current, 14),
          week4: await this.calculateRetention(userIds, current, 28),
          week8: await this.calculateRetention(userIds, current, 56),
        };

        cohorts.push({
          cohortName,
          userCount: cohortUsers.length,
          retention,
        });
      }

      current = weekEnd;
    }

    return { cohorts };
  }

  /**
   * Helper: Calculate retention rate
   */
  private async calculateRetention(
    userIds: string[],
    cohortStart: Date,
    daysAfter: number,
  ): Promise<number> {
    const targetDate = new Date(cohortStart);
    targetDate.setDate(targetDate.getDate() + daysAfter);

    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setDate(targetDateEnd.getDate() + 1);

    // Count active users (those who checked in, sent messages, etc.)
    const activeCount = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.senderId IN (:...userIds)', { userIds })
      .andWhere('message.createdAt BETWEEN :start AND :end', {
        start: targetDate,
        end: targetDateEnd,
      })
      .select('DISTINCT message.senderId')
      .getRawMany();

    return userIds.length > 0 ? (activeCount.length / userIds.length) * 100 : 0;
  }

  /**
   * Helper: Get date range from filter
   */
  private getDateRange(filter: ReportFilter): { startDate: Date; endDate: Date } {
    const endDate = filter.endDate || new Date();
    const startDate = filter.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    return { startDate, endDate };
  }

  /**
   * Helper: Generate time series data
   */
  private generateTimeSeries(
    events: Array<{ date: Date; value: number }>,
    startDate: Date,
    endDate: Date,
  ): TimeSeriesData[] {
    const timeSeries: TimeSeriesData[] = [];
    const dataMap = new Map<string, number>();

    // Aggregate by date
    events.forEach((event) => {
      const dateKey = event.date.toISOString().split('T')[0];
      dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + event.value);
    });

    // Fill in missing dates
    let current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = current.toISOString().split('T')[0];
      timeSeries.push({
        date: dateKey,
        value: dataMap.get(dateKey) || 0,
      });
      current.setDate(current.getDate() + 1);
    }

    return timeSeries;
  }

  /**
   * Helper: Convert data to CSV
   */
  private convertToCSV(data: any[], headers: string[]): string {
    const rows = [headers.join(',')];

    data.forEach((item) => {
      const row = headers.map((header) => {
        const value = this.getNestedValue(item, header);
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      rows.push(row.join(','));
    });

    return rows.join('\n');
  }

  /**
   * Helper: Get nested object value
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

