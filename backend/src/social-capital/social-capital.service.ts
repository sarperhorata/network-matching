import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Match } from '../matches/entities/match.entity';
import { Message } from '../messages/entities/message.entity';
import { Meeting } from '../meetings/entities/meeting.entity';

export interface SocialCapitalScore {
  userId: string;
  totalScore: number;
  rank: string; // Beginner, Networker, Connector, Influencer, Maven
  breakdown: {
    connectionsScore: number; // 0-25 points
    diversityScore: number; // 0-25 points
    engagementScore: number; // 0-25 points
    reliabilityScore: number; // 0-25 points
  };
  badges: string[];
  level: number; // 1-10
  nextLevelAt: number;
}

@Injectable()
export class SocialCapitalService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Meeting)
    private meetingRepository: Repository<Meeting>,
  ) {}

  /**
   * Calculate comprehensive social capital score
   */
  async calculateSocialCapital(userId: string): Promise<SocialCapitalScore> {
    const [
      connectionsScore,
      diversityScore,
      engagementScore,
      reliabilityScore,
    ] = await Promise.all([
      this.calculateConnectionsScore(userId),
      this.calculateDiversityScore(userId),
      this.calculateEngagementScore(userId),
      this.calculateReliabilityScore(userId),
    ]);

    const totalScore = Math.min(
      100,
      connectionsScore + diversityScore + engagementScore + reliabilityScore,
    );

    const rank = this.getRank(totalScore);
    const level = Math.floor(totalScore / 10) + 1;
    const badges = await this.calculateBadges(userId);

    return {
      userId,
      totalScore,
      rank,
      breakdown: {
        connectionsScore,
        diversityScore,
        engagementScore,
        reliabilityScore,
      },
      badges,
      level,
      nextLevelAt: level * 10,
    };
  }

  /**
   * Connections Score: Number of accepted matches
   */
  private async calculateConnectionsScore(userId: string): Promise<number> {
    const matchCount = await this.matchRepository.count({
      where: [
        { user1Id: userId, status: 'accepted' },
        { user2Id: userId, status: 'accepted' },
      ],
    });

    // 25 points for 50+ connections
    return Math.min(25, (matchCount / 50) * 25);
  }

  /**
   * Diversity Score: Variety of industries in network
   */
  private async calculateDiversityScore(userId: string): Promise<number> {
    const matches = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.user1', 'user1')
      .leftJoinAndSelect('match.user2', 'user2')
      .where('(match.user1Id = :userId OR match.user2Id = :userId)', { userId })
      .andWhere('match.status = :status', { status: 'accepted' })
      .getMany();

    const industries = new Set<string>();
    matches.forEach((match) => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1;
      otherUser?.industries?.forEach((ind) => industries.add(ind));
    });

    // 25 points for 10+ different industries
    return Math.min(25, (industries.size / 10) * 25);
  }

  /**
   * Engagement Score: Messages sent, meetings completed
   */
  private async calculateEngagementScore(userId: string): Promise<number> {
    const messageCount = await this.messageRepository.count({
      where: [{ senderId: userId }, { receiverId: userId }],
    });

    const meetingCount = await this.meetingRepository.count({
      where: [
        { participant1Id: userId, status: 'completed' },
        { participant2Id: userId, status: 'completed' },
      ],
    });

    const messageScore = Math.min(15, (messageCount / 100) * 15);
    const meetingScore = Math.min(10, (meetingCount / 20) * 10);

    return messageScore + meetingScore;
  }

  /**
   * Reliability Score: Meeting completion rate, response time
   */
  private async calculateReliabilityScore(userId: string): Promise<number> {
    const totalMeetings = await this.meetingRepository.count({
      where: [
        { participant1Id: userId },
        { participant2Id: userId },
      ],
    });

    const completedMeetings = await this.meetingRepository.count({
      where: [
        { participant1Id: userId, status: 'completed' },
        { participant2Id: userId, status: 'completed' },
      ],
    });

    if (totalMeetings === 0) return 10; // Default for new users

    const completionRate = completedMeetings / totalMeetings;
    return Math.floor(completionRate * 25);
  }

  /**
   * Get rank based on score
   */
  private getRank(score: number): string {
    if (score >= 90) return 'Maven'; // Networking expert
    if (score >= 75) return 'Influencer';
    if (score >= 60) return 'Connector';
    if (score >= 40) return 'Networker';
    return 'Beginner';
  }

  /**
   * Calculate earned badges
   */
  private async calculateBadges(userId: string): Promise<string[]> {
    const badges = [];

    const matchCount = await this.matchRepository.count({
      where: [
        { user1Id: userId, status: 'accepted' },
        { user2Id: userId, status: 'accepted' },
      ],
    });

    if (matchCount >= 1) badges.push('First Connection');
    if (matchCount >= 10) badges.push('Rising Networker');
    if (matchCount >= 50) badges.push('Super Connector');
    if (matchCount >= 100) badges.push('Networking Legend');

    const meetingCount = await this.meetingRepository.count({
      where: [
        { participant1Id: userId, status: 'completed' },
        { participant2Id: userId, status: 'completed' },
      ],
    });

    if (meetingCount >= 5) badges.push('Meeting Master');
    if (meetingCount >= 20) badges.push('Calendar Champion');

    return badges;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(eventId?: string, limit: number = 10): Promise<any[]> {
    // This would need optimization with a separate scores table for performance
    const users = await this.userRepository.find();
    
    const scores = await Promise.all(
      users.map(async (user) => {
        const score = await this.calculateSocialCapital(user.id);
        return {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePhoto: user.profilePhoto,
            company: user.company,
          },
          ...score,
        };
      }),
    );

    return scores
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  }
}

