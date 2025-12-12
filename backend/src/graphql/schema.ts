
import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  # Custom Scalars
  scalar DateTime
  scalar JSON
  scalar UUID

  # ============================================
  # ENUMS
  # ============================================

  enum ThreatSeverity {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum ThreatStatus {
    NEW
    INVESTIGATING
    CONTAINED
    CLOSED
  }

  enum CasePriority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum CaseStatus {
    OPEN
    IN_PROGRESS
    RESOLVED
    CLOSED
  }

  enum UserRole {
    ADMIN
    ANALYST
    VIEWER
  }

  enum Clearance {
    TS
    SECRET
    UNCLASSIFIED
  }

  enum AssetStatus {
    ACTIVE
    INACTIVE
    RETIRED
    COMPROMISED
  }

  enum AssetCriticality {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  enum VulnerabilityStatus {
    OPEN
    PATCHED
    MITIGATED
    ACCEPTED
  }

  enum FeedStatus {
    ACTIVE
    INACTIVE
    ERROR
  }

  enum ReportType {
    INCIDENT
    INTELLIGENCE
    ANALYSIS
    EXECUTIVE
  }

  enum ReportStatus {
    DRAFT
    REVIEW
    PUBLISHED
    ARCHIVED
  }

  enum PlaybookStatus {
    ACTIVE
    INACTIVE
    DEPRECATED
  }

  enum ArtifactType {
    FILE
    LOG
    PCAP
    MEMORY_DUMP
    DISK_IMAGE
  }

  enum ArtifactStatus {
    PENDING
    ANALYZING
    COMPLETE
    QUARANTINED
  }

  enum IntegrationStatus {
    ACTIVE
    INACTIVE
    ERROR
  }

  enum ChannelType {
    PUBLIC
    PRIVATE
    DIRECT
  }

  enum MessageType {
    TEXT
    ALERT
    SYSTEM
  }

  enum SortOrder {
    ASC
    DESC
  }

  # ============================================
  # PAGINATION TYPES
  # ============================================

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
    totalCount: Int!
  }

  # ============================================
  # INTELLIGENCE TYPES
  # ============================================

  type Threat {
    id: ID!
    indicator: String!
    type: String!
    severity: ThreatSeverity!
    source: String
    status: ThreatStatus
    score: Int
    last_seen: DateTime
    description: String
    confidence: Int
    region: String
    threat_actor: String
    reputation: Int
    tags: [String!]
    tlp: String
    sanctioned: Boolean
    ml_retrain: Boolean
    origin: String

    # Relationships
    cases: [Case!]
    campaigns: [Campaign!]
  }

  type ThreatEdge {
    node: Threat!
    cursor: String!
  }

  type ThreatConnection {
    edges: [ThreatEdge!]!
    pageInfo: PageInfo!
  }

  type Case {
    id: ID!
    title: String!
    description: String
    priority: CasePriority
    status: CaseStatus
    assignee: String
    created_by: String
    agency: String
    related_threat_ids: [String!]
    shared_with: [String!]
    sla_breach: Boolean
    timeline: JSON
    tasks: JSON
    created_at: DateTime
    updated_at: DateTime

    # Relationships
    threats: [Threat!]
    artifacts: [Artifact!]
    reports: [Report!]
    assigneeUser: User
  }

  type CaseEdge {
    node: Case!
    cursor: String!
  }

  type CaseConnection {
    edges: [CaseEdge!]!
    pageInfo: PageInfo!
  }

  type Actor {
    id: ID!
    name: String!
    origin: String
    description: String
    sophistication: String
    targets: [String!]
    aliases: [String!]
    evasion_techniques: [String!]
    history: JSON
    exploits: [String!]
    created_at: DateTime
    updated_at: DateTime

    # Relationships
    campaigns: [Campaign!]
    reports: [Report!]
  }

  type ActorEdge {
    node: Actor!
    cursor: String!
  }

  type ActorConnection {
    edges: [ActorEdge!]!
    pageInfo: PageInfo!
  }

  type Campaign {
    id: ID!
    name: String!
    description: String
    status: String
    objective: String
    actors: [String!]
    target_sectors: [String!]
    target_regions: [String!]
    threat_ids: [String!]
    ttps: [String!]
    first_seen: DateTime
    last_seen: DateTime
    created_at: DateTime
    updated_at: DateTime

    # Relationships
    actorDetails: [Actor!]
    threats: [Threat!]
  }

  type CampaignEdge {
    node: Campaign!
    cursor: String!
  }

  type CampaignConnection {
    edges: [CampaignEdge!]!
    pageInfo: PageInfo!
  }

  # ============================================
  # INFRASTRUCTURE TYPES
  # ============================================

  type Asset {
    id: ID!
    name: String!
    type: String!
    ip_address: String
    status: AssetStatus
    criticality: AssetCriticality
    owner: String
    last_seen: DateTime
    load: Int
    latency: Int
    security_controls: [String!]
    data_sensitivity: String
    data_volume_gb: Float

    # Relationships
    vulnerabilities: [Vulnerability!]
    ownerUser: User
  }

  type AssetEdge {
    node: Asset!
    cursor: String!
  }

  type AssetConnection {
    edges: [AssetEdge!]!
    pageInfo: PageInfo!
  }

  type Vulnerability {
    id: ID!
    name: String!
    score: Float!
    status: VulnerabilityStatus
    vendor: String
    vectors: String
    zero_day: Boolean
    exploited: Boolean
    affected_assets: [String!]
    kill_chain_ready: Boolean

    # Relationships
    assets: [Asset!]
  }

  type VulnerabilityEdge {
    node: Vulnerability!
    cursor: String!
  }

  type VulnerabilityConnection {
    edges: [VulnerabilityEdge!]!
    pageInfo: PageInfo!
  }

  type Feed {
    id: ID!
    name: String!
    url: String!
    type: String!
    status: FeedStatus
    interval_min: Int
    last_sync: DateTime
    configuration: JSON
    error_count: Int
  }

  type FeedEdge {
    node: Feed!
    cursor: String!
  }

  type FeedConnection {
    edges: [FeedEdge!]!
    pageInfo: PageInfo!
  }

  type Vendor {
    id: ID!
    name: String!
    product: String
    tier: String
    category: String
    risk_score: Int
    hq_location: String
    subcontractors: [String!]
    compliance: JSON
    access: JSON
    sbom: JSON
  }

  type VendorEdge {
    node: Vendor!
    cursor: String!
  }

  type VendorConnection {
    edges: [VendorEdge!]!
    pageInfo: PageInfo!
  }

  # ============================================
  # OPERATIONS TYPES
  # ============================================

  type AuditLog {
    id: ID!
    user_id: String
    action: String!
    details: String
    resource_id: String
    ip_address: String
    timestamp: DateTime

    # Relationships
    user: User
  }

  type AuditLogEdge {
    node: AuditLog!
    cursor: String!
  }

  type AuditLogConnection {
    edges: [AuditLogEdge!]!
    pageInfo: PageInfo!
  }

  type Report {
    id: ID!
    title: String!
    type: ReportType
    author: String
    status: ReportStatus
    content: String
    related_case_id: String
    related_actor_id: String
    date: DateTime

    # Relationships
    case: Case
    actor: Actor
    authorUser: User
  }

  type ReportEdge {
    node: Report!
    cursor: String!
  }

  type ReportConnection {
    edges: [ReportEdge!]!
    pageInfo: PageInfo!
  }

  type Playbook {
    id: ID!
    name: String!
    description: String
    tasks: [String!]
    trigger_label: String
    status: PlaybookStatus
    usage_count: Int
    skip_count: Int
    risk_level: String
  }

  type PlaybookEdge {
    node: Playbook!
    cursor: String!
  }

  type PlaybookConnection {
    edges: [PlaybookEdge!]!
    pageInfo: PageInfo!
  }

  type Artifact {
    id: ID!
    name: String!
    type: ArtifactType
    hash: String
    original_hash: String
    size: String
    uploaded_by: String
    upload_date: DateTime
    status: ArtifactStatus
    case_id: String

    # Relationships
    case: Case
    chainEvents: [ChainEvent!]
    uploader: User
  }

  type ArtifactEdge {
    node: Artifact!
    cursor: String!
  }

  type ArtifactConnection {
    edges: [ArtifactEdge!]!
    pageInfo: PageInfo!
  }

  type ChainEvent {
    id: ID!
    artifact_id: String!
    artifact_name: String
    action: String!
    user_id: String
    timestamp: DateTime
    notes: String

    # Relationships
    artifact: Artifact
    user: User
  }

  type ChainEventEdge {
    node: ChainEvent!
    cursor: String!
  }

  type ChainEventConnection {
    edges: [ChainEventEdge!]!
    pageInfo: PageInfo!
  }

  # ============================================
  # SYSTEM TYPES
  # ============================================

  type User {
    id: ID!
    username: String!
    role_id: String
    organization_id: String
    clearance: Clearance
    status: String
    email: String
    is_vip: Boolean
    ad_sid: String
    last_login: DateTime
    created_at: DateTime
    updated_at: DateTime

    # Relationships
    role: Role
    organization: Organization
    assignedCases: [Case!]
    auditLogs: [AuditLog!]
  }

  type UserEdge {
    node: User!
    cursor: String!
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
  }

  type Role {
    id: ID!
    name: String!
    description: String
    parent_role_id: String
    ad_group_mapping: String
    created_at: DateTime
    updated_at: DateTime

    # Relationships
    permissions: [Permission!]
    users: [User!]
    parentRole: Role
  }

  type RoleEdge {
    node: Role!
    cursor: String!
  }

  type RoleConnection {
    edges: [RoleEdge!]!
    pageInfo: PageInfo!
  }

  type Permission {
    id: ID!
    resource: String!
    action: String!
    description: String

    # Relationships
    roles: [Role!]
  }

  type PermissionEdge {
    node: Permission!
    cursor: String!
  }

  type PermissionConnection {
    edges: [PermissionEdge!]!
    pageInfo: PageInfo!
  }

  type Organization {
    id: ID!
    name: String!
    parent_id: String
    path: String

    # Relationships
    users: [User!]
    parentOrganization: Organization
    childOrganizations: [Organization!]
  }

  type OrganizationEdge {
    node: Organization!
    cursor: String!
  }

  type OrganizationConnection {
    edges: [OrganizationEdge!]!
    pageInfo: PageInfo!
  }

  type Integration {
    id: ID!
    name: String!
    type: String!
    url: String
    api_key: String
    status: IntegrationStatus
    last_sync: DateTime
  }

  type IntegrationEdge {
    node: Integration!
    cursor: String!
  }

  type IntegrationConnection {
    edges: [IntegrationEdge!]!
    pageInfo: PageInfo!
  }

  type Channel {
    id: ID!
    name: String!
    type: ChannelType
    topic: String
    members: [String!]
    created_by: String

    # Relationships
    messages: [Message!]
    creator: User
  }

  type ChannelEdge {
    node: Channel!
    cursor: String!
  }

  type ChannelConnection {
    edges: [ChannelEdge!]!
    pageInfo: PageInfo!
  }

  type Message {
    id: ID!
    channel_id: String!
    user_id: String
    content: String!
    type: MessageType
    created_at: DateTime
    updated_at: DateTime

    # Relationships
    channel: Channel
    user: User
  }

  type MessageEdge {
    node: Message!
    cursor: String!
  }

  type MessageConnection {
    edges: [MessageEdge!]!
    pageInfo: PageInfo!
  }

  # ============================================
  # INPUT TYPES
  # ============================================

  # Intelligence Inputs
  input ThreatInput {
    indicator: String!
    type: String!
    severity: ThreatSeverity!
    source: String
    score: Int
    description: String
    confidence: Int
    region: String
    threat_actor: String
    tags: [String!]
    tlp: String
  }

  input ThreatFilterInput {
    severity: ThreatSeverity
    status: ThreatStatus
    type: String
    source: String
    threat_actor: String
    min_score: Int
    max_score: Int
    tags: [String!]
  }

  input CaseInput {
    title: String!
    description: String
    priority: CasePriority
    assignee: String
    agency: String
    related_threat_ids: [String!]
  }

  input CaseFilterInput {
    status: CaseStatus
    priority: CasePriority
    assignee: String
    agency: String
    sla_breach: Boolean
  }

  input ActorInput {
    name: String!
    origin: String
    description: String
    sophistication: String
    targets: [String!]
    aliases: [String!]
    evasion_techniques: [String!]
  }

  input ActorFilterInput {
    origin: String
    sophistication: String
    name: String
  }

  input CampaignInput {
    name: String!
    description: String
    status: String
    objective: String
    actors: [String!]
    target_sectors: [String!]
    target_regions: [String!]
    threat_ids: [String!]
    ttps: [String!]
  }

  input CampaignFilterInput {
    status: String
    target_sector: String
    target_region: String
  }

  # Infrastructure Inputs
  input AssetInput {
    name: String!
    type: String!
    ip_address: String
    status: AssetStatus
    criticality: AssetCriticality
    owner: String
    security_controls: [String!]
    data_sensitivity: String
  }

  input AssetFilterInput {
    status: AssetStatus
    criticality: AssetCriticality
    type: String
    owner: String
  }

  input VulnerabilityInput {
    id: String!
    name: String!
    score: Float!
    status: VulnerabilityStatus
    vendor: String
    vectors: String
    zero_day: Boolean
    affected_assets: [String!]
  }

  input VulnerabilityFilterInput {
    status: VulnerabilityStatus
    zero_day: Boolean
    exploited: Boolean
    min_score: Float
    vendor: String
  }

  input FeedInput {
    name: String!
    url: String!
    type: String!
    status: FeedStatus
    interval_min: Int
    configuration: JSON
  }

  input FeedFilterInput {
    status: FeedStatus
    type: String
  }

  input VendorInput {
    name: String!
    product: String
    tier: String
    category: String
    hq_location: String
    subcontractors: [String!]
  }

  input VendorFilterInput {
    tier: String
    category: String
    min_risk_score: Int
    max_risk_score: Int
  }

  # Operations Inputs
  input ReportInput {
    title: String!
    type: ReportType!
    author: String
    content: String
    related_case_id: String
    related_actor_id: String
  }

  input ReportFilterInput {
    type: ReportType
    status: ReportStatus
    author: String
  }

  input PlaybookInput {
    name: String!
    description: String
    tasks: [String!]
    trigger_label: String
    risk_level: String
  }

  input PlaybookFilterInput {
    status: PlaybookStatus
    risk_level: String
  }

  input ArtifactInput {
    name: String!
    type: ArtifactType!
    hash: String
    size: String
    case_id: String
  }

  input ArtifactFilterInput {
    type: ArtifactType
    status: ArtifactStatus
    case_id: String
  }

  input ChainEventInput {
    artifact_id: String!
    action: String!
    notes: String
  }

  # System Inputs
  input UserInput {
    username: String!
    role_id: String!
    organization_id: String
    clearance: Clearance!
    email: String!
    status: String
  }

  input UserFilterInput {
    role_id: String
    organization_id: String
    clearance: Clearance
    status: String
    is_vip: Boolean
  }

  input RoleInput {
    name: String!
    description: String
    parent_role_id: String
    ad_group_mapping: String
  }

  input PermissionInput {
    resource: String!
    action: String!
    description: String
  }

  input OrganizationInput {
    name: String!
    parent_id: String
  }

  input IntegrationInput {
    name: String!
    type: String!
    url: String
    api_key: String
    status: IntegrationStatus
  }

  input IntegrationFilterInput {
    type: String
    status: IntegrationStatus
  }

  input ChannelInput {
    name: String!
    type: ChannelType!
    topic: String
    members: [String!]
  }

  input MessageInput {
    channel_id: String!
    content: String!
    type: MessageType
  }

  # ============================================
  # QUERY TYPE
  # ============================================

  type Query {
    # Intelligence Queries
    threats(
      filter: ThreatFilterInput
      limit: Int
      offset: Int
      sortBy: String
      sortOrder: SortOrder
    ): ThreatConnection!

    threat(id: ID!): Threat

    cases(
      filter: CaseFilterInput
      limit: Int
      offset: Int
      sortBy: String
      sortOrder: SortOrder
    ): CaseConnection!

    case(id: ID!): Case

    actors(
      filter: ActorFilterInput
      limit: Int
      offset: Int
      sortBy: String
      sortOrder: SortOrder
    ): ActorConnection!

    actor(id: ID!): Actor

    campaigns(
      filter: CampaignFilterInput
      limit: Int
      offset: Int
      sortBy: String
      sortOrder: SortOrder
    ): CampaignConnection!

    campaign(id: ID!): Campaign

    # Infrastructure Queries
    assets(
      filter: AssetFilterInput
      limit: Int
      offset: Int
      sortBy: String
      sortOrder: SortOrder
    ): AssetConnection!

    asset(id: ID!): Asset

    vulnerabilities(
      filter: VulnerabilityFilterInput
      limit: Int
      offset: Int
      sortBy: String
      sortOrder: SortOrder
    ): VulnerabilityConnection!

    vulnerability(id: ID!): Vulnerability

    feeds(
      filter: FeedFilterInput
      limit: Int
      offset: Int
    ): FeedConnection!

    feed(id: ID!): Feed

    vendors(
      filter: VendorFilterInput
      limit: Int
      offset: Int
      sortBy: String
      sortOrder: SortOrder
    ): VendorConnection!

    vendor(id: ID!): Vendor

    # Operations Queries
    auditLogs(
      limit: Int
      offset: Int
      user_id: String
      action: String
    ): AuditLogConnection!

    auditLog(id: ID!): AuditLog

    reports(
      filter: ReportFilterInput
      limit: Int
      offset: Int
      sortBy: String
      sortOrder: SortOrder
    ): ReportConnection!

    report(id: ID!): Report

    playbooks(
      filter: PlaybookFilterInput
      limit: Int
      offset: Int
    ): PlaybookConnection!

    playbook(id: ID!): Playbook

    artifacts(
      filter: ArtifactFilterInput
      limit: Int
      offset: Int
    ): ArtifactConnection!

    artifact(id: ID!): Artifact

    chainEvents(
      artifact_id: String
      limit: Int
      offset: Int
    ): ChainEventConnection!

    chainEvent(id: ID!): ChainEvent

    # System Queries
    users(
      filter: UserFilterInput
      limit: Int
      offset: Int
      sortBy: String
      sortOrder: SortOrder
    ): UserConnection!

    user(id: ID!): User

    me: User

    roles(
      limit: Int
      offset: Int
    ): RoleConnection!

    role(id: ID!): Role

    permissions(
      limit: Int
      offset: Int
    ): PermissionConnection!

    permission(id: ID!): Permission

    organizations(
      limit: Int
      offset: Int
    ): OrganizationConnection!

    organization(id: ID!): Organization

    integrations(
      filter: IntegrationFilterInput
      limit: Int
      offset: Int
    ): IntegrationConnection!

    integration(id: ID!): Integration

    channels(
      limit: Int
      offset: Int
    ): ChannelConnection!

    channel(id: ID!): Channel

    messages(
      channel_id: String!
      limit: Int
      offset: Int
    ): MessageConnection!

    message(id: ID!): Message

    # Analytics & Dashboard Queries
    dashboardStats: DashboardStats
    threatTrends(days: Int): [TrendData!]
    caseMetrics: CaseMetrics
  }

  # ============================================
  # MUTATION TYPE
  # ============================================

  type Mutation {
    # Intelligence Mutations
    createThreat(input: ThreatInput!): Threat
    updateThreat(id: ID!, input: ThreatInput!): Threat
    updateThreatStatus(id: ID!, status: ThreatStatus!): Threat
    deleteThreat(id: ID!): Boolean

    createCase(input: CaseInput!): Case
    updateCase(id: ID!, input: CaseInput!): Case
    updateCaseStatus(id: ID!, status: CaseStatus!): Case
    deleteCase(id: ID!): Boolean
    assignCase(id: ID!, assignee: String!): Case

    createActor(input: ActorInput!): Actor
    updateActor(id: ID!, input: ActorInput!): Actor
    deleteActor(id: ID!): Boolean

    createCampaign(input: CampaignInput!): Campaign
    updateCampaign(id: ID!, input: CampaignInput!): Campaign
    deleteCampaign(id: ID!): Boolean

    # Infrastructure Mutations
    createAsset(input: AssetInput!): Asset
    updateAsset(id: ID!, input: AssetInput!): Asset
    deleteAsset(id: ID!): Boolean

    createVulnerability(input: VulnerabilityInput!): Vulnerability
    updateVulnerability(id: ID!, input: VulnerabilityInput!): Vulnerability
    deleteVulnerability(id: ID!): Boolean

    createFeed(input: FeedInput!): Feed
    updateFeed(id: ID!, input: FeedInput!): Feed
    deleteFeed(id: ID!): Boolean
    syncFeed(id: ID!): Feed

    createVendor(input: VendorInput!): Vendor
    updateVendor(id: ID!, input: VendorInput!): Vendor
    deleteVendor(id: ID!): Boolean

    # Operations Mutations
    createReport(input: ReportInput!): Report
    updateReport(id: ID!, input: ReportInput!): Report
    publishReport(id: ID!): Report
    deleteReport(id: ID!): Boolean

    createPlaybook(input: PlaybookInput!): Playbook
    updatePlaybook(id: ID!, input: PlaybookInput!): Playbook
    executePlaybook(id: ID!, context: JSON): JSON
    deletePlaybook(id: ID!): Boolean

    createArtifact(input: ArtifactInput!): Artifact
    updateArtifact(id: ID!, input: ArtifactInput!): Artifact
    deleteArtifact(id: ID!): Boolean

    createChainEvent(input: ChainEventInput!): ChainEvent

    # System Mutations
    createUser(input: UserInput!): User
    updateUser(id: ID!, input: UserInput!): User
    deleteUser(id: ID!): Boolean

    createRole(input: RoleInput!): Role
    updateRole(id: ID!, input: RoleInput!): Role
    deleteRole(id: ID!): Boolean
    assignPermissionToRole(roleId: ID!, permissionId: ID!): Role
    removePermissionFromRole(roleId: ID!, permissionId: ID!): Role

    createPermission(input: PermissionInput!): Permission
    updatePermission(id: ID!, input: PermissionInput!): Permission
    deletePermission(id: ID!): Boolean

    createOrganization(input: OrganizationInput!): Organization
    updateOrganization(id: ID!, input: OrganizationInput!): Organization
    deleteOrganization(id: ID!): Boolean

    createIntegration(input: IntegrationInput!): Integration
    updateIntegration(id: ID!, input: IntegrationInput!): Integration
    deleteIntegration(id: ID!): Boolean
    testIntegration(id: ID!): Boolean

    createChannel(input: ChannelInput!): Channel
    updateChannel(id: ID!, input: ChannelInput!): Channel
    deleteChannel(id: ID!): Boolean
    addMemberToChannel(channelId: ID!, userId: ID!): Channel
    removeMemberFromChannel(channelId: ID!, userId: ID!): Channel

    sendMessage(input: MessageInput!): Message
    deleteMessage(id: ID!): Boolean
  }

  # ============================================
  # SUBSCRIPTION TYPE
  # ============================================

  type Subscription {
    # Intelligence Subscriptions
    threatCreated: Threat
    threatUpdated(id: ID): Threat
    threatStatusChanged: Threat

    caseCreated: Case
    caseUpdated(id: ID): Case
    caseStatusChanged: Case
    caseAssigned: Case

    # Infrastructure Subscriptions
    assetStatusChanged: Asset
    vulnerabilityDetected: Vulnerability
    feedSynced(id: ID): Feed

    # Operations Subscriptions
    auditLogCreated: AuditLog
    reportPublished: Report
    playbookExecuted: JSON
    artifactUploaded: Artifact

    # System Subscriptions
    messageReceived(channelId: ID!): Message
    userStatusChanged: User
    integrationStatusChanged: Integration

    # Real-time Analytics
    dashboardUpdated: DashboardStats
  }

  # ============================================
  # ANALYTICS & DASHBOARD TYPES
  # ============================================

  type DashboardStats {
    totalThreats: Int!
    activeCases: Int!
    criticalAssets: Int!
    openVulnerabilities: Int!
    recentAlerts: Int!
    threatsBySource: [SourceCount!]!
    casesByPriority: [PriorityCount!]!
    assetsByCriticality: [CriticalityCount!]!
  }

  type SourceCount {
    source: String!
    count: Int!
  }

  type PriorityCount {
    priority: String!
    count: Int!
  }

  type CriticalityCount {
    criticality: String!
    count: Int!
  }

  type TrendData {
    date: String!
    count: Int!
  }

  type CaseMetrics {
    averageResolutionTime: Float
    slaComplianceRate: Float
    totalCases: Int!
    openCases: Int!
    resolvedCases: Int!
  }
`);
