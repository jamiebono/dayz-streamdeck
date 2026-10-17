import { describe, expect, it } from "vitest";
import { advanceClock, formatClock, isDaytime } from "../src/dayz/clock";

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
  it("zero-pads in 24h", () => expect(formatClock({ hours: 6, minutes: 5 })).toEqual({ time: "06:05", suffix: "" }));
  it("uses 12 for noon and midnight in 12h", () => {
    expect(formatClock({ hours: 0, minutes: 30 }, "12h")).toEqual({ time: "12:30", suffix: "AM" });
    expect(formatClock({ hours: 12, minutes: 0 }, "12h")).toEqual({ time: "12:00", suffix: "PM" });
    expect(formatClock({ hours: 19, minutes: 7 }, "12h")).toEqual({ time: "7:07", suffix: "PM" });
  });
});

describe("isDaytime", () => {
  it("is day from 06:00 up to 20:00", () => {
    expect(isDaytime({ hours: 5, minutes: 59 })).toBe(false);
    expect(isDaytime({ hours: 6, minutes: 0 })).toBe(true);
    expect(isDaytime({ hours: 19, minutes: 59 })).toBe(true);
    expect(isDaytime({ hours: 20, minutes: 0 })).toBe(false);
  });
});
