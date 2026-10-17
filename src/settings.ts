/** Per-key settings, as saved by the property inspector. Missing fields take the defaults below. */
export type KeySettings = {
  dayNight?: "off" | "icon" | "tint";
  label?: "none" | "server" | "custom";
  customLabel?: string;
  clock?: "24h" | "12h";
  showQueue?: boolean;
  pressAction?: "refresh" | "copy";
  textColor?: string;
  accentColor?: string;
};

/** Plugin-wide settings: one monitor serves every key, so the refresh rate is shared. */
export type GlobalSettings = {
  refreshSeconds?: number;
};

export type KeyOptions = Required<KeySettings>;

export const DEFAULT_KEY_OPTIONS: KeyOptions = {
  dayNight: "icon",
  label: "none",
  customLabel: "",
  clock: "24h",
  showQueue: true,
  pressAction: "refresh",
  textColor: "#f2f2f2",
  accentColor: "#f5a623",
};

export const REFRESH_SECONDS = { min: 5, max: 120, default: 15 };

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function keyOptions(settings: KeySettings): KeyOptions {
  const d = DEFAULT_KEY_OPTIONS;
  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    allowed.includes(value as T) ? (value as T) : fallback;

  return {
    dayNight: pick(settings.dayNight, ["off", "icon", "tint"], d.dayNight),
    label: pick(settings.label, ["none", "server", "custom"], d.label),
    customLabel: typeof settings.customLabel === "string" ? settings.customLabel.slice(0, 40) : d.customLabel,
    clock: pick(settings.clock, ["24h", "12h"], d.clock),
    showQueue: typeof settings.showQueue === "boolean" ? settings.showQueue : d.showQueue,
    pressAction: pick(settings.pressAction, ["refresh", "copy"], d.pressAction),
    textColor: HEX_COLOR.test(settings.textColor ?? "") ? settings.textColor! : d.textColor,
    accentColor: HEX_COLOR.test(settings.accentColor ?? "") ? settings.accentColor! : d.accentColor,
  };
}

export function refreshSeconds(settings: GlobalSettings): number {
  const n = Number(settings.refreshSeconds);
  if (!Number.isFinite(n)) return REFRESH_SECONDS.default;
  return Math.min(REFRESH_SECONDS.max, Math.max(REFRESH_SECONDS.min, Math.round(n)));
}
