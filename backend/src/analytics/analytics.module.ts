import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { BehavioralAnalyticsService } from './services/behavioral-analytics.service';
import { Event } from '../events/entities/event.entity';
import { EventParticipant } from '../events/entities/event-participant.entity';
import { Match } from '../matches/entities/match.entity';
import { Meeting } from '../meetings/entities/meeting.entity';
import { Message } from '../messages/entities/message.entity';
import { UserBehavior } from './entities/user-behavior.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventParticipant,
      Match,
      Meeting,
      Message,
      UserBehavior,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, BehavioralAnalyticsService],
  exports: [AnalyticsService, BehavioralAnalyticsService],
})
export class AnalyticsModule {}

