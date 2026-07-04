export interface GitHubCommitInfo {
  sha: string;
  message: string;
  author: string;
  timestamp: string;
  files: string[];
  additions: number;
  deletions: number;
}

export async function getCommitDetails(
  repo: string, 
  commitSha: string, 
  token?: string
): Promise<GitHubCommitInfo> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(
    `https://api.github.com/repos/${repo}/commits/${commitSha}`,
    { headers }
  );
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  const data = await response.json();
  return {
    sha: data.sha,
    message: data.commit.message,
    author: data.commit.author.name,
    timestamp: data.commit.author.date,
    files: data.files?.map((f: any) => f.filename) || [],
    additions: data.stats?.additions || 0,
    deletions: data.stats?.deletions || 0
  };
}

export async function compareCommits(
  repo: string,
  base: string,
  head: string,
  token?: string
): Promise<{ files: string[]; additions: number; deletions: number }> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(
    `https://api.github.com/repos/${repo}/compare/${base}...${head}`,
    { headers }
  );
  
  if (!response.ok) {
    throw new Error(`GitHub compare error: ${response.status}`);
  }
  
  const data = await response.json();
  return {
    files: data.files?.map((f: any) => f.filename) || [],
    additions: data.total_additions || 0,
    deletions: data.total_deletions || 0
  };
}