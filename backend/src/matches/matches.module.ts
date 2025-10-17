import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Match } from './entities/match.entity';
import { MatchingAlgorithmService } from '../common/services/matching-algorithm.service';
import { SemanticMatchingService } from './services/semantic-matching.service';
import { EnhancedMatchingService } from './services/enhanced-matching.service';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
    UsersModule,
    EventsModule,
    AnalyticsModule,
  ],
  controllers: [MatchesController],
  providers: [
    MatchesService,
    MatchingAlgorithmService,
    SemanticMatchingService,
    EnhancedMatchingService,
  ],
  exports: [
    MatchesService,
    MatchingAlgorithmService,
    SemanticMatchingService,
    EnhancedMatchingService,
  ],
})
export class MatchesModule {}

