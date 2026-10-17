import streamDeck from "@elgato/streamdeck";
import { PopulationAction } from "./actions/population";
import { StatusAction } from "./actions/status";
import { TimeAction } from "./actions/time";

streamDeck.logger.setLevel("info");

streamDeck.actions.registerAction(new StatusAction());
streamDeck.actions.registerAction(new TimeAction());
streamDeck.actions.registerAction(new PopulationAction());

streamDeck.connect();
