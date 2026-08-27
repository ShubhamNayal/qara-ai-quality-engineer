import "dotenv/config";

import { analyzeChange } from "./analysis/analyzer.js";

const change = `
A new POST /contacts/import endpoint has been introduced.

The endpoint accepts a CSV file and creates contacts in bulk.
`;

const analysis = await analyzeChange(change);

console.log("\nQARA Risk Analysis\n");
console.log(JSON.stringify(analysis, null, 2));