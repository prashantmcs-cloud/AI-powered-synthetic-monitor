import { analyzeCommitChanges, generatePlaywrightTests, writeSpecFiles } from './ai-analyzer.js';
import { DatabaseRepository } from '@ai-synthetic/database';
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    if (command === 'analyze') {
        const commitSha = args[1];
        const previousCommitSha = args[2] || process.env.PREVIOUS_COMMIT_SHA;
        if (!commitSha) {
            console.error('Usage: analyze <commitSha> [previousCommitSha]');
            process.exit(1);
        }
        const mockComparison = {
            currentCommit: {
                sha: commitSha,
                message: 'Automated test generation',
                author: 'ai-agent',
                files: ['src/components/Login.tsx', 'src/pages/Dashboard.tsx'],
                additions: 150,
                deletions: 45
            },
            previousCommit: {
                sha: previousCommitSha || 'unknown',
                message: 'Previous commit'
            }
        };
        const buildComparison = {
            buildId: `build-${commitSha.substring(0, 7)}`,
            previousBuildId: `build-${previousCommitSha?.substring(0, 7) || 'prev'}`,
            bundleSize: 250000,
            previousBundleSize: 200000,
            dependencyDelta: ['@playwright/test@1.40.0']
        };
        const analysis = analyzeCommitChanges(mockComparison);
        const specs = generatePlaywrightTests(mockComparison, buildComparison, analysis.affectedFlows);
        writeSpecFiles(specs);
        await DatabaseRepository.saveDeploymentReport({
            commitSha,
            previousCommitSha,
            buildId: buildComparison.buildId,
            previousBuildId: buildComparison.previousBuildId,
            riskScore: analysis.riskScore,
            affectedFlows: analysis.affectedFlows,
            rationale: analysis.rationale,
            generatedSpecFiles: specs.map(s => s.specFile),
            correlationId: crypto.randomUUID()
        });
        console.log(JSON.stringify({ analysis, specFiles: specs.map(s => s.specFile), saved: true }, null, 2));
    }
}
main().catch(console.error);
