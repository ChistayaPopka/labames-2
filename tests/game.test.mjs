import assert from "node:assert/strict";
import { drawCombination, evaluateCombination, symbols } from "../lib/game.ts";

// Exhaust the complete outcome space: 6 triples, 90 pairs, 120 mixed results.
const totals = { triple: 0, pair: 0, different: 0 };
for (let a = 0; a < symbols.length; a++) {
  for (let b = 0; b < symbols.length; b++) {
    for (let c = 0; c < symbols.length; c++) totals[evaluateCombination([a, b, c])]++;
  }
}
assert.deepEqual(totals, { triple: 6, pair: 90, different: 120 });
for (let i = 0; i < 2000; i++) {
  const result = drawCombination();
  assert.equal(result.length, 3);
  assert.ok(result.every((symbol) => Number.isInteger(symbol) && symbol >= 0 && symbol < symbols.length));
}
console.log("Passed: all 216 combinations and 2,000 random draws.");
