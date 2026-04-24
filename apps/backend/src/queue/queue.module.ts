import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { queueConfig } from '../config/queue.config';
import { EvolutionProcessor } from './processors/evolution.processor';
import { EventProcessor } from './processors/event.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { QueueService } from './queue.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Global()
@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: queueConfig.redis,
      }),
    }),
    BullModule.registerQueue(
      { name: queueConfig.queues.evolution.name },
      { name: queueConfig.queues.events.name },
      { name: queueConfig.queues.notifications.name },
    ),
  ],
  providers: [QueueService, EvolutionProcessor, EventProcessor, NotificationProcessor],
  exports: [QueueService, BullModule],
})
export class QueueModule { }
