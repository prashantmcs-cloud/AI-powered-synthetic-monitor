export interface GitHubCommitInfo {
    sha: string;
    message: string;
    author: string;
    timestamp: string;
    files: string[];
    additions: number;
    deletions: number;
}
export declare function getCommitDetails(repo: string, commitSha: string, token?: string): Promise<GitHubCommitInfo>;
export declare function compareCommits(repo: string, base: string, head: string, token?: string): Promise<{
    files: string[];
    additions: number;
    deletions: number;
}>;
