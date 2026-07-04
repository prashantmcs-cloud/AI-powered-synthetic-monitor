import { createAiTestSpec, type AiTestSpec } from '@ai-synthetic/shared-types';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

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

export function analyzeCommitChanges(comparison: GitHubCommitComparison): {
  affectedFlows: string[];
  riskScore: number;
  rationale: string;
} {
  const { currentCommit, previousCommit } = comparison;
  const changedFiles = currentCommit.files;
  
  const flows: string[] = [];
  const rationaleParts: string[] = [];
  
  const uiRelatedFiles = changedFiles.filter(f => 
    f.includes('component') || f.includes('page') || f.includes('.tsx') || f.includes('.jsx') || f.includes('.vue')
  );
  const apiRelatedFiles = changedFiles.filter(f => 
    f.includes('api') || f.includes('route') || f.includes('controller') || f.includes('service')
  );
  const authRelatedFiles = changedFiles.filter(f => 
    f.includes('auth') || f.includes('login') || f.includes('signin') || f.includes('middleware')
  );
  const checkoutRelatedFiles = changedFiles.filter(f => 
    f.includes('checkout') || f.includes('cart') || f.includes('payment') || f.includes('order')
  );
  
  if (authRelatedFiles.length > 0) {
    flows.push('login');
    rationaleParts.push(`${authRelatedFiles.length} authentication-related files changed`);
  }
  if (checkoutRelatedFiles.length > 0) {
    flows.push('checkout');
    rationaleParts.push(`${checkoutRelatedFiles.length} checkout/payment files changed`);
  }
  if (uiRelatedFiles.length > 0) {
    flows.push('dashboard');
    rationaleParts.push(`${uiRelatedFiles.length} UI component files changed`);
  }
  if (apiRelatedFiles.length > 0) {
    flows.push('api-health');
    rationaleParts.push(`${apiRelatedFiles.length} API endpoint files changed`);
  }
  
  if (flows.length === 0) {
    flows.push('smoke-test');
    rationaleParts.push('No specific flows identified, generating smoke tests');
  }
  
  const riskScore = Math.min(0.99, 0.3 + 
    (currentCommit.additions / 1000) * 0.1 + 
    (currentCommit.deletions / 1000) * 0.05 +
    (changedFiles.length > 20 ? 0.2 : 0.05)
  );
  
  const rationale = `Compared commit ${currentCommit.sha.substring(0, 7)} against ${previousCommit.sha.substring(0, 7)}. ${rationaleParts.join('. ')}.`;
  
  return { affectedFlows: flows, riskScore, rationale };
}

export function generatePlaywrightTests(
  comparison: GitHubCommitComparison,
  build: BuildComparison,
  affectedFlows: string[]
): { specFile: string; content: string }[] {
  const specs: { specFile: string; content: string }[] = [];
  const repoSlug = comparison.currentCommit.sha.substring(0, 7);
  
  for (const flow of affectedFlows) {
    const spec: AiTestSpec = createAiTestSpec({
      testId: `auto-${flow}-${repoSlug}`,
      specFile: `tests/generated/${repoSlug}-${flow}.spec.ts`,
      title: `Auto-generated ${flow} test`,
      description: `Generated for commit ${comparison.currentCommit.sha.substring(0, 7)} - ${comparison.currentCommit.message}`,
      steps: generateStepsForFlow(flow, build.bundleSize)
    });
    
    const content = generatePlaywrightSpecContent(spec);
    specs.push({ specFile: spec.specFile, content });
  }
  
  return specs;
}

function generateStepsForFlow(flow: string, bundleSize: number): Array<{ action: string; selector?: string; value?: string; url?: string }> {
  const baseSteps = [
    { action: 'goto', url: 'https://localhost:3000' },
    { action: 'waitForLoadState', value: 'networkidle' }
  ];
  
  switch (flow) {
    case 'login':
      return [
        ...baseSteps,
        { action: 'click', selector: '[data-testid="login-button"]' },
        { action: 'waitForSelector', selector: 'input[type="email"]' },
        { action: 'fill', selector: 'input[type="email"]', value: 'test@example.com' },
        { action: 'fill', selector: 'input[type="password"]', value: 'password123' },
        { action: 'click', selector: 'button[type="submit"]' },
        { action: 'waitForURL', value: '/dashboard' },
        { action: 'assertVisible', selector: '[data-testid="dashboard"]' }
      ];
    case 'checkout':
      return [
        ...baseSteps,
        { action: 'click', selector: '[data-testid="add-to-cart"]' },
        { action: 'click', selector: '[data-testid="cart-icon"]' },
        { action: 'click', selector: '[data-testid="checkout-button"]' },
        { action: 'waitForSelector', selector: 'input[name="card-number"]' },
        { action: 'fill', selector: 'input[name="card-number"]', value: '4242424242424242' },
        { action: 'click', selector: '[data-testid="complete-purchase"]' },
        { action: 'assertVisible', selector: '[data-testid="order-confirmation"]' }
      ];
    case 'dashboard':
      return [
        ...baseSteps,
        { action: 'waitForSelector', selector: '[data-testid="sidebar"]' },
        { action: 'assertVisible', selector: '[data-testid="main-content"]' },
        { action: 'assertVisible', selector: '[data-testid="user-avatar"]' },
        { action: 'takeScreenshot', value: 'dashboard-loaded' }
      ];
    case 'api-health':
      return [
        { action: 'apiRequest', url: '/api/health', value: 'GET' },
        { action: 'assertResponse', value: '200' },
        { action: 'assertJson', value: 'status:ok' }
      ];
    default:
      return [
        ...baseSteps,
        { action: 'assertVisible', selector: 'body' },
        { action: 'takeScreenshot', value: 'smoke-test' }
      ];
  }
}

function generatePlaywrightSpecContent(spec: AiTestSpec): string {
  let content = `import { test, expect } from '@playwright/test';

test.describe('${spec.title}', () => {
  test('${spec.description}', async ({ page }) => {
`;
  
  for (const step of spec.steps) {
    switch (step.action) {
      case 'goto':
        content += `    await page.goto('${step.url}');\n`;
        break;
      case 'click':
        content += `    await page.click('${step.selector}');\n`;
        break;
      case 'fill':
        content += `    await page.fill('${step.selector}', '${step.value}');\n`;
        break;
      case 'waitForSelector':
        content += `    await page.waitForSelector('${step.selector}');\n`;
        break;
      case 'waitForLoadState':
        content += `    await page.waitForLoadState('${step.value}');\n`;
        break;
      case 'waitForURL':
        content += `    await page.waitForURL('${step.value}');\n`;
        break;
      case 'assertVisible':
        content += `    await expect(page.locator('${step.selector}')).toBeVisible();\n`;
        break;
      case 'takeScreenshot':
        content += `    await page.screenshot({ path: 'screenshots/${step.value}.png' });\n`;
        break;
    }
  }
  
  content += `  });
});
`;
  
  return content;
}

export function writeSpecFiles(specs: { specFile: string; content: string }[]): void {
  for (const { specFile, content } of specs) {
    const fullPath = join(process.cwd(), specFile);
    mkdirSync(join(process.cwd(), 'tests', 'generated'), { recursive: true });
    writeFileSync(fullPath, content);
  }
}