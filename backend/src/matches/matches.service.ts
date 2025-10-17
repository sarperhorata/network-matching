import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './entities/match.entity';
import { MatchingAlgorithmService, MatchScore } from '../common/services/matching-algorithm.service';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    private matchingAlgorithmService: MatchingAlgorithmService,
  ) {}

  async generateMatches(eventId: string, userId?: string): Promise<MatchScore[]> {
    return this.matchingAlgorithmService.generateMatches(eventId, userId);
  }

  async createMatchesFromScores(eventId: string, matchScores: MatchScore[]): Promise<Match[]> {
    const matches: Match[] = [];

    for (const score of matchScores) {
      // Check if match already exists (in either direction)
      const existingMatch = await this.matchesRepository.findOne({
        where: [
          { user1Id: score.user1Id, user2Id: score.user2Id, eventId },
          { user1Id: score.user2Id, user2Id: score.user1Id, eventId },
        ],
      });

      if (!existingMatch) {
        const match = this.matchesRepository.create({
          user1Id: score.user1Id,
          user2Id: score.user2Id,
          eventId,
          score: score.score,
          status: MatchStatus.PENDING,
          matchReasons: { reasons: score.reasons },
        });

        matches.push(await this.matchesRepository.save(match));
      }
    }

    return matches;
  }

  async findByUser(userId: string): Promise<Match[]> {
    return this.matchesRepository.find({
      where: [
        { user1Id: userId },
        { user2Id: userId },
      ],
      relations: ['user1', 'user2', 'event'],
    });
  }

  async findByEvent(eventId: string): Promise<Match[]> {
    return this.matchesRepository.find({
      where: { eventId },
      relations: ['user1', 'user2'],
    });
  }

  async updateMatchStatus(matchId: string, status: MatchStatus): Promise<Match> {
    await this.matchesRepository.update(matchId, { status });
    return this.matchesRepository.findOne({ where: { id: matchId } });
  }

  async getRecommendedMatches(userId: string, limit: number = 5): Promise<any[]> {
    return this.matchingAlgorithmService.getRecommendedMatches(userId, limit);
  }
}

