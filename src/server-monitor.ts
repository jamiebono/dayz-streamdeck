import streamDeck from "@elgato/streamdeck";
import { queryInfo } from "./dayz/a2s";
import { advanceClock } from "./dayz/clock";
import { type ClockTime, type DayzStatus, parseKeywords } from "./dayz/keywords";
import { findLastServer, type ServerEndpoint } from "./dayz/launch-args";
import { isDayzRunning } from "./dayz/process";
import { REFRESH_SECONDS } from "./settings";

const TICK_MS = 1_000;

/** What the keys render. */
export type Snapshot =
  | { kind: "no-server" }
  | {
      kind: "server";
      /** DayZ is running; otherwise this is the last server played, shown dimmed. */
      connected: boolean;
      /** False when the last query failed; values are from the previous answer, if any. */
      reachable: boolean;
      name: string;
      /** `ip:gamePort`, what players paste into a launcher's direct connect. */
      address: string;
      time: ClockTime | null;
      players: number | null;
      maxPlayers: number | null;
      queue: number;
    };

type Listener = (snapshot: Snapshot) => void;

type LastAnswer = {
  name: string;
  players: number;
  maxPlayers: number;
  status: DayzStatus;
  answeredAt: number;
};

/**
 * Polls the current DayZ server while any key is visible and fans the result
 * out to every subscribed action. One monitor serves all actions, so three keys
 * on the deck still cost one query per poll.
 */
class ServerMonitor {
  private listeners = new Set<Listener>();
  private pollTimer: NodeJS.Timeout | undefined;
  private tickTimer: NodeJS.Timeout | undefined;
  private pollMs = REFRESH_SECONDS.default * 1000;

  private endpoint: ServerEndpoint | null = null;
  private connected = false;
  private reachable = false;
  private answer: LastAnswer | null = null;
  private polling = false;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    if (this.listeners.size === 1) this.start();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.stop();
    };
  }

  /** Polls now instead of waiting for the next interval (key press). */
  refresh(): void {
    void this.poll();
  }

  /** The latest state, for re-rendering a key whose settings changed. */
  current(): Snapshot {
    return this.snapshot();
  }

  setRefreshSeconds(seconds: number): void {
    const ms = seconds * 1000;
    if (ms === this.pollMs) return;
    this.pollMs = ms;
    if (this.listeners.size > 0) {
      clearInterval(this.pollTimer);
      this.pollTimer = setInterval(() => void this.poll(), this.pollMs);
    }
  }

  private start() {
    void this.poll();
    this.pollTimer = setInterval(() => void this.poll(), this.pollMs);
    this.tickTimer = setInterval(() => this.emit(), TICK_MS);
  }

  private stop() {
    clearInterval(this.pollTimer);
    clearInterval(this.tickTimer);
  }

  private async poll() {
    if (this.polling) return;
    this.polling = true;
    try {
      const [endpoint, running] = await Promise.all([findLastServer(), isDayzRunning()]);
      if (endpoint && !sameEndpoint(endpoint, this.endpoint)) this.answer = null;
      this.endpoint = endpoint;
      this.connected = running;

      if (endpoint) {
        try {
          const info = await queryInfo(endpoint.host, endpoint.queryPort);
          this.answer = {
            name: info.name,
            players: info.players,
            maxPlayers: info.maxPlayers,
            status: parseKeywords(info.keywords),
            answeredAt: Date.now(),
          };
          this.reachable = true;
        } catch (err) {
          streamDeck.logger.warn(`Query failed: ${String(err)}`);
          this.reachable = false;
        }
      }
    } finally {
      this.polling = false;
    }
    this.emit();
  }

  private snapshot(): Snapshot {
    if (!this.endpoint) return { kind: "no-server" };

    const a = this.answer;
    const time = a?.status.time
      ? advanceClock(a.status.time, Date.now() - a.answeredAt, a.status.dayAcceleration, a.status.nightAcceleration)
      : null;
    const address = `${this.endpoint.host}:${this.endpoint.gamePort}`;

    return {
      kind: "server",
      connected: this.connected,
      reachable: this.reachable,
      name: a?.name ?? address,
      address,
      time,
      players: a?.players ?? null,
      maxPlayers: a?.maxPlayers ?? null,
      queue: a?.status.queue ?? 0,
    };
  }

  private emit() {
    const snapshot = this.snapshot();
    for (const listener of this.listeners) listener(snapshot);
  }
}

function sameEndpoint(a: ServerEndpoint, b: ServerEndpoint | null) {
  return !!b && a.host === b.host && a.queryPort === b.queryPort;
}

export const serverMonitor = new ServerMonitor();
