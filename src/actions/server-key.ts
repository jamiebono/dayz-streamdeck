import {
  type DidReceiveSettingsEvent,
  type KeyAction,
  type KeyDownEvent,
  SingletonAction,
  type WillAppearEvent,
  type WillDisappearEvent,
} from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";
import { copyToClipboard } from "../clipboard";
import { type Layout, renderKey } from "../render";
import { type Snapshot, serverMonitor } from "../server-monitor";
import { type KeyOptions, type KeySettings, keyOptions } from "../settings";

type Instance = {
  action: KeyAction<KeySettings>;
  options: KeyOptions;
  lastImage: string;
  unsubscribe: () => void;
};

/**
 * A key that renders the current DayZ server. Each visible instance subscribes
 * to the shared monitor, renders with its own settings, and only pushes an
 * image when its face changes.
 */
export abstract class ServerKey extends SingletonAction<KeySettings> {
  protected abstract readonly layout: Layout;
  private instances = new Map<string, Instance>();

  override onWillAppear(ev: WillAppearEvent<KeySettings>): void {
    const action = ev.action;
    if (!action.isKey()) return;

    this.instances.get(action.id)?.unsubscribe();
    const instance: Instance = { action, options: keyOptions(ev.payload.settings), lastImage: "", unsubscribe: () => {} };
    this.instances.set(action.id, instance);
    instance.unsubscribe = serverMonitor.subscribe((snapshot) => this.draw(instance, snapshot));
  }

  override onWillDisappear(ev: WillDisappearEvent<KeySettings>): void {
    this.instances.get(ev.action.id)?.unsubscribe();
    this.instances.delete(ev.action.id);
  }

  override onDidReceiveSettings(ev: DidReceiveSettingsEvent<KeySettings>): void {
    const instance = this.instances.get(ev.action.id);
    if (!instance) return;
    instance.options = keyOptions(ev.payload.settings);
    this.draw(instance, serverMonitor.current());
  }

  override async onKeyDown(ev: KeyDownEvent<KeySettings>): Promise<void> {
    const options = keyOptions(ev.payload.settings);
    if (options.pressAction === "copy") {
      const snapshot = serverMonitor.current();
      if (snapshot.kind !== "server") return ev.action.showAlert();
      try {
        await copyToClipboard(snapshot.address);
        await ev.action.showOk();
      } catch (err) {
        streamDeck.logger.warn(`Copy failed: ${String(err)}`);
        await ev.action.showAlert();
      }
      return;
    }
    serverMonitor.refresh();
  }

  private draw(instance: Instance, snapshot: Snapshot) {
    const image = renderKey(this.layout, snapshot, instance.options);
    if (image === instance.lastImage) return;
    instance.lastImage = image;
    void instance.action.setImage(image);
  }
}
