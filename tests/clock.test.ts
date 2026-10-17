import { describe, expect, it } from "vitest";
import { advanceClock, formatClock } from "../src/dayz/clock";

const MINUTE = 60_000;

describe("advanceClock", () => {
  it("runs at the day acceleration in daylight", () => {
    expect(advanceClock({ hours: 12, minutes: 0 }, 10 * MINUTE, 4, 1)).toEqual({ hours: 12, minutes: 40 });
  });

  it("multiplies in the night acceleration after dark", () => {
    expect(advanceClock({ hours: 22, minutes: 0 }, 10 * MINUTE, 2, 3)).toEqual({ hours: 23, minutes: 0 });
  });

  it("switches rate at dusk", () => {
    // 19:50 → 20:00 takes 10 real min at 1x, then 10 more real min at 1x × 6x night = 60 in-game min.
    expect(advanceClock({ hours: 19, minutes: 50 }, 20 * MINUTE, 1, 6)).toEqual({ hours: 21, minutes: 0 });
  });

  it("wraps past midnight", () => {
    expect(advanceClock({ hours: 23, minutes: 59 }, 2 * MINUTE, 1, 1)).toEqual({ hours: 0, minutes: 1 });
  });

  it("doesn't move before a whole in-game minute passes", () => {
    expect(advanceClock({ hours: 12, minutes: 0 }, 50_000, 1, 1)).toEqual({ hours: 12, minutes: 0 });
  });
});

describe("formatClock", () => {
  it("zero-pads", () => expect(formatClock({ hours: 6, minutes: 5 })).toBe("06:05"));
});
