import RedisLib from 'ioredis';
declare const redis: RedisLib.Redis;
export declare const QUEUE_NAMES: Record<string, string>;
export interface QueueMessage {
    id: string;
    type: string;
    payload: unknown;
    timestamp: string;
}
export declare function enqueue(type: string, payload: unknown): Promise<string>;
export declare function dequeue(type: string): Promise<QueueMessage | null>;
export declare function subscribe(channel: string, callback: (data: unknown) => void): Promise<void>;
export declare function publish(channel: string, data: unknown): Promise<void>;
export { redis };
