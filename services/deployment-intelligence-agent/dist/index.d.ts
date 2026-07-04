import { type DeploymentIntelligenceReport } from '@ai-synthetic/shared-types';
export interface CommitEvent {
    repo: string;
    branch: string;
    commitSha: string;
    previousCommitSha: string;
    pusher: string;
    timestamp: string;
}
export interface BuildSnapshot {
    buildId: string;
    previousBuildId: string;
    bundleSize: number;
    dependencyDelta: string[];
}
export declare function analyzeDeploymentIntelligence(event: CommitEvent, build: BuildSnapshot): DeploymentIntelligenceReport;
export declare function generateSpecFiles(event: CommitEvent, risk: {
    riskScore: number;
    affectedFlows: string[];
}): string[];
