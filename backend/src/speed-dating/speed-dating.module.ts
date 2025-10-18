import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpeedDatingService } from './speed-dating.service';
import { SpeedDatingController } from './speed-dating.controller';
import { SpeedDatingSession } from './entities/speed-dating-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpeedDatingSession])],
  controllers: [SpeedDatingController],
  providers: [SpeedDatingService],
  exports: [SpeedDatingService],
})
export class SpeedDatingModule {}

