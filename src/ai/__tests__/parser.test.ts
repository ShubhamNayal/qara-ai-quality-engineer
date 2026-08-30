import { describe, it, expect } from "vitest";
import { parseAIAnalysis } from "../parser.js";

describe("AI Analysis Parser", () => {
it("parses a valid Claude response", () => {
const response = JSON.stringify({
isQaraChange: false,
riskLevel: "HIGH",
summary: "Bulk import introduces data integrity risks.",
risks: [
{
title: "Duplicate contacts",
severity: "HIGH",
reason: "Duplicate records may be created.",
},
],
recommendedTests: [
{
area: "Data integrity",
priority: "HIGH",
scenario: "Import duplicate contacts",
expectedBehavior:
"Duplicate contacts are detected or handled correctly.",
},
{
area: "Validation",
priority: "HIGH",
scenario: "Import malformed CSV",
expectedBehavior:
"Malformed CSV data is rejected with a clear error.",
},
],
});

 
const result = parseAIAnalysis(response);

expect(result.isQaraChange).toBe(false);
expect(result.riskLevel).toBe("HIGH");
expect(result.risks).toHaveLength(1);
expect(result.recommendedTests).toHaveLength(2);
expect(result.recommendedTests[0].area).toBe("Data integrity");
 

});

it("rejects malformed JSON", () => {
const response = '{"riskLevel":"HIGH","summary":"Broken JSON"';

 
expect(() => parseAIAnalysis(response)).toThrow();
 

});

it("rejects structurally invalid JSON", () => {
const response = JSON.stringify({
riskLevel: "HIGH",
summary: "Missing required arrays.",
});

 
expect(() => parseAIAnalysis(response)).toThrow();
 

});

it("parses JSON wrapped in Markdown code fences", () => {
const response =
" json\n" +
"{\n" +
' "isQaraChange": false,\n' +
' "riskLevel": "HIGH",\n' +
' "summary": "Bulk import introduces data integrity risks.",\n' +
' "risks": [\n' +
" {\n" +
' "title": "Duplicate contacts",\n' +
' "severity": "HIGH",\n' +
' "reason": "Duplicate records may be created."\n' +
" }\n" +
" ],\n" +
' "recommendedTests": [\n' +
" {\n" +
' "area": "Data integrity",\n' +
' "priority": "HIGH",\n' +
' "scenario": "Import duplicate contacts",\n' +
' "expectedBehavior": "Duplicate contacts are detected or handled correctly."\n' +
" }\n" +
" ]\n" +
"}\n" +
"``";

 
const result = parseAIAnalysis(response);

expect(result.isQaraChange).toBe(false);
expect(result.riskLevel).toBe("HIGH");
expect(result.recommendedTests).toHaveLength(1);
expect(result.recommendedTests[0].scenario).toBe(
  "Import duplicate contacts",
);
 

});

it("parses JSON surrounded by explanatory text", () => {
const response =
"Here is the QA analysis:\n\n" +
"{\n" +
' "isQaraChange": false,\n' +
' "riskLevel": "LOW",\n' +
' "summary": "Minor UI change.",\n' +
' "risks": [],\n' +
' "recommendedTests": [\n' +
" {\n" +
' "area": "UI",\n' +
' "priority": "LOW",\n' +
' "scenario": "Run UI regression tests",\n' +
' "expectedBehavior": "Existing UI functionality continues to work correctly."\n' +
" }\n" +
" ]\n" +
"}\n\n" +
"Hope this helps.";

 
const result = parseAIAnalysis(response);

expect(result.isQaraChange).toBe(false);
expect(result.riskLevel).toBe("LOW");
expect(result.risks).toHaveLength(0);
expect(result.recommendedTests).toHaveLength(1);
expect(result.recommendedTests[0].area).toBe("UI");
 

});
});
