import { vi } from 'vitest';

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Generate a random date between two dates
 */
export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Pick a random item from an array
 */
export function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Generate mock threat data
 */
export function createMockThreat(overrides?: Partial<any>) {
  return {
    id: generateId(),
    name: `Threat ${Math.random().toString(36).substring(7)}`,
    description: 'Mock threat description',
    severity: randomItem(['low', 'medium', 'high', 'critical']),
    status: randomItem(['active', 'mitigated', 'resolved', 'investigating']),
    category: randomItem(['malware', 'phishing', 'ransomware', 'apt', 'ddos']),
    firstSeen: randomDate(new Date(2024, 0, 1), new Date()),
    lastSeen: new Date(),
    indicators: [],
    affectedAssets: [],
    mitigationSteps: [],
    confidence: Math.floor(Math.random() * 100),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Generate mock case data
 */
export function createMockCase(overrides?: Partial<any>) {
  return {
    id: generateId(),
    title: `Case ${Math.random().toString(36).substring(7)}`,
    description: 'Mock case description',
    status: randomItem(['open', 'investigating', 'resolved', 'closed']),
    priority: randomItem(['low', 'medium', 'high', 'critical']),
    assignedTo: 'analyst-' + generateId(),
    category: randomItem(['incident', 'investigation', 'alert', 'threat']),
    createdAt: new Date(),
    updatedAt: new Date(),
    resolvedAt: null,
    evidence: [],
    relatedThreats: [],
    tags: [],
    ...overrides,
  };
}

/**
 * Generate mock actor data
 */
export function createMockActor(overrides?: Partial<any>) {
  return {
    id: generateId(),
    name: `Actor ${Math.random().toString(36).substring(7)}`,
    aliases: [],
    type: randomItem(['nation-state', 'cybercriminal', 'hacktivist', 'insider']),
    sophistication: randomItem(['low', 'medium', 'high', 'advanced']),
    motivation: randomItem(['financial', 'espionage', 'disruption', 'ideology']),
    origin: randomItem(['CN', 'RU', 'KP', 'IR', 'US', 'Unknown']),
    firstSeen: randomDate(new Date(2020, 0, 1), new Date()),
    lastActivity: new Date(),
    knownTTP: [],
    associatedCampaigns: [],
    targetSectors: [],
    active: true,
    ...overrides,
  };
}

/**
 * Generate mock user data
 */
export function createMockUser(overrides?: Partial<any>) {
  return {
    id: generateId(),
    username: `user${Math.random().toString(36).substring(7)}`,
    email: `user${Math.random().toString(36).substring(7)}@example.com`,
    role: randomItem(['admin', 'analyst', 'investigator', 'viewer']),
    firstName: 'John',
    lastName: 'Doe',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
    permissions: [],
    ...overrides,
  };
}

/**
 * Generate mock asset data
 */
export function createMockAsset(overrides?: Partial<any>) {
  return {
    id: generateId(),
    name: `Asset ${Math.random().toString(36).substring(7)}`,
    type: randomItem(['server', 'workstation', 'network', 'application', 'database']),
    criticality: randomItem(['low', 'medium', 'high', 'critical']),
    ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    status: randomItem(['active', 'inactive', 'compromised', 'investigating']),
    owner: 'IT Department',
    location: 'Data Center',
    lastScanned: new Date(),
    vulnerabilities: [],
    ...overrides,
  };
}

/**
 * Generate mock vulnerability data
 */
export function createMockVulnerability(overrides?: Partial<any>) {
  return {
    id: generateId(),
    cveId: `CVE-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
    title: `Vulnerability ${Math.random().toString(36).substring(7)}`,
    description: 'Mock vulnerability description',
    severity: randomItem(['low', 'medium', 'high', 'critical']),
    cvssScore: Math.random() * 10,
    affectedProducts: [],
    patchAvailable: Math.random() > 0.5,
    exploitAvailable: Math.random() > 0.7,
    publishedDate: randomDate(new Date(2024, 0, 1), new Date()),
    discoveredDate: new Date(),
    ...overrides,
  };
}

/**
 * Generate mock campaign data
 */
export function createMockCampaign(overrides?: Partial<any>) {
  return {
    id: generateId(),
    name: `Campaign ${Math.random().toString(36).substring(7)}`,
    description: 'Mock campaign description',
    status: randomItem(['active', 'dormant', 'concluded']),
    attribution: randomItem(['APT28', 'APT29', 'Lazarus', 'FIN7', 'Unknown']),
    startDate: randomDate(new Date(2024, 0, 1), new Date()),
    endDate: null,
    targetSectors: [],
    targetRegions: [],
    ttp: [],
    relatedActors: [],
    ...overrides,
  };
}

/**
 * Generate mock indicator data
 */
export function createMockIndicator(overrides?: Partial<any>) {
  return {
    id: generateId(),
    type: randomItem(['ip', 'domain', 'url', 'hash', 'email', 'file']),
    value: `indicator-${Math.random().toString(36).substring(7)}`,
    confidence: Math.floor(Math.random() * 100),
    severity: randomItem(['low', 'medium', 'high', 'critical']),
    firstSeen: randomDate(new Date(2024, 0, 1), new Date()),
    lastSeen: new Date(),
    tags: [],
    sources: [],
    relatedThreats: [],
    ...overrides,
  };
}

/**
 * Generate mock alert data
 */
export function createMockAlert(overrides?: Partial<any>) {
  return {
    id: generateId(),
    title: `Alert ${Math.random().toString(36).substring(7)}`,
    description: 'Mock alert description',
    severity: randomItem(['low', 'medium', 'high', 'critical']),
    status: randomItem(['new', 'acknowledged', 'investigating', 'resolved', 'false-positive']),
    source: randomItem(['SIEM', 'IDS', 'EDR', 'Manual', 'Automated']),
    timestamp: new Date(),
    acknowledgedBy: null,
    resolvedBy: null,
    relatedCase: null,
    ...overrides,
  };
}

/**
 * Generate an array of mock data
 */
export function generateMockArray<T>(
  generator: (overrides?: Partial<T>) => T,
  count: number,
  overrides?: Partial<T>
): T[] {
  return Array.from({ length: count }, () => generator(overrides));
}

/**
 * Create mock pagination data
 */
export function createMockPagination(total: number, page = 1, limit = 10) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  };
}

/**
 * Create mock API response with pagination
 */
export function createMockPaginatedResponse<T>(
  data: T[],
  page = 1,
  limit = 10
) {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = data.slice(start, end);

  return {
    data: paginatedData,
    pagination: createMockPagination(data.length, page, limit),
  };
}
