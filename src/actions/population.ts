import { action } from "@elgato/streamdeck";
import { ServerKey } from "./server-key";

/** Players online, out of max, plus the login queue. */
@action({ UUID: "com.dayzserver.streamdeck.population" })
export class PopulationAction extends ServerKey {
  protected readonly layout = "population";
}
