import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Match } from '../entities/match.entity';
import { SemanticMatchingService } from './semantic-matching.service';
import { BehavioralAnalyticsService } from '../../analytics/services/behavioral-analytics.service';

/**
 * Enhanced Matching Service
 * Combines rule-based, semantic, and behavioral matching
 */
@Injectable()
export class EnhancedMatchingService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly semanticMatching: SemanticMatchingService,
    private readonly behavioralAnalytics: BehavioralAnalyticsService,
  ) {}

  /**
   * Calculate enhanced match score combining multiple algorithms
   */
  async calculateEnhancedMatchScore(
    user1: User,
    user2: User,
  ): Promise<{
    totalScore: number;
    breakdown: {
      ruleBasedScore: number;
      semanticScore: number;
      behavioralScore: number;
      compatibilityScore: number;
    };
    reasons: string[];
    confidence: 'high' | 'medium' | 'low';
  }> {
    // 1. Rule-based matching (original algorithm)
    const ruleBasedResult = this.calculateRuleBasedScore(user1, user2);

    // 2. Semantic matching (NLP-based)
    const semanticResult = this.semanticMatching.calculateSemanticMatchScore(
      user1,
      user2,
    );

    // 3. Behavioral compatibility
    const behavioralScore = await this.calculateBehavioralCompatibility(
      user1.id,
      user2.id,
    );

    // 4. Predict mutual interest
    const compatibilityScore = await this.predictMutualInterest(
      user1.id,
      user2.id,
    );

    // Weighted combination
    const weights = {
      ruleBased: 0.35,
      semantic: 0.25,
      behavioral: 0.20,
      compatibility: 0.20,
    };

    const totalScore = Math.round(
      ruleBasedResult.score * weights.ruleBased +
        semanticResult.score * weights.semantic +
        behavioralScore * weights.behavioral +
        compatibilityScore * weights.compatibility,
    );

    // Combine reasons
    const reasons = [
      ...ruleBasedResult.reasons,
      ...semanticResult.reasons,
    ];

    // Determine confidence level
    let confidence: 'high' | 'medium' | 'low';
    const scoreVariance = Math.max(
      Math.abs(ruleBasedResult.score - semanticResult.score),
      Math.abs(ruleBasedResult.score - behavioralScore),
      Math.abs(semanticResult.score - behavioralScore),
    );

    if (scoreVariance < 15 && totalScore > 60) {
      confidence = 'high';
    } else if (scoreVariance < 30 && totalScore > 40) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    return {
      totalScore,
      breakdown: {
        ruleBasedScore: ruleBasedResult.score,
        semanticScore: semanticResult.score,
        behavioralScore,
        compatibilityScore,
      },
      reasons,
      confidence,
    };
  }

  /**
   * Original rule-based matching algorithm
   */
  private calculateRuleBasedScore(
    user1: User,
    user2: User,
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Industry matching (max 40 points)
    const commonIndustries = (user1.industries || []).filter((industry) =>
      (user2.industries || []).includes(industry),
    );
    if (commonIndustries.length > 0) {
      const industryScore = Math.min(commonIndustries.length * 20, 40);
      score += industryScore;
      reasons.push(`${commonIndustries.length} shared ${commonIndustries.length === 1 ? 'industry' : 'industries'}`);
    }

    // Interest matching (max 30 points)
    const commonInterests = (user1.interests || []).filter((interest) =>
      (user2.interests || []).includes(interest),
    );
    if (commonInterests.length > 0) {
      const interestScore = Math.min(commonInterests.length * 10, 30);
      score += interestScore;
      reasons.push(`${commonInterests.length} shared ${commonInterests.length === 1 ? 'interest' : 'interests'}`);
    }

    // Networking goal matching (max 30 points)
    const commonGoals = (user1.networkingGoals || []).filter((goal) =>
      (user2.networkingGoals || []).includes(goal),
    );
    if (commonGoals.length > 0) {
      const goalScore = Math.min(commonGoals.length * 15, 30);
      score += goalScore;
      reasons.push(`${commonGoals.length} shared ${commonGoals.length === 1 ? 'goal' : 'goals'}`);
    }

    return { score, reasons };
  }

  /**
   * Calculate behavioral compatibility
   */
  private async calculateBehavioralCompatibility(
    user1Id: string,
    user2Id: string,
  ): Promise<number> {
    try {
      const [user1Pattern, user2Pattern] = await Promise.all([
        this.behavioralAnalytics.getUserBehaviorPattern(user1Id),
        this.behavioralAnalytics.getUserBehaviorPattern(user2Id),
      ]);

      // Similar engagement levels
      const engagementCompatibility =
        100 -
        Math.abs(
          user1Pattern.matchAcceptanceRate - user2Pattern.matchAcceptanceRate,
        ) *
          100;

      // Similar event participation
      const eventCompatibility =
        100 -
        Math.abs(
          user1Pattern.eventParticipationRate -
            user2Pattern.eventParticipationRate,
        ) *
          100;

      // Similar activity patterns
      const commonActiveHours = user1Pattern.activeHours.filter((hour) =>
        user2Pattern.activeHours.includes(hour),
      ).length;
      const activityCompatibility = (commonActiveHours / 3) * 100;

      // Weighted average
      return Math.round(
        engagementCompatibility * 0.4 +
          eventCompatibility * 0.3 +
          activityCompatibility * 0.3,
      );
    } catch (error) {
      // If no behavioral data available, return neutral score
      return 50;
    }
  }

  /**
   * Predict mutual interest using ML-inspired approach
   */
  private async predictMutualInterest(
    user1Id: string,
    user2Id: string,
  ): Promise<number> {
    try {
      const [interest1, interest2] = await Promise.all([
        this.behavioralAnalytics.predictMatchInterest(user1Id, user2Id),
        this.behavioralAnalytics.predictMatchInterest(user2Id, user1Id),
      ]);

      // Average of mutual interest predictions
      return Math.round((interest1 + interest2) / 2);
    } catch (error) {
      return 50; // Neutral if no data
    }
  }

  /**
   * Get smart recommendations using enhanced matching
   */
  async getSmartRecommendations(
    userId: string,
    limit: number = 10,
  ): Promise<
    Array<{
      user: User;
      matchScore: number;
      breakdown: {
        ruleBasedScore: number;
        semanticScore: number;
        behavioralScore: number;
        compatibilityScore: number;
      };
      reasons: string[];
      confidence: 'high' | 'medium' | 'low';
    }>
  > {
    const targetUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!targetUser) {
      return [];
    }

    // Get candidate users (excluding already matched)
    const existingMatches = await this.matchRepository.find({
      where: [{ user1Id: userId }, { user2Id: userId }],
      select: ['user1Id', 'user2Id'],
    });

    const excludedIds = new Set([
      userId,
      ...existingMatches.flatMap((m) => [m.user1Id, m.user2Id]),
    ]);

    const candidates = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id NOT IN (:...excludedIds)', {
        excludedIds: Array.from(excludedIds),
      })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .take(50) // Evaluate top 50 candidates
      .getMany();

    // Calculate enhanced scores for all candidates
    const scoredCandidates = await Promise.all(
      candidates.map(async (candidate) => {
        const result = await this.calculateEnhancedMatchScore(
          targetUser,
          candidate,
        );

        return {
          user: candidate,
          matchScore: result.totalScore,
          breakdown: result.breakdown,
          reasons: result.reasons,
          confidence: result.confidence,
        };
      }),
    );

    // Sort by score and confidence
    return scoredCandidates
      .filter((sc) => sc.matchScore > 30) // Minimum threshold
      .sort((a, b) => {
        // Prioritize high confidence matches
        if (a.confidence !== b.confidence) {
          const confScore = { high: 3, medium: 2, low: 1 };
          return confScore[b.confidence] - confScore[a.confidence];
        }
        return b.matchScore - a.matchScore;
      })
      .slice(0, limit);
  }

  /**
   * Explain a match using all algorithms
   */
  async explainMatch(
    user1Id: string,
    user2Id: string,
  ): Promise<{
    overallScore: number;
    breakdown: {
      ruleBasedScore: number;
      semanticScore: number;
      behavioralScore: number;
      compatibilityScore: number;
    };
    detailedReasons: {
      ruleBased: string[];
      semantic: string[];
      behavioral: string[];
    };
    recommendation: string;
    confidence: 'high' | 'medium' | 'low';
  }> {
    const [user1, user2] = await Promise.all([
      this.userRepository.findOne({ where: { id: user1Id } }),
      this.userRepository.findOne({ where: { id: user2Id } }),
    ]);

    if (!user1 || !user2) {
      throw new Error('Users not found');
    }

    const enhancedResult = await this.calculateEnhancedMatchScore(user1, user2);
    const ruleBasedResult = this.calculateRuleBasedScore(user1, user2);
    const semanticResult = this.semanticMatching.calculateSemanticMatchScore(
      user1,
      user2,
    );

    let recommendation = '';
    if (enhancedResult.confidence === 'high' && enhancedResult.totalScore > 70) {
      recommendation = 'Highly recommended match! Strong compatibility across all dimensions.';
    } else if (enhancedResult.confidence === 'medium' && enhancedResult.totalScore > 50) {
      recommendation = 'Good potential match. Consider reaching out for networking.';
    } else if (enhancedResult.totalScore > 30) {
      recommendation = 'Moderate match. May be worth exploring common interests.';
    } else {
      recommendation = 'Low compatibility. Consider other matches first.';
    }

    return {
      overallScore: enhancedResult.totalScore,
      breakdown: enhancedResult.breakdown,
      detailedReasons: {
        ruleBased: ruleBasedResult.reasons,
        semantic: semanticResult.reasons,
        behavioral: [
          `Behavioral compatibility: ${enhancedResult.breakdown.behavioralScore}%`,
        ],
      },
      recommendation,
      confidence: enhancedResult.confidence,
    };
  }
}

