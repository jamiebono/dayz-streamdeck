import { execFile } from "node:child_process";

/** Copies text to the Windows clipboard via `clip.exe`. */
export function copyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = execFile("clip", { windowsHide: true }, (err) => (err ? reject(err) : resolve()));
    child.stdin?.end(text);
  });
}
