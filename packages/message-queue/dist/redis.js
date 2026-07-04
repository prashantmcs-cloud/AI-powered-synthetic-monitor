import RedisLib from 'ioredis';
const Redis = RedisLib.default || RedisLib;
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
export const QUEUE_NAMES = {
    TEST_EXECUTION: 'test-execution',
    ROOT_CAUSE: 'root-cause',
    DEPLOYMENT_REPORT: 'deployment-report'
};
export async function enqueue(type, payload) {
    const message = {
        id: crypto.randomUUID(),
        type,
        payload,
        timestamp: new Date().toISOString()
    };
    const queueName = QUEUE_NAMES[type];
    await redis.lpush(queueName, JSON.stringify(message));
    return message.id;
}
export async function dequeue(type) {
    const queueName = QUEUE_NAMES[type];
    const data = await redis.rpop(queueName);
    return data ? JSON.parse(data) : null;
}
export async function subscribe(channel, callback) {
    const sub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    await sub.subscribe(channel);
    sub.on('message', (_ch, message) => {
        callback(JSON.parse(message));
    });
}
export async function publish(channel, data) {
    await redis.publish(channel, JSON.stringify(data));
}
export { redis };
