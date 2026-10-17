import { action } from "@elgato/streamdeck";
import { ServerKey } from "./server-key";

/** In-game time and population on one key. */
@action({ UUID: "com.dayzserver.streamdeck.status" })
export class StatusAction extends ServerKey {
  protected readonly layout = "status";
}
