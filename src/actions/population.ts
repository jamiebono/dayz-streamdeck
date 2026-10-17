import { action } from "@elgato/streamdeck";
import { ServerKey } from "./server-key";

/** Players online, out of max, plus the login queue. */
@action({ UUID: "com.jamiebono.dayzserver.population" })
export class PopulationAction extends ServerKey {
  protected readonly layout = "population";
}
