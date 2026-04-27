import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { queueConfig, QUEUE_NAMES, JOB_NAMES } from '../config/queue.config';
import { EvolutionJobData } from './processors/evolution.processor';
import { EventJobData } from './processors/event.processor';
import { NotificationJobData } from './processors/notification.processor';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.EVOLUTION) private evolutionQueue: Queue,
    @InjectQueue(QUEUE_NAMES.EVENTS) private eventQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private notificationQueue: Queue,
  ) {}

  async addEvolutionJob(data: EvolutionJobData): Promise<Job> {
    this.logger.log(`Adding evolution job for chapter: ${data.chapterId}`);
    
    return this.evolutionQueue.add(
      JOB_NAMES.EVOLUTION.EVOLVE_CONTENT,
      data,
      queueConfig.queues.evolution.defaultJobOptions,
    );
  }

  async addForgeScoreJob(agentId: string): Promise<Job> {
    this.logger.log(`Adding forge score calculation job for agent: ${agentId}`);

    return this.evolutionQueue.add(
      JOB_NAMES.EVOLUTION.CALCULATE_FORGE_SCORE,
      { agentId },
      { ...queueConfig.queues.evolution.defaultJobOptions, priority: 1 },
    );
  }

  async addNaturalSelectionJob(): Promise<Job> {
    this.logger.log('Adding natural selection job');
    
    return this.evolutionQueue.add(
      JOB_NAMES.EVOLUTION.NATURAL_SELECTION,
      {},
      { 
        ...queueConfig.queues.evolution.defaultJobOptions,
        priority: 10,
        repeat: { cron: '0 0 * * *' },
      },
    );
  }

  async addModuleInheritanceJob(parentId: string, childId: string): Promise<Job> {
    this.logger.log(`Adding module inheritance job: ${parentId} -> ${childId}`);
    
    return this.evolutionQueue.add(
      JOB_NAMES.EVOLUTION.MODULE_INHERITANCE,
      { parentId, childId },
      queueConfig.queues.evolution.defaultJobOptions,
    );
  }

  async addEventJob(data: EventJobData): Promise<Job> {
    this.logger.debug(`Adding event job: ${data.eventType}`);
    
    return this.eventQueue.add(
      data.eventType,
      data,
      queueConfig.queues.events.defaultJobOptions,
    );
  }

  async addNotificationJob(data: NotificationJobData): Promise<Job> {
    this.logger.debug(`Adding notification job: ${data.type} to ${data.recipient}`);
    
    const jobName = data.type === 'email' 
      ? JOB_NAMES.NOTIFICATIONS.SEND_EMAIL 
      : JOB_NAMES.NOTIFICATIONS.SEND_IN_APP;
    
    return this.notificationQueue.add(
      jobName,
      data,
      queueConfig.queues.notifications.defaultJobOptions,
    );
  }

  async getJobStatus(queueName: string, jobId: string): Promise<Job | null> {
    let queue: Queue;
    
    switch (queueName) {
      case QUEUE_NAMES.EVOLUTION:
        queue = this.evolutionQueue;
        break;
      case QUEUE_NAMES.EVENTS:
        queue = this.eventQueue;
        break;
      case QUEUE_NAMES.NOTIFICATIONS:
        queue = this.notificationQueue;
        break;
      default:
        return null;
    }
    
    return queue.getJob(jobId);
  }

  async getQueueStats(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    let queue: Queue;
    
    switch (queueName) {
      case QUEUE_NAMES.EVOLUTION:
        queue = this.evolutionQueue;
        break;
      case QUEUE_NAMES.EVENTS:
        queue = this.eventQueue;
        break;
      case QUEUE_NAMES.NOTIFICATIONS:
        queue = this.notificationQueue;
        break;
      default:
        return { waiting: 0, active: 0, completed: 0, failed: 0 };
    }
    
    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
    ]);
    
    return { waiting, active, completed, failed };
  }

  async pauseQueue(queueName: string): Promise<void> {
    this.logger.warn(`Pausing queue: ${queueName}`);
    
    switch (queueName) {
      case QUEUE_NAMES.EVOLUTION:
        await this.evolutionQueue.pause();
        break;
      case QUEUE_NAMES.EVENTS:
        await this.eventQueue.pause();
        break;
      case QUEUE_NAMES.NOTIFICATIONS:
        await this.notificationQueue.pause();
        break;
    }
  }

  async resumeQueue(queueName: string): Promise<void> {
    this.logger.log(`Resuming queue: ${queueName}`);
    
    switch (queueName) {
      case QUEUE_NAMES.EVOLUTION:
        await this.evolutionQueue.resume();
        break;
      case QUEUE_NAMES.EVENTS:
        await this.eventQueue.resume();
        break;
      case QUEUE_NAMES.NOTIFICATIONS:
        await this.notificationQueue.resume();
        break;
    }
  }

  async cleanQueue(queueName: string, olderThan: number = 24 * 3600 * 1000): Promise<void> {
    this.logger.log(`Cleaning queue: ${queueName}`);
    
    const grace = olderThan;
    
    switch (queueName) {
      case QUEUE_NAMES.EVOLUTION:
        await this.evolutionQueue.clean(grace, 'completed');
        await this.evolutionQueue.clean(grace, 'failed');
        break;
      case QUEUE_NAMES.EVENTS:
        await this.eventQueue.clean(grace, 'completed');
        await this.eventQueue.clean(grace, 'failed');
        break;
      case QUEUE_NAMES.NOTIFICATIONS:
        await this.notificationQueue.clean(grace, 'completed');
        await this.notificationQueue.clean(grace, 'failed');
        break;
    }
  }

  async getQueueHealth(): Promise<{
    evolution: { waiting: number; active: number; completed: number; failed: number };
    events: { waiting: number; active: number; completed: number; failed: number };
    notifications: { waiting: number; active: number; completed: number; failed: number };
  }> {
    const [evolution, events, notifications] = await Promise.all([
      this.getQueueStats(QUEUE_NAMES.EVOLUTION),
      this.getQueueStats(QUEUE_NAMES.EVENTS),
      this.getQueueStats(QUEUE_NAMES.NOTIFICATIONS),
    ]);

    return { evolution, events, notifications };
  }
}
