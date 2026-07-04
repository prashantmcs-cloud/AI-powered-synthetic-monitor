export interface GitHubCommitComparison {
    currentCommit: {
        sha: string;
        message: string;
        author: string;
        files: string[];
        additions: number;
        deletions: number;
    };
    previousCommit: {
        sha: string;
        message: string;
    };
}
export interface BuildComparison {
    buildId: string;
    previousBuildId: string;
    bundleSize: number;
    previousBundleSize: number;
    dependencyDelta: string[];
}
export declare function analyzeCommitChanges(comparison: GitHubCommitComparison): {
    affectedFlows: string[];
    riskScore: number;
    rationale: string;
};
export declare function generatePlaywrightTests(comparison: GitHubCommitComparison, build: BuildComparison, affectedFlows: string[]): {
    specFile: string;
    content: string;
}[];
export declare function writeSpecFiles(specs: {
    specFile: string;
    content: string;
}[]): void;
