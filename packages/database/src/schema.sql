CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS commits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository TEXT NOT NULL,
  branch TEXT NOT NULL,
  commit_sha TEXT NOT NULL,
  previous_commit_sha TEXT,
  author TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commit_id UUID REFERENCES commits(id),
  build_id TEXT NOT NULL,
  previous_build_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  bundle_size INTEGER NOT NULL,
  dependency_delta TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deployment_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commit_sha TEXT NOT NULL,
  previous_commit_sha TEXT,
  build_id TEXT NOT NULL,
  previous_build_id TEXT,
  risk_score NUMERIC(3,2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 1),
  affected_flows TEXT[],
  rationale TEXT NOT NULL,
  generated_spec_files TEXT[],
  correlation_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES deployment_reports(id),
  test_id TEXT NOT NULL,
  spec_file TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'passed', 'failed', 'skipped')),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_ms INTEGER
);

CREATE TABLE IF NOT EXISTS test_artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_id UUID REFERENCES test_runs(id),
  type TEXT NOT NULL CHECK (type IN ('screenshot', 'video', 'trace', 'har')),
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS root_cause_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_id UUID REFERENCES test_runs(id),
  failure_summary TEXT NOT NULL,
  root_cause TEXT NOT NULL,
  suggested_fix TEXT NOT NULL,
  confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  related_commit TEXT,
  evidence_refs TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monitoring_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository TEXT NOT NULL,
  branch TEXT NOT NULL,
  target_url TEXT NOT NULL,
  test_flows TEXT[],
  schedule TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);