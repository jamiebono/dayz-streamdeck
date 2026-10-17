import dgram from "node:dgram";

export type ServerInfo = {
  name: string;
  map: string;
  players: number;
  maxPlayers: number;
  keywords: string;
};

const HEADER = Buffer.from([0xff, 0xff, 0xff, 0xff]);
const INFO_REQUEST = Buffer.concat([HEADER, Buffer.from("TSource Engine Query\0", "latin1")]);
const S2C_CHALLENGE = 0x41;
const S2A_INFO = 0x49;

/** Sends a Steam A2S_INFO query, answering the challenge round-trip if the server asks for one. */
export function queryInfo(host: string, port: number, timeoutMs = 3000): Promise<ServerInfo> {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket("udp4");
    const done = (fn: () => void) => {
      clearTimeout(timer);
      socket.close();
      fn();
    };
    const timer = setTimeout(() => done(() => reject(new Error(`A2S timeout ${host}:${port}`))), timeoutMs);

    socket.on("error", (err) => done(() => reject(err)));
    socket.on("message", (msg) => {
      if (msg[4] === S2C_CHALLENGE) {
        socket.send(Buffer.concat([INFO_REQUEST, msg.subarray(5, 9)]), port, host);
      } else if (msg[4] === S2A_INFO) {
        done(() => resolve(parseInfo(msg)));
      }
    });
    socket.send(INFO_REQUEST, port, host);
  });
}

/** Parses an S2A_INFO response. See https://developer.valvesoftware.com/wiki/Server_queries#A2S_INFO */
export function parseInfo(msg: Buffer): ServerInfo {
  let o = 6; // header (4) + type (1) + protocol (1)
  const str = () => {
    const end = msg.indexOf(0, o);
    const value = msg.toString("utf8", o, end);
    o = end + 1;
    return value;
  };

  const name = str();
  const map = str();
  str(); // folder
  str(); // game
  o += 2; // app id
  const players = msg[o++];
  const maxPlayers = msg[o++];
  o += 5; // bots, server type, environment, visibility, VAC
  str(); // version

  let keywords = "";
  if (o < msg.length) {
    const edf = msg[o++];
    if (edf & 0x80) o += 2; // game port
    if (edf & 0x10) o += 8; // steam id
    if (edf & 0x40) {
      o += 2; // spectator port
      str(); // spectator name
    }
    if (edf & 0x20) keywords = str();
  }

  return { name, map, players, maxPlayers, keywords };
}
