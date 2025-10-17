import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Match } from './entities/match.entity';
import { MatchingAlgorithmService } from '../common/services/matching-algorithm.service';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
    UsersModule,
    EventsModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService, MatchingAlgorithmService],
  exports: [MatchesService, MatchingAlgorithmService],
})
export class MatchesModule {}

