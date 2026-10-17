import { describe, expect, it } from "vitest";
import { DEFAULT_KEY_OPTIONS, keyOptions, refreshSeconds } from "../src/settings";

describe("keyOptions", () => {
  it("fills defaults for a fresh key", () => {
    expect(keyOptions({})).toEqual(DEFAULT_KEY_OPTIONS);
  });

  it("keeps valid values", () => {
    expect(keyOptions({ dayNight: "tint", clock: "12h", showQueue: false, textColor: "#00FF00" })).toMatchObject({
      dayNight: "tint",
      clock: "12h",
      showQueue: false,
      textColor: "#00FF00",
    });
  });

  it("rejects unknown values and malformed colors", () => {
    // Settings come from the inspector's JSON, so anything can arrive.
    const o = keyOptions({ dayNight: "bogus", textColor: "red", accentColor: "#12345" } as never);
    expect(o.dayNight).toBe("icon");
    expect(o.textColor).toBe(DEFAULT_KEY_OPTIONS.textColor);
    expect(o.accentColor).toBe(DEFAULT_KEY_OPTIONS.accentColor);
  });
});

describe("refreshSeconds", () => {
  it("defaults to 15", () => expect(refreshSeconds({})).toBe(15));
  it("clamps to 5..120", () => {
    expect(refreshSeconds({ refreshSeconds: 1 })).toBe(5);
    expect(refreshSeconds({ refreshSeconds: 999 })).toBe(120);
  });
});
