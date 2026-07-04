import RedisLib from 'ioredis';

const Redis = RedisLib.default || RedisLib;

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const QUEUE_NAMES = {
   TEST_EXECUTION: 'test-execution',
   ROOT_CAUSE: 'root-cause',
   DEPLOYMENT_REPORT: 'deployment-report'
 } as Record<string, string>;

export interface QueueMessage {
   id: string;
   type: string;
   payload: unknown;
   timestamp: string;
 }

export async function enqueue(type: string, payload: unknown): Promise<string> {
   const message: QueueMessage = {
     id: crypto.randomUUID(),
     type,
     payload,
     timestamp: new Date().toISOString()
   };

   await redis.lpush(type, JSON.stringify(message));
   return message.id;
 }

export async function dequeue(type: string): Promise<QueueMessage | null> {
   const data = await redis.rpop(type);
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