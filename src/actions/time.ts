import { action } from "@elgato/streamdeck";
import { ServerKey } from "./server-key";

/** The server's in-game time. */
@action({ UUID: "com.dayzserver.streamdeck.time" })
export class TimeAction extends ServerKey {
  protected readonly layout = "time";
}
