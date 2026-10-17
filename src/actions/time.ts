import { action } from "@elgato/streamdeck";
import { ServerKey } from "./server-key";

/** The server's in-game time. */
@action({ UUID: "com.jamiebono.dayzserver.time" })
export class TimeAction extends ServerKey {
  protected readonly layout = "time";
}
