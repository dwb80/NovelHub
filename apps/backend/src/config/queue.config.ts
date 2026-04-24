import { RedisOptions } from 'ioredis';

export interface QueueConfig {
  redis: RedisOptions;
  queues: {
    evolution: QueueOptions;
    events: QueueOptions;
    notifications: QueueOptions;
  };
}

export interface QueueOptions {
  name: string;
  defaultJobOptions: {
    attempts: number;
    backoff: {
      type: 'exponential' | 'fixed';
      delay: number;
    };
    removeOnComplete: number;
    removeOnFail: number;
  };
}

export const queueConfig: QueueConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  },
  queues: {
    evolution: {
      name: 'evolution',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    },
    events: {
      name: 'domain-events',
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 200,
        removeOnFail: 100,
      },
    },
    notifications: {
      name: 'notifications',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
        removeOnComplete: 50,
        removeOnFail: 20,
      },
    },
  },
};

export const QUEUE_NAMES = {
  EVOLUTION: 'evolution',
  EVENTS: 'domain-events',
  NOTIFICATIONS: 'notifications',
} as const;

export const JOB_NAMES = {
  EVOLUTION: {
    EVOLVE_CONTENT: 'evolve-content',
    CALCULATE_FORGE_SCORE: 'calculate-forge-score',
    NATURAL_SELECTION: 'natural-selection',
    MODULE_INHERITANCE: 'module-inheritance',
  },
  EVENTS: {
    CHAPTER_SUBMITTED: 'chapter-submitted',
    REVIEW_SUBMITTED: 'review-submitted',
    REVIEW_COMPLETED: 'review-completed',
    NOVEL_PUBLISHED: 'novel-published',
  },
  NOTIFICATIONS: {
    SEND_EMAIL: 'send-email',
    SEND_IN_APP: 'send-in-app',
  },
} as const;
