import { useState, useEffect } from 'react';
import './App.css';

interface DeploymentReport {
  id: string;
  commitSha: string;
  riskScore: number;
  affectedFlows: string[];
  createdAt: string;
}

interface TestRun {
  id: string;
  testId: string;
  status: 'passed' | 'failed' | 'running' | 'queued';
  durationMs?: number;
}

interface RootCauseInsight {
  failureSummary: string;
  rootCause: string;
  suggestedFix: string;
  confidence: number;
}

function App() {
  const [reports, setReports] = useState<DeploymentReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [rootCause, setRootCause] = useState<RootCauseInsight | null>(null);
  const [targetUrl, setTargetUrl] = useState('https://example.com');
  const [activeTab, setActiveTab] = useState('deployments');

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then(setReports)
      .catch(console.error);

    const ws = new WebSocket('ws://localhost:8081');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'test.triggered') {
        setReports(prev => [{
          id: crypto.randomUUID(),
          commitSha: data.correlationId.substring(0, 7),
          riskScore: 0.5,
          affectedFlows: data.flows || ['smoke-test'],
          createdAt: new Date().toISOString()
        }, ...prev]);
      }
    };
  }, []);

  const loadTestRuns = async (reportId: string) => {
    const runs = await fetch(`/api/reports/${reportId}`).then(r => r.json());
    setTestRuns(runs);
    setSelectedReport(reportId);
  };

  const loadRootCause = async (testRunId: string) => {
    const insight = await fetch(`/api/test-runs/${testRunId}/root-cause`).then(r => r.json());
    setRootCause(insight);
  };

  const triggerTest = () => {
    fetch('/api/trigger-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl, flows: ['smoke-test'] })
    });
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AI Synthetic Monitor</h1>
        <span className="badge">Kubernetes Ready</span>
      </header>

      <nav className="tabs">
        <button className={activeTab === 'deployments' ? 'active' : ''} onClick={() => setActiveTab('deployments')}>Deployments</button>
        <button className={activeTab === 'executions' ? 'active' : ''} onClick={() => setActiveTab('executions')}>Executions</button>
        <button className={activeTab === 'artifacts' ? 'active' : ''} onClick={() => setActiveTab('artifacts')}>Artifacts</button>
        <button className={activeTab === 'root-cause' ? 'active' : ''} onClick={() => setActiveTab('root-cause')}>Root Cause</button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>Settings</button>
      </nav>

      <main>
        {activeTab === 'deployments' && (
          <div className="grid">
            <section className="card">
              <h2>Recent Deployments</h2>
              {reports.map(r => (
                <div key={r.id} className="report-item" onClick={() => loadTestRuns(r.id)}>
                  <div className="report-header">
                    <span className="commit">{r.commitSha?.substring(0, 7)}</span>
                    <span className={`risk risk-${r.riskScore > 0.7 ? 'high' : r.riskScore > 0.4 ? 'medium' : 'low'}`}>
                      Risk: {(r.riskScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <small>Affected: {r.affectedFlows?.join(', ') || 'N/A'}</small>
                </div>
              ))}
            </section>

            <section className="card">
              <h2>Quick Actions</h2>
              <input
                type="text"
                placeholder="Target URL to test"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
              />
              <button onClick={triggerTest}>Trigger Synthetic Test</button>
            </section>
          </div>
        )}

        {activeTab === 'executions' && (
          <section className="card">
            <h2>Test Executions</h2>
            {testRuns.length === 0 ? (
              <p className="empty">Select a deployment to view test runs</p>
            ) : (
              testRuns.map(r => (
                <div key={r.id} className="test-run">
                  <span>{r.testId}</span>
                  <span className={`status ${r.status}`}>{r.status}</span>
                  <small>Duration: {r.durationMs ? `${r.durationMs}ms` : 'N/A'}</small>
                  {r.status === 'failed' && (
                    <button onClick={() => loadRootCause(r.id)}>View Root Cause</button>
                  )}
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === 'artifacts' && (
          <section className="card">
            <h2>Artifacts</h2>
            <p className="empty">Screenshots, videos, traces, and HAR files will appear here after execution</p>
          </section>
        )}

        {activeTab === 'root-cause' && (
          <section className="card">
            <h2>Root Cause Analysis</h2>
            {rootCause ? (
              <div className="root-cause">
                <p><strong>Summary:</strong> {rootCause.failureSummary}</p>
                <p><strong>Root Cause:</strong> {rootCause.rootCause}</p>
                <p><strong>Suggested Fix:</strong> {rootCause.suggestedFix}</p>
                <span className="confidence">Confidence: {(rootCause.confidence * 100).toFixed(0)}%</span>
              </div>
            ) : (
              <p className="empty">Select a failed test to view root cause analysis</p>
            )}
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="card">
            <h2>Monitoring Settings</h2>
            <input type="text" placeholder="Repository URL" />
            <select>
              <option value="master">master</option>
              <option value="main">main</option>
            </select>
            <button>Save Configuration</button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;