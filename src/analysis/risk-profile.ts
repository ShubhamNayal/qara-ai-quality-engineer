export type RiskCategory =
  | "SECURITY"
  | "DATA_INTEGRITY"
  | "AUTHORIZATION"
  | "VALIDATION"
  | "PERFORMANCE"
  | "FINANCIAL"
  | "AVAILABILITY";

export interface RiskProfile {
  featureType: string;
  categories: RiskCategory[];
  keywords: string[];
  baseRiskScore: number;
}

export const riskProfiles: RiskProfile[] = [
  {
  featureType: "data-import",
  categories: [
    "DATA_INTEGRITY",
    "VALIDATION",
    "AUTHORIZATION",
    "PERFORMANCE",
  ],
  keywords: [
  "import",
  "upload",
  "csv",
  "bulk",
],
  baseRiskScore: 70,
},
  {
  featureType: "payment",
  categories: [
    "FINANCIAL",
    "SECURITY",
    "AUTHORIZATION",
    "DATA_INTEGRITY",
    "AVAILABILITY",
  ],
  keywords: [
    "payment",
    "refund",
    "charge",
    "transaction",
    "billing",
    "money",
  ],
  baseRiskScore: 85,
},
  {
  featureType: "authentication",
  categories: [
    "SECURITY",
    "AUTHORIZATION",
    "AVAILABILITY",
  ],
  keywords: [
    "login",
    "authentication",
    "password",
    "session",
    "token",
    "oauth",
  ],
  baseRiskScore: 80,
},
  {
    featureType: "authorization",
    categories: [
      "SECURITY",
      "AUTHORIZATION",
      "DATA_INTEGRITY",
    ],
    keywords: [
      "authorization",
      "permission",
      "role-based access",
      "access control",
      "admin access",
      "privilege",
    ],
    baseRiskScore: 75,
  },
   {
  featureType: "database-change",
  categories: [
    "DATA_INTEGRITY",
    "AVAILABILITY",
    "PERFORMANCE",
  ],
  keywords: [
    "database migration",
    "schema migration",
    "alter table",
    "database schema",
  ],
  baseRiskScore: 85,
},
];