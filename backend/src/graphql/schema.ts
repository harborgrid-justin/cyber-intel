
import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  scalar Date

  type Threat {
    id: ID!
    indicator: String!
    type: String!
    severity: String!
    source: String
    status: String
    score: Int
    last_seen: String
  }

  type Case {
    id: ID!
    title: String!
    description: String
    priority: String
    status: String
    assignee: String
    created_at: String
  }

  type Actor {
    id: ID!
    name: String!
    origin: String
    description: String
    sophistication: String
  }

  type Campaign {
    id: ID!
    name: String!
    status: String
    objective: String
    first_seen: String
  }

  type AuditLog {
    id: ID!
    user_id: String
    action: String!
    details: String
    timestamp: String
  }

  type Query {
    threats(limit: Int, offset: Int): [Threat]
    threat(id: ID!): Threat
    cases(status: String, assignee: String): [Case]
    actors: [Actor]
    campaigns: [Campaign]
    auditLogs(limit: Int): [AuditLog]
  }

  input ThreatInput {
    indicator: String!
    type: String!
    severity: String
    source: String
    score: Int
  }

  input CaseInput {
    title: String!
    description: String
    priority: String
    assignee: String
  }

  type Mutation {
    createThreat(input: ThreatInput!): Threat
    updateThreatStatus(id: ID!, status: String!): Threat
    createCase(input: CaseInput!): Case
    updateCaseStatus(id: ID!, status: String!): Case
  }
`);
