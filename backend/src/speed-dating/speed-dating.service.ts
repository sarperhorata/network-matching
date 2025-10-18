import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpeedDatingSession, SessionStatus } from './entities/speed-dating-session.entity';

@Injectable()
export class SpeedDatingService {
  constructor(
    @InjectRepository(SpeedDatingSession)
    private sessionRepository: Repository<SpeedDatingSession>,
  ) {}

  /**
   * Create a new speed dating session
   */
  async createSession(createDto: {
    eventId: string;
    title: string;
    description?: string;
    scheduledAt: Date;
    roundDurationMinutes?: number;
    totalRounds?: number;
    maxParticipants?: number;
  }): Promise<SpeedDatingSession> {
    const session = this.sessionRepository.create(createDto);
    return this.sessionRepository.save(session);
  }

  /**
   * Join a speed dating session
   */
  async joinSession(
    sessionId: string,
    userId: string,
  ): Promise<SpeedDatingSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.participantIds.length >= session.maxParticipants) {
      throw new Error('Session is full');
    }

    if (session.participantIds.includes(userId)) {
      throw new Error('Already joined');
    }

    session.participantIds.push(userId);
    return this.sessionRepository.save(session);
  }

  /**
   * Generate AI-powered pairings for all rounds
   */
  async generatePairings(sessionId: string): Promise<SpeedDatingSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const participants = [...session.participantIds];
    const pairings = [];

    // Simple round-robin algorithm
    for (let round = 1; round <= session.totalRounds; round++) {
      for (let i = 0; i < participants.length - 1; i += 2) {
        if (participants[i] && participants[i + 1]) {
          pairings.push({
            round,
            user1Id: participants[i],
            user2Id: participants[i + 1],
          });
        }
      }
      // Rotate for next round
      const last = participants.pop();
      if (last) participants.splice(1, 0, last);
    }

    session.pairings = pairings;
    return this.sessionRepository.save(session);
  }

  /**
   * Start a session
   */
  async startSession(sessionId: string): Promise<SpeedDatingSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    session.status = SessionStatus.IN_PROGRESS;
    return this.sessionRepository.save(session);
  }

  /**
   * Get user's current pairing
   */
  async getCurrentPairing(sessionId: string, userId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      return null;
    }

    // Find current round based on time
    const now = new Date();
    const sessionStart = new Date(session.scheduledAt);
    const elapsedMinutes = Math.floor(
      (now.getTime() - sessionStart.getTime()) / (1000 * 60),
    );
    const currentRound = Math.floor(elapsedMinutes / session.roundDurationMinutes) + 1;

    const currentPairing = session.pairings.find(
      (p) =>
        p.round === currentRound &&
        (p.user1Id === userId || p.user2Id === userId),
    );

    return {
      round: currentRound,
      totalRounds: session.totalRounds,
      pairing: currentPairing,
      timeRemaining: session.roundDurationMinutes - (elapsedMinutes % session.roundDurationMinutes),
    };
  }
}

