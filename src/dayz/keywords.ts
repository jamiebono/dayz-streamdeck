export type ClockTime = { hours: number; minutes: number };

export type DayzStatus = {
  /** In-game time when the query was answered; null if the server didn't report one. */
  time: ClockTime | null;
  /** Players waiting in the login queue (`lqs`). */
  queue: number;
  /** Day-time acceleration (`etm`): in-game minutes per real minute. */
  dayAcceleration: number;
  /** Night acceleration (`entm`), applied on top of the day acceleration. */
  nightAcceleration: number;
};

/**
 * Reads the DayZ-specific fields from an A2S keyword string, e.g.
 * `battleye,external,privHive,shard111,lqs13,etm4.500000,entm3.500000,mod,isDLC4,12:25`.
 */
export function parseKeywords(keywords: string): DayzStatus {
  const tags = keywords.split(",").map((t) => t.trim());
  const num = (prefix: string, fallback: number) => {
    const tag = tags.find((t) => t.startsWith(prefix) && /^\d/.test(t.slice(prefix.length)));
    return tag ? Number(tag.slice(prefix.length)) : fallback;
  };

  const clock = tags.map((t) => /^(\d{1,2}):(\d{2})$/.exec(t)).find(Boolean);

  return {
    time: clock ? { hours: Number(clock[1]), minutes: Number(clock[2]) } : null,
    queue: num("lqs", 0),
    dayAcceleration: num("etm", 1),
    nightAcceleration: num("entm", 1),
  };
}
