import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { EventParticipant } from '../../events/entities/event-participant.entity';

export interface MatchScore {
  user1Id: string;
  user2Id: string;
  score: number;
  reasons: string[];
}

@Injectable()
export class MatchingAlgorithmService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(EventParticipant)
    private participantsRepository: Repository<EventParticipant>,
  ) {}

  async generateMatches(eventId: string, userId?: string): Promise<MatchScore[]> {
    // Get event participants
    const participants = await this.participantsRepository.find({
      where: { eventId },
      relations: ['user'],
    });

    if (participants.length < 2) {
      return []; // Need at least 2 participants for matching
    }

    const userIds = participants.map(p => p.user.id);
    const users = await this.usersRepository.find({
      where: userIds.map(id => ({ id })),
    });

    // If specific user is provided, only match with other participants
    if (userId) {
      return this.generateMatchesForUser(userId, users, eventId);
    }

    // Generate matches for all participants
    return this.generateAllMatches(users, eventId);
  }

  private async generateMatchesForUser(
    userId: string,
    allUsers: User[],
    eventId: string,
  ): Promise<MatchScore[]> {
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return [];

    const otherUsers = allUsers.filter(u => u.id !== userId);
    const matches: MatchScore[] = [];

    for (const otherUser of otherUsers) {
      const score = this.calculateMatchScore(targetUser, otherUser);
      if (score.score > 0) {
        matches.push({
          user1Id: userId,
          user2Id: otherUser.id,
          score: score.score,
          reasons: score.reasons,
        });
      }
    }

    // Sort by score (highest first)
    return matches.sort((a, b) => b.score - a.score);
  }

  private async generateAllMatches(users: User[], eventId: string): Promise<MatchScore[]> {
    const matches: MatchScore[] = [];

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const score = this.calculateMatchScore(users[i], users[j]);
        if (score.score > 0) {
          matches.push({
            user1Id: users[i].id,
            user2Id: users[j].id,
            score: score.score,
            reasons: score.reasons,
          });
        }
      }
    }

    // Sort by score (highest first)
    return matches.sort((a, b) => b.score - a.score);
  }

  private calculateMatchScore(user1: User, user2: User): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Industry match (40 points max)
    const industryMatches = this.getIntersectionSize(user1.industries || [], user2.industries || []);
    if (industryMatches > 0) {
      const industryScore = Math.min(industryMatches * 20, 40);
      score += industryScore;
      reasons.push(`${industryMatches} shared ${industryMatches === 1 ? 'industry' : 'industries'}`);
    }

    // Interest match (30 points max)
    const interestMatches = this.getIntersectionSize(user1.interests || [], user2.interests || []);
    if (interestMatches > 0) {
      const interestScore = Math.min(interestMatches * 10, 30);
      score += interestScore;
      reasons.push(`${interestMatches} shared ${interestMatches === 1 ? 'interest' : 'interests'}`);
    }

    // Networking goals match (30 points max)
    const goalMatches = this.getIntersectionSize(user1.networkingGoals || [], user2.networkingGoals || []);
    if (goalMatches > 0) {
      const goalScore = Math.min(goalMatches * 15, 30);
      score += goalScore;
      reasons.push(`${goalMatches} shared ${goalMatches === 1 ? 'goal' : 'goals'}`);
    }

    return { score, reasons };
  }

  private getIntersectionSize(array1: string[], array2: string[]): number {
    if (!array1 || !array2) return 0;

    const set1 = new Set(array1.map(item => item.toLowerCase()));
    const set2 = new Set(array2.map(item => item.toLowerCase()));

    let intersection = 0;
    for (const item of set1) {
      if (set2.has(item)) {
        intersection++;
      }
    }

    return intersection;
  }

  async getRecommendedMatches(userId: string, limit: number = 5): Promise<User[]> {
    // Get all users except the current user
    const allUsers = await this.usersRepository.find({
      where: { id: { $ne: userId } as any },
    });

    if (allUsers.length === 0) return [];

    const currentUser = await this.usersRepository.findOne({ where: { id: userId } });
    if (!currentUser) return [];

    // Calculate scores for all users
    const scoredUsers = allUsers.map(user => {
      const { score } = this.calculateMatchScore(currentUser, user);
      return { user, score };
    });

    // Sort by score and return top matches
    scoredUsers.sort((a, b) => b.score - a.score);

    return scoredUsers.slice(0, limit).map(item => item.user);
  }
}
