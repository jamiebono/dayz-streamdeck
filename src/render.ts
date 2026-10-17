import { formatClock, isDaytime } from "./dayz/clock";
import type { Snapshot } from "./server-monitor";
import type { KeyOptions } from "./settings";

export type Layout = "status" | "time" | "population";

const SIZE = 144;
const FONT = "Arial, Helvetica, sans-serif";
const MUTED = "#9a9a9a";
const DOT = { live: "#3ecf6e", offline: "#7a7a7a", unreachable: "#e5484d" };
const BACKGROUND = { plain: "#000", day: "#173a5c", night: "#0b0b22" };
const SUN = "#f7c948";
const MOON = "#c9d6ff";

/** Widest a body line may render, leaving a margin inside the key. */
const MAX_WIDTH = 130;
const HEADER_WIDTH = 76;

type Line = { text: string; size: number; color: string; bold?: boolean; suffix?: string };

/** Renders a key face as an SVG data URL. */
export function renderKey(layout: Layout, s: Snapshot, o: KeyOptions): string {
  return `data:image/svg+xml;charset=utf8,${encodeURIComponent(renderSvg(layout, s, o))}`;
}

export function renderSvg(layout: Layout, s: Snapshot, o: KeyOptions): string {
  if (s.kind === "no-server") {
    const title = o.label === "custom" ? o.customLabel : "";
    return frame(BACKGROUND.plain, 1, header(title, "", null) + body([
      { text: "DayZ", size: 34, color: o.textColor, bold: true },
      { text: "no server", size: 20, color: MUTED },
    ], !!title));
  }

  const day = s.time ? isDaytime(s.time) : null;
  const clock = s.time ? formatClock(s.time, o.clock) : { time: "--:--", suffix: "" };
  const pop = s.players == null ? "--/--" : `${s.players}/${s.maxPlayers}`;
  const queue = o.showQueue && s.queue > 0 ? `+${s.queue} queue` : "";
  const dot = !s.reachable ? DOT.unreachable : s.connected ? DOT.live : DOT.offline;

  const title =
    o.label === "custom" ? o.customLabel :
    o.label === "server" ? shortServerName(s.name) :
    layout === "time" ? "IN-GAME" :
    layout === "population" ? "PLAYERS" : "";

  const time: Line = { text: clock.time, suffix: clock.suffix, size: 46, color: o.textColor, bold: true };
  const lines: Line[] =
    layout === "status" ? [time, { text: pop, size: 30, color: o.textColor }, { text: queue, size: 17, color: o.accentColor }] :
    layout === "time" ? [{ ...time, size: 50 }] :
    [{ text: pop, size: 46, color: o.textColor, bold: true }, { text: queue, size: 17, color: o.accentColor }];

  const background = o.dayNight === "tint" && day != null ? (day ? BACKGROUND.day : BACKGROUND.night) : BACKGROUND.plain;
  const icon = o.dayNight === "icon" ? day : null;
  return frame(background, s.connected ? 1 : 0.45, header(title, dot, icon) + body(lines, !!title || icon != null));
}

/** "THE STRUGGLE Nasdara | Vanilla 1PP | discord.gg/x" → "THE STRUGGLE Nasdara". */
export function shortServerName(name: string): string {
  return name.split(/\s+[|•\-–—]\s+/)[0].trim() || name;
}

/** Top row: sun/moon left, title centred, status dot right. */
function header(title: string, dot: string, day: boolean | null): string {
  let out = "";
  if (day != null) out += day ? sun(18, 20) : moon(18, 20);
  if (dot) out += `<circle cx="128" cy="18" r="6" fill="${dot}"/>`;
  if (title) {
    const { text, size } = fitText(title, 15, 10, HEADER_WIDTH, false);
    out += textEl(72, 24, text, size, MUTED, false);
  }
  return out;
}

/** Stacks the non-empty lines, centred vertically below the header (or the whole key without one). */
function body(lines: Line[], hasHeader: boolean): string {
  const shown = lines
    .filter((l) => l.text)
    .map((l) => ({ ...l, size: fitSize(l, MAX_WIDTH) }));
  const gap = 6;
  const top = hasHeader ? 34 : 8;
  const height = shown.reduce((h, l) => h + l.size * 0.75, 0) + gap * (shown.length - 1);
  let y = top + (SIZE - 6 - top - height) / 2;

  let out = "";
  for (const l of shown) {
    y += l.size * 0.75; // cap height of Arial digits ≈ 0.72em; baseline sits at the bottom of it
    out += textEl(72, y, l.text, l.size, l.color, !!l.bold, l.suffix);
    y += gap;
  }
  return out;
}

function fitSize(l: Line, maxWidth: number): number {
  const width = textWidth(l.text, l.size, !!l.bold) + (l.suffix ? textWidth(l.suffix, l.size * 0.4, false) + 3 : 0);
  return width > maxWidth ? Math.floor((l.size * maxWidth) / width) : l.size;
}

/** Shrinks down to `minSize`, then truncates with an ellipsis. */
function fitText(text: string, size: number, minSize: number, maxWidth: number, bold: boolean) {
  while (size > minSize && textWidth(text, size, bold) > maxWidth) size--;
  if (textWidth(text, size, bold) <= maxWidth) return { text, size };
  let cut = text;
  while (cut.length > 1 && textWidth(`${cut}…`, size, bold) > maxWidth) cut = cut.slice(0, -1);
  return { text: `${cut.trimEnd()}…`, size };
}

/** Approximate Arial advance widths, in em. Good enough to keep text inside 144px. */
function textWidth(text: string, size: number, bold: boolean): number {
  let em = 0;
  for (const ch of text) {
    if (/[0-9]/.test(ch)) em += 0.556;
    else if (/[:./,|!il' ]/.test(ch)) em += 0.278;
    else if (/[A-Z]/.test(ch)) em += 0.7;
    else if (/[a-z]/.test(ch)) em += 0.53;
    else em += 0.6;
  }
  return em * size * (bold ? 1.05 : 1);
}

function sun(cx: number, cy: number): string {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const p = (r: number) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    return `M${p(7.5)}L${p(10.5)}`;
  }).join("");
  return `<circle cx="${cx}" cy="${cy}" r="5" fill="${SUN}"/><path d="${rays}" stroke="${SUN}" stroke-width="2" stroke-linecap="round"/>`;
}

function moon(cx: number, cy: number): string {
  // Crescent: a disc with an offset disc cut out of it.
  return (
    `<mask id="m"><rect width="${SIZE}" height="${SIZE}" fill="#fff"/><circle cx="${cx + 4}" cy="${cy - 3}" r="7" fill="#000"/></mask>` +
    `<circle cx="${cx}" cy="${cy}" r="8" fill="${MOON}" mask="url(#m)"/>`
  );
}

function frame(background: string, opacity: number, content: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">` +
    `<rect width="${SIZE}" height="${SIZE}" fill="${background}"/>` +
    `<g opacity="${opacity}">${content}</g></svg>`
  );
}

function textEl(x: number, y: number, value: string, size: number, fill: string, bold: boolean, suffix = ""): string {
  const tail = suffix ? `<tspan font-size="${Math.round(size * 0.4)}" dx="3">${escape(suffix)}</tspan>` : "";
  return `<text x="${x}" y="${y.toFixed(1)}" font-family="${FONT}" font-size="${size}" font-weight="${bold ? 700 : 400}" fill="${fill}" text-anchor="middle">${escape(value)}${tail}</text>`;
}

function escape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
