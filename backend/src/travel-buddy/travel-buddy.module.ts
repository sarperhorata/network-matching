import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelBuddyService } from './travel-buddy.service';
import { TravelInfo } from './entities/travel-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TravelInfo])],
  providers: [TravelBuddyService],
  exports: [TravelBuddyService],
})
export class TravelBuddyModule {}

