export const symbols = [
  { icon: "🍒", name: "вишня" },
  { icon: "🍋", name: "лимон" },
  { icon: "🍇", name: "виноград" },
  { icon: "🔔", name: "колокольчик" },
  { icon: "⭐", name: "звезда" },
  { icon: "🍊", name: "апельсин" },
] as const;
export type Combination = [number, number, number];
export function evaluateCombination(result: Combination) {
  const unique = new Set(result).size;
  return unique === 1 ? "triple" : unique === 2 ? "pair" : "different";
}
export function drawCombination(): Combination {
  const values = crypto.getRandomValues(new Uint32Array(3));
  return Array.from(values, (value) => Math.floor((value / 4294967296) * symbols.length)) as Combination;
}
