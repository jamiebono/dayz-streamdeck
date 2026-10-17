import type { Snapshot } from "./server-monitor";

export type Layout = "status" | "time" | "population";

const SIZE = 144;
const FONT = "Arial, Helvetica, sans-serif";
const WHITE = "#f2f2f2";
const MUTED = "#9a9a9a";
const QUEUE = "#f5a623";
const DOT = { live: "#3ecf6e", offline: "#7a7a7a", unreachable: "#e5484d" };

/** Renders a key face as an SVG data URL. */
export function renderKey(layout: Layout, s: Snapshot): string {
  return toDataUrl(svg(layout, s));
}

function svg(layout: Layout, s: Snapshot): string {
  if (s.kind === "no-server") {
    return frame(text(72, 62, "DayZ", 34, WHITE, true) + text(72, 98, "no server", 20, MUTED), 1);
  }

  const time = s.time ?? "--:--";
  const pop = s.players == null ? "--/--" : `${s.players}/${s.maxPlayers}`;
  const queue = s.queue > 0 ? `+${s.queue} queue` : "";
  const dot = !s.reachable ? DOT.unreachable : s.connected ? DOT.live : DOT.offline;
  const opacity = s.connected ? 1 : 0.45;

  let body: string;
  switch (layout) {
    case "status":
      body = text(72, 60, time, 44, WHITE, true) + text(72, 100, pop, 30, WHITE) + text(72, 128, queue, 18, QUEUE);
      break;
    case "time":
      body = text(72, 34, "IN-GAME", 16, MUTED) + text(72, 90, time, 48, WHITE, true);
      break;
    case "population":
      body = text(72, 34, "PLAYERS", 16, MUTED) + text(72, 88, pop, fitSize(pop, 44), WHITE, true) + text(72, 122, queue, 18, QUEUE);
      break;
  }

  return frame(body + `<circle cx="128" cy="16" r="6" fill="${dot}"/>`, opacity);
}

/** Shrinks long values (e.g. "100/100") to stay inside the key. */
function fitSize(value: string, base: number): number {
  return value.length > 5 ? Math.floor((base * 5) / value.length) : base;
}

function frame(body: string, opacity: number): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">` +
    `<rect width="${SIZE}" height="${SIZE}" fill="#000"/>` +
    `<g opacity="${opacity}">${body}</g></svg>`
  );
}

function text(x: number, y: number, value: string, size: number, fill: string, bold = false): string {
  if (!value) return "";
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${bold ? 700 : 400}" fill="${fill}" text-anchor="middle">${escape(value)}</text>`;
}

function escape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf8,${encodeURIComponent(svg)}`;
}
