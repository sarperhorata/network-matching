import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Event } from '../events/entities/event.entity';
import { EventParticipant } from '../events/entities/event-participant.entity';
import { Match } from '../matches/entities/match.entity';
import { Meeting } from '../meetings/entities/meeting.entity';
import { Message } from '../messages/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventParticipant, Match, Meeting, Message]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

