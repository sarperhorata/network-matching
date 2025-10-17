import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { EventParticipant } from './entities/event-participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventParticipant])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService, TypeOrmModule],
})
export class EventsModule {}

