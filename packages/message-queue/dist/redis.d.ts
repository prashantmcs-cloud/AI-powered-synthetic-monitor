declare const redis: any;
export declare const QUEUE_NAMES: {
    readonly TEST_EXECUTION: "test-execution";
    readonly ROOT_CAUSE: "root-cause";
    readonly DEPLOYMENT_REPORT: "deployment-report";
};
export interface QueueMessage {
    id: string;
    type: keyof typeof QUEUE_NAMES;
    payload: any;
    timestamp: string;
}
export declare function enqueue(type: keyof typeof QUEUE_NAMES, payload: any): Promise<string>;
export declare function dequeue(type: keyof typeof QUEUE_NAMES): Promise<QueueMessage | null>;
export declare function subscribe(channel: string, callback: (data: any) => void): Promise<void>;
export declare function publish(channel: string, data: any): Promise<void>;
export { redis };
