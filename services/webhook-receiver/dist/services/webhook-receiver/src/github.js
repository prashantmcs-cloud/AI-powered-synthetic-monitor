export async function getCommitDetails(repo, commitSha, token) {
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`https://api.github.com/repos/${repo}/commits/${commitSha}`, { headers });
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }
    const data = await response.json();
    return {
        sha: data.sha,
        message: data.commit.message,
        author: data.commit.author.name,
        timestamp: data.commit.author.date,
        files: data.files?.map((f) => f.filename) || [],
        additions: data.stats?.additions || 0,
        deletions: data.stats?.deletions || 0
    };
}
export async function compareCommits(repo, base, head, token) {
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`https://api.github.com/repos/${repo}/compare/${base}...${head}`, { headers });
    if (!response.ok) {
        throw new Error(`GitHub compare error: ${response.status}`);
    }
    const data = await response.json();
    return {
        files: data.files?.map((f) => f.filename) || [],
        additions: data.total_additions || 0,
        deletions: data.total_deletions || 0
    };
}
