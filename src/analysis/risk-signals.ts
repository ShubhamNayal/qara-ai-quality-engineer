export interface RiskSignal {
  name: string;
  keywords: string[];
  score: number;
}

export const riskSignals: RiskSignal[] = [
  {
    name: "write-operation",
    keywords: [
      "create",
      "update",
      "delete",
      "modify",
      "write",
      "insert",
    ],
    score: 15,
  },

  {
    name: "financial-operation",
    keywords: [
      "payment",
      "refund",
      "charge",
      "transaction",
      "billing",
      "money",
    ],
    score: 20,
  },

  {
    name: "authentication",
    keywords: [
      "login",
      "authentication",
      "password",
      "session",
      "oauth",
      "token",
    ],
    score: 15,
  },

  {
    name: "authorization",
    keywords: [
      "authorization",
      "permission",
      "role",
      "access control",
      "admin",
    ],
    score: 20,
  },

  {
    name: "bulk-operation",
    keywords: [
      "bulk",
      "batch",
      "mass",
      "multiple records",
    ],
    score: 15,
  },

  {
    name: "external-api",
    keywords: [
      "external api",
      "third-party api",
      "webhook",
      "integration",
    ],
    score: 10,
  },

  {
    name: "database-migration",
    keywords: [
      "database migration",
      "schema migration",
      "alter table",
      "database schema",
    ],
    score: 20,
  },
];
