import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Match } from '../matches/entities/match.entity';

@Injectable()
export class SerendipityService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) {}

  /**
   * Generate serendipitous matches - intentionally from different industries
   * "Creative collision theory" - diverse networks = innovation
   */
  async generateSerendipityMatches(
    eventId: string,
    userId: string,
  ): Promise<any[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Find users from DIFFERENT industries
    const eventParticipants = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('event_participants', 'ep', 'ep.userId = user.id')
      .where('ep.eventId = :eventId', { eventId })
      .andWhere('user.id != :userId', { userId })
      .getMany();

    const serendipityMatches = [];

    for (const otherUser of eventParticipants) {
      // Calculate "serendipity score" - how DIFFERENT they are
      const serendipityScore = this.calculateSerendipityScore(user, otherUser);

      if (serendipityScore >= 50) {
        // High serendipity = very different
        serendipityMatches.push({
          user: otherUser,
          serendipityScore,
          reasons: this.getSerendipityReasons(user, otherUser),
          type: 'serendipity',
          tagline: 'Creative Collision Opportunity! 🌟',
        });
      }
    }

    // Sort by highest serendipity (most different)
    return serendipityMatches
      .sort((a, b) => b.serendipityScore - a.serendipityScore)
      .slice(0, 5); // Top 5 most serendipitous
  }

  /**
   * Calculate how DIFFERENT two users are
   * Higher score = more serendipitous
   */
  private calculateSerendipityScore(user1: User, user2: User): number {
    let score = 0;

    // Industry difference (more points for no overlap)
    const sharedIndustries = user1.industries?.filter((i) =>
      user2.industries?.includes(i),
    ).length || 0;

    score += sharedIndustries === 0 ? 40 : Math.max(0, 40 - sharedIndustries * 10);

    // Interest difference (some overlap good for conversation)
    const sharedInterests = user1.interests?.filter((i) =>
      user2.interests?.includes(i),
    ).length || 0;

    score += sharedInterests === 1 ? 30 : sharedInterests === 0 ? 20 : Math.max(0, 30 - sharedInterests * 5);

    // Goal similarity (should have SOME alignment)
    const sharedGoals = user1.networkingGoals?.filter((g) =>
      user2.networkingGoals?.includes(g),
    ).length || 0;

    score += sharedGoals >= 1 ? 30 : 10;

    return Math.min(100, score);
  }

  /**
   * Explain why this is a serendipitous match
   */
  private getSerendipityReasons(user1: User, user2: User): string[] {
    const reasons = [];

    const sharedIndustries = user1.industries?.filter((i) =>
      user2.industries?.includes(i),
    ).length || 0;

    if (sharedIndustries === 0) {
      reasons.push(
        `Completely different industries: ${user1.industries?.[0] || 'Unknown'} × ${user2.industries?.[0] || 'Unknown'}`,
      );
      reasons.push('High innovation potential through diverse perspectives');
    }

    const sharedInterests = user1.interests?.filter((i) =>
      user2.interests?.includes(i),
    ).length || 0;

    if (sharedInterests === 1) {
      const shared = user1.interests?.find((i) => user2.interests?.includes(i));
      reasons.push(`One shared interest for conversation: ${shared}`);
    } else if (sharedInterests === 0) {
      reasons.push('Explore entirely new perspectives');
    }

    reasons.push('Serendipity Mode: Step outside your bubble! 🌈');

    return reasons;
  }
}

