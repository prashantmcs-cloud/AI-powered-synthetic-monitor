import { createBaseEnvelope } from '@ai-synthetic/shared-types';
export function processGitHubPush(payload) {
    const isMasterBranch = payload.ref === 'refs/heads/master';
    const commitSha = payload.head_commit?.id ?? 'unknown';
    const previousCommitSha = payload.before ?? 'unknown';
    return createBaseEnvelope({
        eventType: isMasterBranch ? 'commit.pushed' : 'ignored.push',
        orgId: 'acme',
        projectId: 'platform',
        payload: {
            repo: payload.repository?.full_name ?? 'unknown',
            branch: payload.ref ?? 'unknown',
            commitSha,
            previousCommitSha,
            pusher: payload.pusher?.name ?? 'unknown',
            isMasterBranch
        }
    });
}
