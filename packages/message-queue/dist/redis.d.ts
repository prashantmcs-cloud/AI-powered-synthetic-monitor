import RedisLib from 'ioredis';
declare const redis: RedisLib.Redis;
export declare const QUEUE_NAMES: {
    readonly TEST_EXECUTION: "test-execution";
    readonly ROOT_CAUSE: "root-cause";
    readonly DEPLOYMENT_REPORT: "deployment-report";
};
export interface QueueMessage {
    id: string;
    type: keyof typeof QUEUE_NAMES;
    payload: unknown;
    timestamp: string;
}
export declare function enqueue(type: keyof typeof QUEUE_NAMES, payload: unknown): Promise<string>;
export declare function dequeue(type: keyof typeof QUEUE_NAMES): Promise<QueueMessage | null>;
export declare function subscribe(channel: string, callback: (data: unknown) => void): Promise<void>;
export declare function publish(channel: string, data: unknown): Promise<void>;
export { redis };
