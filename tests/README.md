# SENTINEL Cyber Intelligence Platform - Testing Infrastructure

## Overview

This directory contains comprehensive testing infrastructure for the SENTINEL Cyber Intelligence Platform, including unit tests, integration tests, E2E tests, test fixtures, and testing utilities.

## Directory Structure

```
tests/
├── setup.ts                    # Frontend test setup (Vitest/Jest)
├── setup.backend.ts            # Backend test setup (Jest)
├── utils/                      # Testing utilities
│   ├── testUtils.tsx          # React testing utilities
│   ├── mockData.ts            # Mock data generators
│   └── apiMocks.ts            # API mocking with MSW
├── fixtures/                   # Comprehensive test data
│   ├── threats.fixtures.ts    # 55+ threat scenarios
│   ├── cases.fixtures.ts      # 30+ case scenarios
│   ├── actors.fixtures.ts     # 20+ threat actor profiles
│   └── users.fixtures.ts      # 20+ user fixtures (all roles)
├── unit/                       # Unit tests
│   ├── services/              # Service layer tests
│   │   ├── threat.service.test.ts
│   │   ├── case.service.test.ts
│   │   ├── auth.service.test.ts
│   │   └── dashboard.service.test.ts
│   └── hooks/                 # React hooks tests
│       └── useAsync.test.tsx
├── integration/                # Integration tests
│   └── api/                   # API integration tests
│       ├── threat.api.test.ts
│       ├── case.api.test.ts
│       ├── auth.api.test.ts
│       └── graphql.api.test.ts
└── e2e/                        # End-to-end tests
    ├── auth.spec.ts
    ├── dashboard.spec.ts
    ├── threats.spec.ts
    └── cases.spec.ts
```

## Test Fixtures

### Threats Fixtures
- **Location**: `tests/fixtures/threats.fixtures.ts`
- **Count**: 55+ diverse threat scenarios
- **Categories**: APT, Ransomware, Malware, Phishing, DDoS, Supply Chain, Zero-Day, Insider Threats, Cryptojacking, IoT, Mobile, Web Attacks, and more
- **Features**:
  - Complete threat metadata (severity, status, category, attribution)
  - Indicators of Compromise (IOCs)
  - MITRE ATT&CK TTPs
  - Mitigation steps
  - Related campaigns and actors
  - Real-world inspired scenarios

### Cases Fixtures
- **Location**: `tests/fixtures/cases.fixtures.ts`
- **Count**: 30+ diverse case scenarios
- **Types**: Incidents, Investigations, Alerts
- **Features**:
  - Case numbers (INC-*, INV-*, ALT-*)
  - Complete case lifecycle (open → investigating → resolved)
  - Evidence tracking
  - Timeline events
  - Related threats and assets
  - Impact metrics

### Actors Fixtures
- **Location**: `tests/fixtures/actors.fixtures.ts`
- **Count**: 20+ threat actor profiles
- **Types**: Nation-State, Cybercriminal, Hacktivist, Insider
- **Features**:
  - Real-world APT groups (APT28, APT29, Lazarus, etc.)
  - Ransomware gangs (LockBit, REvil, BlackCat, etc.)
  - Known malware and campaigns
  - Target sectors and regions
  - Sophistication levels

### Users Fixtures
- **Location**: `tests/fixtures/users.fixtures.ts`
- **Count**: 20+ user accounts
- **Roles**: Admin, Analyst, Investigator, Viewer, System
- **Features**:
  - Complete user profiles
  - Role-based permissions
  - Team accounts
  - Service accounts
  - Inactive/suspended accounts
  - Preferences and settings

## Running Tests

### Frontend Tests

```bash
# Run all tests with Jest
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run Vitest tests
npm run test:vitest

# Run Vitest with UI
npm run test:vitest:ui

# Run Vitest with coverage
npm run test:vitest:coverage
```

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Debug mode
npx playwright test --debug
```

### Run All Tests

```bash
npm run test:all
```

## Test Coverage

### Coverage Thresholds

Both frontend and backend maintain minimum coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Viewing Coverage Reports

After running tests with coverage:

```bash
# Frontend coverage
open coverage/index.html

# Backend coverage
open coverage/backend/index.html
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockApiClient, createApiResponse } from '../utils/apiMocks';

describe('MyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: '1', name: 'Test' };
    mockApiClient.get.mockResolvedValue(createApiResponse(mockData));

    const result = await myService.getData('1');

    expect(result).toEqual(mockData);
    expect(mockApiClient.get).toHaveBeenCalledWith('/api/data/1');
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startMockServer, stopMockServer } from '../utils/apiMocks';

describe('API Integration', () => {
  beforeAll(() => startMockServer());
  afterAll(() => stopMockServer());

  it('should handle API requests', async () => {
    const response = await fetch('http://localhost:3001/api/threats');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.threats).toBeDefined();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should complete user flow', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('username').fill('admin');
  await page.getByLabel('password').fill('password');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL('/dashboard');
});
```

## Test Utilities

### testUtils.tsx
- `renderWithProviders()` - Render React components with providers
- `createMockResponse()` - Create mock API responses
- `createMockError()` - Create mock API errors
- `mockFetchResponse()` - Mock global fetch
- `waitForAsync()` - Wait for async operations

### mockData.ts
- `createMockThreat()` - Generate threat data
- `createMockCase()` - Generate case data
- `createMockActor()` - Generate actor data
- `createMockUser()` - Generate user data
- `generateMockArray()` - Generate arrays of mock data
- `createMockPaginatedResponse()` - Create paginated responses

### apiMocks.ts
- MSW (Mock Service Worker) setup
- Request handlers for all API endpoints
- `startMockServer()` - Start mock API server
- `stopMockServer()` - Stop mock API server
- `resetMockServer()` - Reset handlers between tests
- `mockGraphQLResponse()` - Mock GraphQL responses

## Best Practices

1. **Test Organization**
   - Group related tests with `describe` blocks
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Mocking**
   - Use MSW for API mocking
   - Clear mocks between tests
   - Mock external dependencies

3. **Fixtures**
   - Use test fixtures for consistent data
   - Keep fixtures realistic and comprehensive
   - Update fixtures when models change

4. **Coverage**
   - Aim for meaningful coverage, not just high percentages
   - Test edge cases and error paths
   - Focus on business logic and critical paths

5. **E2E Tests**
   - Test user flows, not implementation details
   - Use data-testid attributes for stable selectors
   - Keep E2E tests focused and fast

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm install
    npm run test:coverage
    npm run test:e2e
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in config
   - Check for unresolved promises
   - Verify mock responses

2. **Flaky E2E tests**
   - Use proper waiting strategies
   - Avoid hardcoded delays
   - Check for race conditions

3. **Coverage not meeting thresholds**
   - Identify uncovered code with coverage report
   - Add tests for critical paths
   - Remove or justify coverage exceptions

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)

## Support

For questions or issues with the testing infrastructure, contact the DevSecOps team or create a GitHub issue.
