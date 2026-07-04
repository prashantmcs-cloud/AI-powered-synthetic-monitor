export interface PlatformConfig {
  github: {
    token: string;
    webhookSecret: string;
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  playwright: {
    headless: boolean;
    timeout: number;
    artifactsDir: string;
  };
  server: {
    port: number;
    corsOrigin: string;
  };
}

export const config: PlatformConfig = {
  github: {
    token: process.env.GITHUB_TOKEN || '',
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || 'default-secret'
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_synthetic'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  playwright: {
    headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
    timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT || '30000'),
    artifactsDir: process.env.ARTIFACTS_DIR || '/artifacts'
  },
  server: {
    port: parseInt(process.env.PORT || '8080'),
    corsOrigin: process.env.CORS_ORIGIN || '*'
  }
};

export default config;