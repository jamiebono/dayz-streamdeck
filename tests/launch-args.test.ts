import { describe, expect, it } from "vitest";
import { parseConnectArgs } from "../src/dayz/launch-args";

// Header line from a real DZSA-launched client log.
const DZSA = String.raw`== "C:\Program "-name=Survivor" "-mod=C:\Program Files (x86)\Steam\steamapps\common\DayZ\!dzsal\@CF" -connect=172.111.51.206:3102:27023`;

describe("parseConnectArgs", () => {
  it("reads host, game port and query port from a DZSA launch line", () => {
    expect(parseConnectArgs(DZSA)).toEqual({ host: "172.111.51.206", gamePort: 3102, queryPort: 27023 });
  });

  it("takes the game port from -port and defaults the query port", () => {
    expect(parseConnectArgs("DayZ_x64.exe -connect=10.0.0.5 -port=2402")).toEqual({
      host: "10.0.0.5",
      gamePort: 2402,
      queryPort: 27016,
    });
  });

  it("accepts a hostname", () => {
    expect(parseConnectArgs("-connect=dayz.example.com:2302:27016")?.host).toBe("dayz.example.com");
  });

  it("returns null when the client wasn't launched into a server", () => {
    expect(parseConnectArgs(`== "C:\Program "-name=Survivor"`)).toBeNull();
  });
});
