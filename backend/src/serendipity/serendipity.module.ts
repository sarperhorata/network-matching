import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SerendipityService } from './serendipity.service';
import { User } from '../users/entities/user.entity';
import { Match } from '../matches/entities/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Match])],
  providers: [SerendipityService],
  exports: [SerendipityService],
})
export class SerendipityModule {}

