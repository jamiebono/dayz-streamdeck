import streamDeck from "@elgato/streamdeck";
import { PopulationAction } from "./actions/population";
import { StatusAction } from "./actions/status";
import { TimeAction } from "./actions/time";
import { serverMonitor } from "./server-monitor";
import { type GlobalSettings, refreshSeconds } from "./settings";

streamDeck.logger.setLevel("info");

streamDeck.actions.registerAction(new StatusAction());
streamDeck.actions.registerAction(new TimeAction());
streamDeck.actions.registerAction(new PopulationAction());

streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>((ev) =>
  serverMonitor.setRefreshSeconds(refreshSeconds(ev.settings)),
);

await streamDeck.connect();
serverMonitor.setRefreshSeconds(refreshSeconds(await streamDeck.settings.getGlobalSettings<GlobalSettings>()));
