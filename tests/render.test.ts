import { describe, expect, it } from "vitest";
import { renderSvg, shortServerName } from "../src/render";
import type { Snapshot } from "../src/server-monitor";
import { DEFAULT_KEY_OPTIONS } from "../src/settings";

const live: Snapshot = {
  kind: "server",
  connected: true,
  reachable: true,
  name: "THE STRUGGLE Nasdara | Vanilla 1PP | discord.gg/thestruggle",
  address: "172.111.51.206:3102",
  time: { hours: 21, minutes: 15 },
  players: 80,
  maxPlayers: 80,
  queue: 15,
};

describe("shortServerName", () => {
  it("keeps the part before the first separator", () => {
    expect(shortServerName(live.name)).toBe("THE STRUGGLE Nasdara");
    expect(shortServerName("Rearmed - Chernarus - 1PP")).toBe("Rearmed");
    expect(shortServerName("Plain Name")).toBe("Plain Name");
  });
});

describe("renderSvg", () => {
  it("shows a moon at night with the icon option", () => {
    expect(renderSvg("status", live, DEFAULT_KEY_OPTIONS)).toContain("mask=");
  });

  it("tints instead of drawing an icon", () => {
    const svg = renderSvg("status", live, { ...DEFAULT_KEY_OPTIONS, dayNight: "tint" });
    expect(svg).toContain('fill="#0b0b22"');
    expect(svg).not.toContain("mask=");
  });

  it("hides the queue when turned off", () => {
    expect(renderSvg("status", live, DEFAULT_KEY_OPTIONS)).toContain("+15 queue");
    expect(renderSvg("status", live, { ...DEFAULT_KEY_OPTIONS, showQueue: false })).not.toContain("queue");
  });

  it("truncates a long label with an ellipsis", () => {
    const svg = renderSvg("time", live, { ...DEFAULT_KEY_OPTIONS, label: "custom", customLabel: "A really very long custom label" });
    expect(svg).toContain("…");
  });

  it("escapes user text", () => {
    const svg = renderSvg("time", live, { ...DEFAULT_KEY_OPTIONS, label: "custom", customLabel: "<b>&" });
    expect(svg).toContain("&lt;b&gt;&amp;");
  });

  it("applies the 12h suffix", () => {
    expect(renderSvg("time", live, { ...DEFAULT_KEY_OPTIONS, clock: "12h" })).toMatch(/9:15<tspan[^>]*>PM</);
  });
});
