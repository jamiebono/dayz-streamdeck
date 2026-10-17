# DayZ Server for Stream Deck

A Stream Deck plugin that shows the in-game time and population of the DayZ server you're playing on.

Three actions, each configurable per key:

- **Server Status**: in-game time, players/max and login queue on one key
- **In-Game Time**: the server's day/night clock
- **Population**: players/max and login queue

Settings: label (default, server name or custom text), sun/moon icon or background tint for day/night, 12h or 24h clock, show or hide the queue, key press (refresh now or copy the server's IP:port), text and accent colors, and a shared refresh rate (5–120 s).

## Install

Download the `.streamDeckPlugin` file from the [latest release](../../releases/latest) and double-click it.

Requires Windows and Stream Deck 7.1 or newer.

## How it works

DayZ writes a log per launch to `%LOCALAPPDATA%\DayZ\DayZ_x64_*.RPT`, starting with the launch command line. When you launch straight into a server (DZSA Launcher, or the official launcher's play button), that line includes `-connect=ip:port:queryPort`. The plugin reads it from the newest log, then asks the server for its status with a Steam A2S_INFO query, the same query server browsers use. DayZ servers include the in-game time, login queue and day/night speed in the reply; between queries the clock ticks forward at the server's speed.

When DayZ isn't running, the keys keep showing the last server you played, dimmed.

**Limitation:** if you join from DayZ's in-game server browser, the log has no `-connect` line and the keys show "no server".

## Development

```bash
npm install
npm run build      # bundle into com.dayzserver.streamdeck.sdPlugin/bin
npm test
npm run link       # link the plugin into Stream Deck (restart the app to pick it up)
npm run watch      # rebuild and restart the plugin on change
npm run pack       # build the .streamDeckPlugin file
```
