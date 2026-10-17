import { type KeyDownEvent, SingletonAction, type WillAppearEvent, type WillDisappearEvent } from "@elgato/streamdeck";
import { type Layout, renderKey } from "../render";
import { serverMonitor } from "../server-monitor";

/**
 * A key that renders the current DayZ server. Each visible instance subscribes
 * to the shared monitor and only pushes an image when its face changes.
 */
export abstract class ServerKey extends SingletonAction {
  protected abstract readonly layout: Layout;
  private subscriptions = new Map<string, () => void>();

  override onWillAppear(ev: WillAppearEvent): void {
    const action = ev.action;
    if (!action.isKey()) return;

    let last = "";
    this.subscriptions.get(action.id)?.();
    this.subscriptions.set(
      action.id,
      serverMonitor.subscribe((snapshot) => {
        const image = renderKey(this.layout, snapshot);
        if (image === last) return;
        last = image;
        void action.setImage(image);
      }),
    );
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    this.subscriptions.get(ev.action.id)?.();
    this.subscriptions.delete(ev.action.id);
  }

  override onKeyDown(_ev: KeyDownEvent): void {
    serverMonitor.refresh();
  }
}
