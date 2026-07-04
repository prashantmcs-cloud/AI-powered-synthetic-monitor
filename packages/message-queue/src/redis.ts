import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const QUEUE_NAMES = {
  TEST_EXECUTION: 'test-execution',
  ROOT_CAUSE: 'root-cause',
  DEPLOYMENT_REPORT: 'deployment-report'
} as const;

export interface QueueMessage {
  id: string;
  type: keyof typeof QUEUE_NAMES;
  payload: unknown;
  timestamp: string;
}

export async function enqueue(type: keyof typeof QUEUE_NAMES, payload: unknown): Promise<string> {
  const message: QueueMessage = {
    id: crypto.randomUUID(),
    type,
    payload,
    timestamp: new Date().toISOString()
  };
  
  const queueName = QUEUE_NAMES[type];
  await redis.lpush(queueName, JSON.stringify(message));
  return message.id;
}

export async function dequeue(type: keyof typeof QUEUE_NAMES): Promise<QueueMessage | null> {
  const queueName = QUEUE_NAMES[type];
  const data = await redis.rpop(queueName);
  return data ? JSON.parse(data) : null;
}

export async function subscribe(channel: string, callback: (data: unknown) => void): Promise<void> {
  const sub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  await sub.subscribe(channel);
  sub.on('message', (_ch: string, message: string) => {
    callback(JSON.parse(message));
  });
}

export async function publish(channel: string, data: unknown): Promise<void> {
  await redis.publish(channel, JSON.stringify(data));
}

export { redis };