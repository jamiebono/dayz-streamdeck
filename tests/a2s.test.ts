import { describe, expect, it } from "vitest";
import { parseInfo } from "../src/dayz/a2s";

function infoPacket(keywords: string): Buffer {
  const s = (v: string) => Buffer.from(`${v}\0`, "utf8");
  return Buffer.concat([
    Buffer.from([0xff, 0xff, 0xff, 0xff, 0x49, 0x11]),
    s("Test Server"),
    s("chernarusplus"),
    s("dayz"),
    s("DayZ"),
    Buffer.from([0xa8, 0x2e]), // app id 221100 truncated to 16 bits, as the protocol does
    Buffer.from([42, 60, 0, 0x64, 0x77, 0, 1]), // players, max, bots, type, env, visibility, vac
    s("1.28.0"),
    Buffer.from([0x80 | 0x20]), // EDF: game port + keywords
    Buffer.from([0xfe, 0x08]),
    s(keywords),
  ]);
}

describe("parseInfo", () => {
  it("reads name, players and keywords", () => {
    expect(parseInfo(infoPacket("battleye,lqs0,10:30"))).toEqual({
      name: "Test Server",
      map: "chernarusplus",
      players: 42,
      maxPlayers: 60,
      keywords: "battleye,lqs0,10:30",
    });
  });
});
