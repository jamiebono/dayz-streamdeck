import type { ClockTime } from "./keywords";

/**
 * Approximate daylight window. The real one shifts with the server's date and map
 * latitude, which the query doesn't expose; the clock re-syncs on every query,
 * so this only affects drift between polls.
 */
const DAY_START = 6 * 60;
const DAY_END = 20 * 60;

/**
 * Advances an in-game time by real elapsed time, using the server's day
 * acceleration, multiplied by the night acceleration outside daylight hours.
 */
export function advanceClock(
  start: ClockTime,
  elapsedMs: number,
  dayAcceleration: number,
  nightAcceleration: number,
): ClockTime {
  let minute = start.hours * 60 + start.minutes;
  let realMinutes = elapsedMs / 60_000;

  // Step in one-in-game-minute increments so the rate switches at dawn and dusk.
  while (realMinutes > 0) {
    const isDay = minute >= DAY_START && minute < DAY_END;
    const rate = dayAcceleration * (isDay ? 1 : nightAcceleration);
    const cost = 1 / rate;
    if (realMinutes < cost) break;
    realMinutes -= cost;
    minute = (minute + 1) % (24 * 60);
  }

  return { hours: Math.floor(minute / 60), minutes: minute % 60 };
}

export function formatClock({ hours, minutes }: ClockTime): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
