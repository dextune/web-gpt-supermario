import { Game } from "./core/Game.js";
import { ViewportScaler } from "./ui/ViewportScaler.js";

async function bootstrap() {
  const frame = document.querySelector("#game-frame");
  const canvas = document.querySelector("#game-canvas");
  const hudRoot = document.querySelector("#hud");
  const overlayRoot = document.querySelector("#overlay");
  if (!frame || !canvas || !hudRoot || !overlayRoot) throw new Error("Required game DOM nodes are missing");

  const viewport = new ViewportScaler(frame);
  viewport.initialize();
  const game = new Game({ canvas, hudRoot, overlayRoot, touchRoot: document });

  window.addEventListener("pagehide", () => {
    viewport.destroy();
    game.destroy();
  }, { once: true });

  try {
    await game.initialize();
  } catch (error) {
    console.error(error);
    overlayRoot.classList.remove("hidden");
    overlayRoot.querySelector('[data-overlay="title"]').textContent = "LOAD ERROR";
    overlayRoot.querySelector('[data-overlay="body"]').textContent =
      "Run this project through a local HTTP server so ES modules and level JSON can load.";
    overlayRoot.querySelector('[data-overlay="prompt"]').textContent = String(error.message || error);
  }
}

bootstrap();
