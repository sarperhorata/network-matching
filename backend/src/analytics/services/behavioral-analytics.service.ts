import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBehavior, BehaviorType } from '../entities/user-behavior.entity';

@Injectable()
export class BehavioralAnalyticsService {
  constructor(
    @InjectRepository(UserBehavior)
    private readonly behaviorRepository: Repository<UserBehavior>,
  ) {}

  /**
   * Track user behavior for ML analysis
   */
  async trackBehavior(
    userId: string,
    behaviorType: BehaviorType,
    options?: {
      targetUserId?: string;
      eventId?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<UserBehavior> {
    const behavior = this.behaviorRepository.create({
      userId,
      behaviorType,
      targetUserId: options?.targetUserId,
      eventId: options?.eventId,
      metadata: options?.metadata,
    });

    return this.behaviorRepository.save(behavior);
  }

  /**
   * Get user behavior patterns for ML training
   */
  async getUserBehaviorPattern(userId: string): Promise<{
    profileViews: number;
    messagesSent: number;
    matchAcceptanceRate: number;
    eventParticipationRate: number;
    averageResponseTime: number;
    activeHours: number[];
    preferredEventCategories: string[];
  }> {
    const behaviors = await this.behaviorRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 1000,
    });

    const profileViews = behaviors.filter(
      (b) => b.behaviorType === BehaviorType.PROFILE_VIEW,
    ).length;

    const messagesSent = behaviors.filter(
      (b) => b.behaviorType === BehaviorType.MESSAGE_SENT,
    ).length;

    const matchAccepted = behaviors.filter(
      (b) => b.behaviorType === BehaviorType.MATCH_ACCEPTED,
    ).length;

    const matchRejected = behaviors.filter(
      (b) => b.behaviorType === BehaviorType.MATCH_REJECTED,
    ).length;

    const matchAcceptanceRate =
      matchAccepted + matchRejected > 0
        ? matchAccepted / (matchAccepted + matchRejected)
        : 0;

    const eventJoined = behaviors.filter(
      (b) => b.behaviorType === BehaviorType.EVENT_JOINED,
    ).length;

    const eventCheckedIn = behaviors.filter(
      (b) => b.behaviorType === BehaviorType.EVENT_CHECKED_IN,
    ).length;

    const eventParticipationRate =
      eventJoined > 0 ? eventCheckedIn / eventJoined : 0;

    // Calculate active hours (0-23)
    const activeHours = behaviors.reduce((acc, b) => {
      const hour = new Date(b.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const topActiveHours = Object.entries(activeHours)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Get preferred event categories from metadata
    const eventBehaviors = behaviors.filter(
      (b) =>
        b.behaviorType === BehaviorType.EVENT_JOINED &&
        b.metadata?.categories,
    );

    const categoryCount: Record<string, number> = {};
    eventBehaviors.forEach((b) => {
      const categories = b.metadata?.categories || [];
      categories.forEach((cat: string) => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    });

    const preferredEventCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat]) => cat);

    return {
      profileViews,
      messagesSent,
      matchAcceptanceRate,
      eventParticipationRate,
      averageResponseTime: 0, // TODO: Calculate from message timestamps
      activeHours: topActiveHours,
      preferredEventCategories,
    };
  }

  /**
   * Calculate user engagement score (0-100)
   */
  async calculateEngagementScore(userId: string): Promise<number> {
    const pattern = await this.getUserBehaviorPattern(userId);

    // Weighted scoring
    const weights = {
      profileViews: 0.1,
      messagesSent: 0.25,
      matchAcceptanceRate: 0.2,
      eventParticipationRate: 0.3,
      consistency: 0.15, // Based on active hours diversity
    };

    const profileViewScore = Math.min((pattern.profileViews / 50) * 100, 100);
    const messageScore = Math.min((pattern.messagesSent / 20) * 100, 100);
    const matchScore = pattern.matchAcceptanceRate * 100;
    const eventScore = pattern.eventParticipationRate * 100;
    const consistencyScore =
      pattern.activeHours.length >= 3 ? 100 : (pattern.activeHours.length / 3) * 100;

    const totalScore =
      profileViewScore * weights.profileViews +
      messageScore * weights.messagesSent +
      matchScore * weights.matchAcceptanceRate +
      eventScore * weights.eventParticipationRate +
      consistencyScore * weights.consistency;

    return Math.round(totalScore);
  }

  /**
   * Get similar users based on behavior patterns
   */
  async getSimilarUsersByBehavior(
    userId: string,
    limit: number = 10,
  ): Promise<Array<{ userId: string; similarity: number }>> {
    const userPattern = await this.getUserBehaviorPattern(userId);

    // Get all recent behaviors from other users
    const recentBehaviors = await this.behaviorRepository
      .createQueryBuilder('behavior')
      .select('behavior.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .where('behavior.userId != :userId', { userId })
      .andWhere(
        'behavior.createdAt > :date',
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      )
      .groupBy('behavior.userId')
      .having('COUNT(*) > 5')
      .getRawMany();

    // Calculate similarity scores (simplified cosine similarity)
    const similarityScores = await Promise.all(
      recentBehaviors.map(async (rb) => {
        const otherPattern = await this.getUserBehaviorPattern(rb.userId);

        // Calculate similarity based on behavior patterns
        const categoryOverlap = userPattern.preferredEventCategories.filter((cat) =>
          otherPattern.preferredEventCategories.includes(cat),
        ).length;

        const hourOverlap = userPattern.activeHours.filter((hour) =>
          otherPattern.activeHours.includes(hour),
        ).length;

        const ratesDiff =
          Math.abs(
            userPattern.matchAcceptanceRate - otherPattern.matchAcceptanceRate,
          ) +
          Math.abs(
            userPattern.eventParticipationRate -
              otherPattern.eventParticipationRate,
          );

        // Normalized similarity score
        const similarity =
          (categoryOverlap / 5) * 40 +
          (hourOverlap / 3) * 30 +
          (1 - ratesDiff / 2) * 30;

        return {
          userId: rb.userId,
          similarity: Math.round(similarity),
        };
      }),
    );

    return similarityScores
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Predict user interest in a match (ML-inspired)
   */
  async predictMatchInterest(
    userId: string,
    targetUserId: string,
  ): Promise<number> {
    // Get interaction history
    const interactions = await this.behaviorRepository.find({
      where: [
        { userId, targetUserId },
        { userId: targetUserId, targetUserId: userId },
      ],
      order: { createdAt: 'DESC' },
      take: 50,
    });

    if (interactions.length === 0) {
      // No history, use behavior patterns
      const userPattern = await this.getUserBehaviorPattern(userId);
      return Math.round(userPattern.matchAcceptanceRate * 100);
    }

    // Analyze past interactions
    const positiveSignals = interactions.filter(
      (i) =>
        i.behaviorType === BehaviorType.MATCH_ACCEPTED ||
        i.behaviorType === BehaviorType.MESSAGE_SENT ||
        i.behaviorType === BehaviorType.PROFILE_VIEW,
    ).length;

    const negativeSignals = interactions.filter(
      (i) => i.behaviorType === BehaviorType.MATCH_REJECTED,
    ).length;

    const interestScore =
      interactions.length > 0
        ? (positiveSignals / interactions.length) * 100
        : 50;

    // Decay older interactions
    const recentWeight = 0.7;
    const olderWeight = 0.3;
    const recentInteractions = interactions.slice(0, 10);
    const olderInteractions = interactions.slice(10);

    const recentScore =
      recentInteractions.length > 0
        ? (recentInteractions.filter((i) =>
            [
              BehaviorType.MATCH_ACCEPTED,
              BehaviorType.MESSAGE_SENT,
            ].includes(i.behaviorType),
          ).length /
            recentInteractions.length) *
          100
        : interestScore;

    const finalScore = recentScore * recentWeight + interestScore * olderWeight;

    return Math.round(Math.max(0, Math.min(100, finalScore)));
  }
}

