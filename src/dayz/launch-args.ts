import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

/** DayZ's default Steam query port, used when the launch line doesn't name one. */
const DEFAULT_QUERY_PORT = 27016;

export type ServerEndpoint = {
  host: string;
  gamePort: number;
  queryPort: number;
};

/**
 * Parses the server a DayZ client was launched against from its launch arguments.
 *
 * Launchers pass either `-connect=ip:gamePort:queryPort` (DZSA) or
 * `-connect=ip -port=gamePort`; the query port falls back to DayZ's default.
 */
export function parseConnectArgs(commandLine: string): ServerEndpoint | null {
  const connect = /-connect=([\w.-]+)(?::(\d+))?(?::(\d+))?/.exec(commandLine);
  if (!connect) return null;

  const port = /-port=(\d+)/.exec(commandLine);
  const gamePort = Number(connect[2] ?? port?.[1] ?? 2302);
  const queryPort = Number(connect[3] ?? DEFAULT_QUERY_PORT);
  return { host: connect[1], gamePort, queryPort };
}

/** `%LOCALAPPDATA%\DayZ`, where the client writes one `DayZ_x64_<timestamp>.RPT` per launch. */
export function defaultLogDir(): string {
  return join(process.env.LOCALAPPDATA ?? "", "DayZ");
}

/**
 * Finds the server from the most recent client log. The RPT header repeats the
 * launch command line, which is the only readable copy: BattlEye hides the
 * running process's command line.
 */
export async function findLastServer(logDir = defaultLogDir()): Promise<ServerEndpoint | null> {
  let names: string[];
  try {
    names = (await readdir(logDir)).filter((n) => /^DayZ_x64_.*\.RPT$/i.test(n));
  } catch {
    return null;
  }

  // Newest first by modified time; the timestamp in the name is launch time, which sorts the same way.
  const files = await Promise.all(
    names.map(async (n) => ({ path: join(logDir, n), mtime: (await stat(join(logDir, n))).mtimeMs })),
  );
  files.sort((a, b) => b.mtime - a.mtime);

  for (const { path } of files) {
    const head = (await readFile(path, "utf8").catch(() => "")).slice(0, 8192);
    const endpoint = parseConnectArgs(head);
    if (endpoint) return endpoint;
  }
  return null;
}
