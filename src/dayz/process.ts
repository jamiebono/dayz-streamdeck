import { execFile } from "node:child_process";

/** True if the DayZ client is running. */
export function isDayzRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    execFile("tasklist", ["/FI", "IMAGENAME eq DayZ_x64.exe", "/FO", "CSV", "/NH"], { windowsHide: true }, (err, stdout) =>
      resolve(!err && stdout.toLowerCase().includes("dayz_x64.exe")),
    );
  });
}
