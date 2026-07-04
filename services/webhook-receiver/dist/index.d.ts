import { type BaseEnvelope } from '@ai-synthetic/shared-types';
export interface GitHubPushPayload {
    ref?: string;
    repository?: {
        full_name?: string;
    };
    head_commit?: {
        id?: string;
    };
    pusher?: {
        name?: string;
    };
    before?: string;
}
export declare function processGitHubPush(payload: GitHubPushPayload): BaseEnvelope;
