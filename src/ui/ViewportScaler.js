import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from "../data/constants.js";

/** Keeps the logical canvas centered and uses integer CSS scaling whenever it fits. */
export class ViewportScaler {
  constructor(frame) {
    this.frame = frame;
    this.onResize = () => this.resize();
  }

  initialize() {
    window.addEventListener("resize", this.onResize, { passive: true });
    window.visualViewport?.addEventListener("resize", this.onResize, { passive: true });
    this.resize();
  }

  resize() {
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const horizontalPadding = viewportWidth < 560 ? 12 : 28;
    const verticalReserve = viewportHeight < 540 ? 12 : 56;
    const availableWidth = Math.max(1, viewportWidth - horizontalPadding);
    const availableHeight = Math.max(1, viewportHeight - verticalReserve);
    const fitScale = Math.min(availableWidth / LOGICAL_WIDTH, availableHeight / LOGICAL_HEIGHT);
    const scale = fitScale >= 1 ? Math.max(1, Math.floor(fitScale)) : fitScale;
    const width = Math.max(1, Math.floor(LOGICAL_WIDTH * scale));
    const height = Math.max(1, Math.floor(LOGICAL_HEIGHT * scale));

    this.frame.style.width = `${width}px`;
    this.frame.style.height = `${height}px`;
    this.frame.style.setProperty("--game-scale", String(scale));
    this.frame.style.setProperty("--hud-inset", `${Math.max(6, Math.min(14, Math.round(scale * 3)))}px`);
    this.frame.style.setProperty("--hud-font-size", `${Math.max(9, Math.min(15, Math.round(6 + scale * 1.7)))}px`);
  }

  destroy() {
    window.removeEventListener("resize", this.onResize);
    window.visualViewport?.removeEventListener("resize", this.onResize);
  }
}
