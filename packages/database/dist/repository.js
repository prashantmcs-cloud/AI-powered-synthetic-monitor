import { Pool } from 'pg';
export class DatabaseRepository {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_synthetic'
    });
    async saveCommit(commit) {
        const result = await this.pool.query(`INSERT INTO commits (repository, branch, commit_sha, previous_commit_sha, author, message, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at as "createdAt"`, [commit.repository, commit.branch, commit.commitSha, commit.previousCommitSha, commit.author, commit.message, commit.timestamp]);
        return { ...commit, id: result.rows[0].id, createdAt: result.rows[0].createdAt };
    }
    async saveBuild(build) {
        const result = await this.pool.query(`INSERT INTO builds (commit_id, build_id, previous_build_id, status, bundle_size, dependency_delta)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at as "createdAt"`, [build.commitId, build.buildId, build.previousBuildId, build.status, build.bundleSize, build.dependencyDelta]);
        return { ...build, id: result.rows[0].id, createdAt: result.rows[0].createdAt };
    }
    async saveDeploymentReport(report) {
        const result = await this.pool.query(`INSERT INTO deployment_reports (commit_sha, previous_commit_sha, build_id, previous_build_id, 
              risk_score, affected_flows, rationale, generated_spec_files, correlation_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, created_at as "createdAt"`, [report.commitSha, report.previousCommitSha, report.buildId, report.previousBuildId,
            report.riskScore, report.affectedFlows, report.rationale, report.generatedSpecFiles, report.correlationId]);
        return { ...report, id: result.rows[0].id, createdAt: result.rows[0].createdAt };
    }
    async saveTestRun(run) {
        const result = await this.pool.query(`INSERT INTO test_runs (report_id, test_id, spec_file, status, duration_ms)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, started_at as "startedAt"`, [run.reportId, run.testId, run.specFile, run.status, run.durationMs]);
        return { ...run, id: result.rows[0].id, startedAt: result.rows[0].startedAt, completedAt: undefined };
    }
    async updateTestRunStatus(testRunId, status, durationMs) {
        const completedAt = status === 'passed' || status === 'failed' || status === 'skipped' ? new Date().toISOString() : undefined;
        await this.pool.query(`UPDATE test_runs SET status = $1, duration_ms = $2, completed_at = $3 WHERE id = $4`, [status, durationMs, completedAt, testRunId]);
    }
    async saveArtifact(artifact) {
        const result = await this.pool.query(`INSERT INTO test_artifacts (test_run_id, type, url) VALUES ($1, $2, $3)
       RETURNING id, created_at as "timestamp"`, [artifact.testRunId, artifact.type, artifact.url]);
        return { ...artifact, id: result.rows[0].id, timestamp: result.rows[0].timestamp };
    }
    async saveRootCause(insight) {
        const result = await this.pool.query(`INSERT INTO root_cause_insights (test_run_id, failure_summary, root_cause, suggested_fix, 
              confidence, related_commit, evidence_refs)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at as "createdAt"`, [insight.testRunId, insight.failureSummary, insight.rootCause, insight.suggestedFix,
            insight.confidence, insight.relatedCommit, insight.evidenceRefs]);
        return { ...insight, id: result.rows[0].id, createdAt: result.rows[0].createdAt };
    }
    async getReports(limit = 50) {
        const result = await this.pool.query(`SELECT id, commit_sha as "commitSha", previous_commit_sha as "previousCommitSha", 
              build_id as "buildId", previous_build_id as "previousBuildId", risk_score as "riskScore",
              affected_flows as "affectedFlows", rationale, generated_spec_files as "generatedSpecFiles",
              correlation_id as "correlationId", created_at as "createdAt"
       FROM deployment_reports ORDER BY created_at DESC LIMIT $1`, [limit]);
        return result.rows;
    }
    async getTestRuns(reportId) {
        const result = await this.pool.query(`SELECT id, report_id as "reportId", test_id as "testId", spec_file as "specFile",
              status, started_at as "startedAt", completed_at as "completedAt", duration_ms as "durationMs"
       FROM test_runs WHERE report_id = $1 ORDER BY started_at DESC`, [reportId]);
        return result.rows;
    }
    async getArtifacts(testRunId) {
        const result = await this.pool.query(`SELECT id, test_run_id as "testRunId", type, url, created_at as "timestamp"
       FROM test_artifacts WHERE test_run_id = $1`, [testRunId]);
        return result.rows;
    }
    async getRootCause(testRunId) {
        const result = await this.pool.query(`SELECT id, test_run_id as "testRunId", failure_summary as "failureSummary", 
              root_cause as "rootCause", suggested_fix as "suggestedFix", confidence,
              related_commit as "relatedCommit", evidence_refs as "evidenceRefs", created_at as "createdAt"
       FROM root_cause_insights WHERE test_run_id = $1`, [testRunId]);
        return result.rows[0] || null;
    }
}
