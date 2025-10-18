import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialCapitalService } from './social-capital.service';
import { User } from '../users/entities/user.entity';
import { Match } from '../matches/entities/match.entity';
import { Message } from '../messages/entities/message.entity';
import { Meeting } from '../meetings/entities/meeting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Match, Message, Meeting])],
  providers: [SocialCapitalService],
  exports: [SocialCapitalService],
})
export class SocialCapitalModule {}

