import { Game } from "./core/Game.js";

async function bootstrap() {
  const canvas = document.querySelector("#game-canvas");
  const hudRoot = document.querySelector("#hud");
  const overlayRoot = document.querySelector("#overlay");
  if (!canvas || !hudRoot || !overlayRoot) throw new Error("Required game DOM nodes are missing");

  const game = new Game({ canvas, hudRoot, overlayRoot, touchRoot: document });
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
