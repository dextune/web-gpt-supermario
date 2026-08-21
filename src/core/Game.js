import { Config } from "./Config.js";
import { GameLoop } from "./GameLoop.js";
import { InputManager } from "./InputManager.js";
import { EventBus } from "./EventBus.js";
import { AssetManager } from "./AssetManager.js";
import { AudioManager } from "./AudioManager.js";
import { SceneManager } from "./SceneManager.js";
import { Storage } from "./Storage.js";
import { EntityFactory } from "../gameplay/factories/EntityFactory.js";
import { LevelLoader } from "../world/LevelLoader.js";
import { World } from "../engine/World.js";
import { Renderer } from "../rendering/Renderer.js";
import { DebugRenderer } from "../rendering/DebugRenderer.js";
import { HUD } from "../ui/HUD.js";
import { Overlay } from "../ui/Overlay.js";
import { Action, Event, Scene } from "../data/constants.js";

export class Game {
  constructor({ canvas, hudRoot, overlayRoot, touchRoot = document }) {
    this.canvas = canvas;
    this.input = new InputManager(window);
    this.events = new EventBus();
    this.audio = new AudioManager();
    this.assets = new AssetManager();
    this.storage = new Storage();
    this.scene = new SceneManager(Scene.BOOT);
    this.renderer = new Renderer(canvas);
    this.debug = new DebugRenderer(this.renderer);
    this.hud = new HUD(hudRoot, this.events);
    this.overlay = new Overlay(overlayRoot);
    this.touchRoot = touchRoot;
    this.factory = new EntityFactory();
    this.levelLoader = new LevelLoader(this.factory);
    this.levelData = null;
    this.world = null;
    this.saved = this.storage.load();
    this.session = this.newSession();
    this.disposers = [];
    this.loop = new GameLoop({
      fixedDt: Config.fixedDt,
      maxFrameTime: Config.maxFrameTime,
      maxCatchUpSteps: Config.maxCatchUpSteps,
      update: (dt) => this.update(dt),
      render: (alpha, frameTime) => this.render(alpha, frameTime),
    });
  }

  newSession() {
    return { score: 0, coins: 0, lives: Config.initialLives, checkpoint: null };
  }

  async initialize() {
    this.input.initialize(this.touchRoot);
    this.audio.masterVolume = this.saved.settings.masterVolume;
    this.audio.initialize();
    this.installEvents();
    this.levelData = await this.assets.loadJSON(Config.levelUrl);
    this.scene.set(Scene.TITLE);
    this.updateOverlay();
    this.loop.start();

    if (Config.debug) this.debug.enabled = true;
    window.DEBUG_GAME = {
      restart: () => this.restartGame(),
      invincible: () => { if (this.world) this.world.player.invulnerabilityTimer = 9999; },
      teleport: (x, y) => { if (this.world) { this.world.player.x = x; this.world.player.y = y; } },
      loadLevel: () => this.startLevel(),
    };
  }

  installEvents() {
    this.disposers.push(this.events.on(Event.PLAYER_DIED, () => this.onPlayerDied()));
    this.disposers.push(this.events.on(Event.LEVEL_CLEAR, () => this.onLevelClear()));
    this.disposers.push(this.events.on(Event.PLAYER_JUMP, () => this.audio.play("jump")));
    this.disposers.push(this.events.on(Event.PLAYER_LAND, () => this.audio.play("land")));
    this.disposers.push(this.events.on(Event.COIN_COLLECTED, () => this.audio.play("collect")));
    this.disposers.push(this.events.on(Event.ENEMY_DEFEATED, () => this.audio.play("stomp")));
    this.disposers.push(this.events.on(Event.SHELL_KICK, () => this.audio.play("shell")));
    this.disposers.push(this.events.on(Event.BLOCK_HIT, () => this.audio.play("block")));
    this.disposers.push(this.events.on(Event.PLAYER_POWERUP, () => this.audio.play("power")));
    this.disposers.push(this.events.on(Event.PLAYER_HIT, () => this.audio.play("hurt")));
  }

  startLevel() {
    this.world?.destroy();
    const parsed = this.levelLoader.parse(this.levelData);
    this.world = new World(parsed, this.events, this.session, this.input, Config);
    this.scene.set(Scene.GAME);
    this.overlay.hide();
  }

  restartGame() {
    this.session = this.newSession();
    this.startLevel();
  }

  onPlayerDied() {
    this.session.lives -= 1;
    this.audio.play("death");
    if (this.session.lives > 0) {
      this.startLevel();
    } else {
      this.scene.set(Scene.GAME_OVER);
      this.updateHighScore();
      this.updateOverlay();
    }
  }

  onLevelClear() {
    this.scene.set(Scene.CLEAR);
    this.audio.play("goal");
    this.saved.unlockedLevel = Math.max(this.saved.unlockedLevel, 1);
    this.updateHighScore();
    this.updateOverlay();
  }

  updateHighScore() {
    this.saved.highScore = Math.max(this.saved.highScore, this.session.score);
    this.storage.save(this.saved);
  }

  update(dt) {
    this.input.pollGamepads();

    if (this.input.wasPressed(Action.DEBUG)) this.debug.toggle();

    if (this.scene.current === Scene.TITLE) {
      if (this.input.wasPressed(Action.START) || this.input.wasPressed(Action.JUMP)) this.restartGame();
    } else if (this.scene.current === Scene.GAME) {
      if (this.input.wasPressed(Action.PAUSE)) {
        this.scene.set(Scene.PAUSE);
        this.updateOverlay();
      } else if (this.input.wasPressed(Action.RESTART)) {
        this.restartGame();
      } else {
        this.world.update(dt);
      }
    } else if (this.scene.current === Scene.PAUSE) {
      if (this.input.wasPressed(Action.PAUSE) || this.input.wasPressed(Action.START)) {
        this.scene.set(Scene.GAME);
        this.overlay.hide();
      }
    } else if (this.scene.current === Scene.GAME_OVER || this.scene.current === Scene.CLEAR) {
      if (this.input.wasPressed(Action.START) || this.input.wasPressed(Action.JUMP) || this.input.wasPressed(Action.RESTART)) {
        this.restartGame();
      }
    }

    this.input.endFrame();
  }

  render(alpha, frameTime) {
    if (this.world) {
      this.renderer.render(this.world, alpha);
      this.hud.update(this.session, this.world.timeRemaining);
      this.debug.updateFrameTime(frameTime);
      this.debug.render(this.world);
    } else {
      const ctx = this.renderer.ctx;
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  updateOverlay() {
    const scene = this.scene.current;
    if (scene === Scene.TITLE) {
      this.overlay.show("STARBOUND SPRINT", "Copper Skyway · Arrow/A-D move · Z/Space jump · X/Shift run", "Enter / Space to start");
    } else if (scene === Scene.PAUSE) {
      this.overlay.show("PAUSED", "Simulation is frozen; rendering remains active.", "P / Esc / Enter to resume");
    } else if (scene === Scene.GAME_OVER) {
      this.overlay.show("RUN ENDED", `Score ${this.session.score} · Best ${this.saved.highScore}`, "Enter / Space to retry");
    } else if (scene === Scene.CLEAR) {
      this.overlay.show("BEACON REACHED", `Stage clear · Score ${this.session.score} · Best ${this.saved.highScore}`, "Enter / Space to run again");
    }
  }

  destroy() {
    this.loop.stop();
    this.world?.destroy();
    this.hud.destroy();
    this.input.destroy();
    this.audio.destroy();
    this.assets.clear();
    for (const dispose of this.disposers) dispose();
    this.disposers.length = 0;
    this.events.clear();
    delete window.DEBUG_GAME;
  }
}
