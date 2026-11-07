import { test } from "node:test";
import assert from "node:assert/strict";
import { tally, verdict } from "./runs.ts";

test("tally counts caught failures and false alarms separately", () => {
  assert.deepEqual(
    tally([
      { correct: false, judge: "yes" },
      { correct: false, judge: "no" },
      { correct: true, judge: "yes" },
      { correct: true, judge: "no" },
      { correct: true, judge: "no" },
    ]),
    { wrong: 2, caught: 1, right: 3, falseAlarms: 1 },
  );
});

test("tally of nothing is all zeros", () => {
  assert.deepEqual(tally([]), { wrong: 0, caught: 0, right: 0, falseAlarms: 0 });
});

test("verdict rejects anything but yes or no", () => {
  assert.equal(verdict("yes"), "yes");
  assert.throws(() => verdict("maybe"));
});
