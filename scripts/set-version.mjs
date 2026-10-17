// Sets the plugin version in manifest.json (four-part) and package.json (semver).
// Usage: npm run set-version -- 0.3.0
import { readFileSync, writeFileSync } from "node:fs";

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) {
  console.error("Usage: npm run set-version -- <major.minor.patch>");
  process.exit(1);
}

const update = (path, apply) => {
  const json = JSON.parse(readFileSync(path, "utf8"));
  apply(json);
  writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
};

update("com.dayzserver.streamdeck.sdPlugin/manifest.json", (m) => (m.Version = `${version}.0`));
update("package.json", (p) => (p.version = version));
console.log(`Version set to ${version}. Commit, then: git tag v${version} && git push origin main v${version}`);
