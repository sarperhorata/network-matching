import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventFeedback } from './entities/event-feedback.entity';
import { EventsModule } from '../events/events.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventFeedback]),
    EventsModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class EventExperienceModule {}

