# dayz-streamdeck

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Development

Stream Deck plugin (SDK v3, Node 24, Stream Deck 7.1+) showing the in-game time and population of the DayZ server you're on.

- `npm run build` bundles `src/` into `com.dayzserver.streamdeck.sdPlugin/bin/plugin.js`; `npm run watch` rebuilds and restarts the plugin on change.
- `npm test` runs the unit tests; `npm run typecheck`; `npm run validate` checks the manifest and images.
- The plugin is linked into Stream Deck with `npm run link` (a symlink in `%APPDATA%\Elgato\StreamDeck\Plugins`). Stream Deck only discovers a newly linked plugin on app start.

How it finds the server: the newest `%LOCALAPPDATA%\DayZ\DayZ_x64_*.RPT` repeats the launch command line, including `-connect=ip:gamePort:queryPort`. BattlEye hides the running process's command line, so the log is the only source. The server is then queried with Steam A2S_INFO on the query port; DayZ reports the in-game time (`12:25`), login queue (`lqs13`) and day/night acceleration (`etm`, `entm`) in the keyword string.
