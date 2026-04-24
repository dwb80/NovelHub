import { Module, Global } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TimeSlotService } from './time-slot.service';

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [TimeSlotService],
  exports: [TimeSlotService, ScheduleModule],
})
export class SchedulingModule {}
