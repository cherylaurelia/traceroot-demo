export type Verdict = "yes" | "no";

export interface Judged {
  correct: boolean;
  judge: Verdict;
}

export interface Tally {
  wrong: number;
  caught: number;
  right: number;
  falseAlarms: number;
}

/** How the detector did against answers checked by hand against orders.csv. */
export function tally(rows: readonly Judged[]): Tally {
  const wrong = rows.filter((r) => !r.correct);
  const right = rows.filter((r) => r.correct);

  return {
    wrong: wrong.length,
    caught: wrong.filter((r) => r.judge === "yes").length,
    right: right.length,
    falseAlarms: right.filter((r) => r.judge === "yes").length,
  };
}

export function verdict(value: string): Verdict {
  if (value === "yes" || value === "no") return value;
  throw new Error(`unknown verdict: ${value}`);
}
