import { describe, expect, it } from "vitest";
import { parseKeywords } from "../src/dayz/keywords";

describe("parseKeywords", () => {
  it("reads time, queue and accelerations from a live server's keywords", () => {
    expect(parseKeywords("battleye,external,privHive,shard111,lqs13,etm4.500000,entm3.500000,mod,isDLC4,12:25")).toEqual({
      time: { hours: 12, minutes: 25 },
      queue: 13,
      dayAcceleration: 4.5,
      nightAcceleration: 3.5,
    });
  });

  it("handles a single-digit hour", () => {
    expect(parseKeywords("battleye,etm1.000000,6:05").time).toEqual({ hours: 6, minutes: 5 });
  });

  it("defaults when fields are missing", () => {
    expect(parseKeywords("")).toEqual({ time: null, queue: 0, dayAcceleration: 1, nightAcceleration: 1 });
  });
});
