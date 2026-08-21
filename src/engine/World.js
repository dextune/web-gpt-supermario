import { Tile, Event } from "../data/constants.js";
import { PLAYER_CONFIG as PC } from "../data/playerConfig.js";
import { Player } from "../gameplay/Player.js";
import { PlayerController } from "../gameplay/PlayerController.js";
import { CollisionSystem } from "./systems/CollisionSystem.js";
import { Camera } from "../world/Camera.js";
import { BlockSystem } from "../gameplay/BlockSystem.js";
import { ParticleSystem } from "../gameplay/ParticleSystem.js";
import { FloatingTextSystem } from "../gameplay/FloatingTextSystem.js";
import { ScoreSystem } from "../gameplay/ScoreSystem.js";
import { SpawnManager } from "../world/SpawnManager.js";
import { SpatialHash } from "./SpatialHash.js";
import { Item } from "../gameplay/Item.js";
import { aabb, clamp } from "../utils/math.js";

export class World {
  constructor(level, events, session, input, config) {
    this.level = level;
    this.events = events;
    this.session = session;
    this.input = input;
    this.config = config;
    this.tileMap = level.tileMap;
    this.entities = level.entities;
    this.player = new Player(session.checkpoint?.x ?? level.spawn.x, session.checkpoint?.y ?? level.spawn.y);
    this.playerController = new PlayerController();
    this.collision = new CollisionSystem(this.tileMap);
    this.camera = new Camera(config.logicalWidth, config.logicalHeight, config.camera);
    this.camera.setBounds(this.tileMap.worldWidth(), this.tileMap.worldHeight());
    this.camera.snapTo(this.player);
    this.spawnManager = new SpawnManager();
    this.spawnManager.update(this.entities, this.camera);
    this.blockSystem = new BlockSystem(this.tileMap, this);
    this.particles = new ParticleSystem();
    this.floatingText = new FloatingTextSystem();
    this.scoreSystem = new ScoreSystem(events, session);
    this.spatialHash = new SpatialHash(32);
    this.queryScratch = [];
    this.timeRemaining = level.time;
    this.timeAccumulator = 0;
    this.clearTimer = -1;
    this.deathHandled = false;
    this.checkpointFlags = new Uint8Array(level.checkpoints.length);
    this.stompChain = 0;
    this.stompChainTimer = 0;
    this.screenFlashTime = 0;
    this.screenFlashDuration = 0;
    this.screenFlashColor = "#ffffff";
  }

  update(dt) {
    const wasGrounded = this.player.grounded;

    if (this.clearTimer >= 0) {
      this.player.vx = 42;
      this.player.vy = clamp(this.player.vy + PC.fallGravity * dt, -1000, PC.maxFallSpeed);
    }

    this.playerController.update(this.player, this.input, dt);
    if (this.player.jumpStarted) this.events.emit(Event.PLAYER_JUMP);
    const impactVelocity = Math.max(0, this.player.vy);

    this.updateEnemiesAI(dt);
    this.updatePhysics(dt);
    this.player.finalizeMovement(dt, wasGrounded, impactVelocity);
    this.updatePlayerFeel(dt);
    this.rebuildBroadPhase();
    this.resolveInteractions();
    this.updateSequences(dt);
    this.spawnManager.update(this.entities, this.camera);
    this.blockSystem.update(dt);
    this.particles.update(dt);
    this.floatingText.update(dt);
    this.updateTransientEffects(dt);
    this.camera.update(this.player, dt);
    this.updateTimer(dt);
  }

  updatePlayerFeel(dt) {
    const player = this.player;

    if (player.justLanded) {
      const hard = player.landingImpact >= PC.hardLandingImpactThreshold;
      this.particles.land(player.centerX, player.y + player.height, hard);
      this.camera.addTrauma(hard ? 0.11 : 0.045);
      this.events.emit(Event.PLAYER_LAND, { hard });
    }

    if (player.skidding && player.grounded && Math.abs(player.vx) > PC.skidThreshold) {
      player.skidDustTimer -= dt;
      if (player.skidDustTimer <= 0) {
        const movementDirection = Math.sign(player.vx) || player.facing;
        this.particles.skid(player.centerX - movementDirection * 5, player.y + player.height, movementDirection);
        player.skidDustTimer = PC.skidDustInterval;
      }
    } else {
      player.skidDustTimer = 0;
    }

    if (this.stompChainTimer > 0) {
      this.stompChainTimer = Math.max(0, this.stompChainTimer - dt);
      if (this.stompChainTimer === 0) this.stompChain = 0;
    }
  }

  updateEnemiesAI(dt) {
    for (let i = 0; i < this.entities.length; i += 1) {
      const entity = this.entities[i];
      if (!entity.active || entity.kind !== "enemy" || entity.simulationActive === false) continue;
      entity.updateAI(dt);
      if (entity.type !== "flier") {
        entity.vy = clamp(entity.vy + entity.gravity * dt, -1000, entity.maxFallSpeed);
      }
    }
  }

  updatePhysics(dt) {
    const player = this.player;
    if (player.dead) {
      player.beginStep();
      player.vy = Math.min(player.vy + PC.fallGravity * dt, PC.maxFallSpeed);
      player.x += player.vx * dt;
      player.y += player.vy * dt;
    } else {
      this.collision.move(player, dt, true);
      if (player.collision.ceiling) {
        this.blockSystem.hit(player.collision.ceilingCol, player.collision.ceilingRow, player);
      }
    }

    for (let i = 0; i < this.entities.length; i += 1) {
      const entity = this.entities[i];
      if (!entity.active || entity.simulationActive === false) continue;
      if (entity.kind === "enemy") {
        if (entity.type !== "flier") {
          this.collision.move(entity, dt, true);
          entity.postCollision();
        } else {
          entity.prevX = entity.x;
          entity.prevY = entity.y;
        }
      } else if (entity.kind === "item") {
        entity.update(dt);
        if (entity.type === "powerCore" && !entity.emerging) {
          entity.vy = clamp(entity.vy + entity.gravity * dt, -1000, entity.maxFallSpeed);
          this.collision.move(entity, dt, true);
          if (entity.collision.left || entity.collision.right) {
            entity.direction *= -1;
            entity.vx = 34 * entity.direction;
          }
        }
      }
    }
  }

  rebuildBroadPhase() {
    this.spatialHash.clear();
    for (let i = 0; i < this.entities.length; i += 1) {
      const entity = this.entities[i];
      if (entity.active && entity.simulationActive !== false) this.spatialHash.insert(entity);
    }
  }

  resolveInteractions() {
    const player = this.player;
    if (player.dead) return;
    this.spatialHash.query(player.x - 2, player.y - 2, player.width + 4, player.height + 4, this.queryScratch);
    for (let i = 0; i < this.queryScratch.length; i += 1) {
      const entity = this.queryScratch[i];
      if (!entity.active || !aabb(player, entity)) continue;
      if (entity.kind === "enemy") this.resolvePlayerEnemy(player, entity);
      else if (entity.kind === "item") this.collectItem(entity);
    }

    this.resolveShellHits();
    this.resolveCheckpoints();

    if (this.tileMap.overlapsType(player.x, player.y, player.width, player.height, Tile.HAZARD)) {
      this.damagePlayer();
    }
    if (player.y > this.tileMap.worldHeight() + 24) player.die();

    const goal = this.level.goal;
    if (goal && this.clearTimer < 0 && player.x + player.width >= goal.x && player.x <= goal.x + (goal.width ?? 16)) {
      this.triggerGoal();
    }
  }

  resolvePlayerEnemy(player, enemy) {
    const previousBottom = player.prevY + player.height;
    const enemyTop = enemy.y;
    const stomping = player.vy >= 0 && previousBottom <= enemyTop + 5 && player.y + player.height >= enemyTop;

    if (stomping) {
      const result = enemy.stomp();
      player.vy = enemy.type === "shell" ? PC.shellStompBounceVelocity : PC.stompBounceVelocity;
      player.grounded = false;
      player.setState("JUMP");
      this.particles.stomp(enemy.centerX, enemy.y + 2);
      this.camera.addTrauma(0.075);

      if (result === "defeated") {
        this.stompChain = this.stompChainTimer > 0 ? Math.min(8, this.stompChain + 1) : 1;
        this.stompChainTimer = 0.72;
        const score = enemy.score + Math.max(0, this.stompChain - 1) * 100;
        this.events.emit(Event.ENEMY_DEFEATED, { score });
        this.floatingText.spawn(enemy.centerX, enemy.y - 3, `+${score}`, this.stompChain >= 3 ? "#92ffe5" : "#fff1a1");
      }
      return;
    }

    if (enemy.type === "shell" && enemy.state === "SHELL_IDLE") {
      const direction = player.centerX < enemy.centerX ? 1 : -1;
      enemy.kick(direction);
      enemy.combo = 0;
      player.x += -direction * 3;
      this.particles.stomp(enemy.centerX, enemy.centerY);
      this.camera.addTrauma(0.055);
      this.events.emit(Event.SHELL_KICK);
      return;
    }

    this.damagePlayer();
  }

  resolveShellHits() {
    for (let i = 0; i < this.entities.length; i += 1) {
      const shell = this.entities[i];
      if (!shell.active || shell.kind !== "enemy" || shell.type !== "shell" || shell.state !== "SHELL_MOVING") continue;
      this.spatialHash.query(shell.x - 2, shell.y, shell.width + 4, shell.height, this.queryScratch);
      for (let j = 0; j < this.queryScratch.length; j += 1) {
        const target = this.queryScratch[j];
        if (target === shell || !target.active || target.kind !== "enemy" || !aabb(shell, target)) continue;
        target.active = false;
        target.state = "DEAD";
        shell.combo = Math.min(8, (shell.combo ?? 0) + 1);
        const score = target.score + shell.combo * 100;
        this.events.emit(Event.ENEMY_DEFEATED, { score });
        this.floatingText.spawn(target.centerX, target.y - 3, `+${score}`, shell.combo >= 3 ? "#7fffe4" : "#fff1a1");
        this.particles.stomp(target.centerX, target.centerY);
        this.camera.addTrauma(Math.min(0.12, 0.045 + shell.combo * 0.012));
      }
    }
  }

  collectItem(item) {
    if (item.type === "shard") {
      item.active = false;
      this.events.emit(Event.COIN_COLLECTED, {});
      this.particles.collect(item.centerX, item.centerY);
      this.floatingText.spawn(item.centerX, item.y - 2, "+100", "#fff088");
    } else if (item.type === "powerCore") {
      if (this.player.applyPower(this.collision)) {
        item.active = false;
        this.events.emit(Event.PLAYER_POWERUP, { type: "BOOST" });
        this.particles.collect(item.centerX, item.centerY);
        this.floatingText.spawn(item.centerX, item.y - 5, "POWER", "#8dffe8");
        this.camera.addTrauma(0.085);
        this.flash("#b9fff0", 0.16);
      }
    }
  }

  damagePlayer() {
    const result = this.player.damage();
    if (result === "ignored") return;
    this.events.emit(Event.PLAYER_HIT, { fatal: result === "dead" });
    this.particles.damage(this.player.centerX, this.player.centerY);
    this.camera.addTrauma(result === "dead" ? 0.24 : 0.17);
    this.flash("#ff9a9a", result === "dead" ? 0.18 : 0.12);
  }

  updateSequences(dt) {
    const player = this.player;
    if (player.invulnerabilityTimer > 0) player.invulnerabilityTimer = Math.max(0, player.invulnerabilityTimer - dt);

    if (player.dead) {
      player.deathTimer -= dt;
      if (player.deathTimer <= 0 && !this.deathHandled) {
        this.deathHandled = true;
        this.events.emit(Event.PLAYER_DIED, {});
      }
    }

    if (this.clearTimer >= 0) {
      this.clearTimer -= dt;
      if (this.clearTimer <= 0) {
        this.clearTimer = -2;
        this.events.emit(Event.LEVEL_CLEAR, { time: Math.max(0, Math.ceil(this.timeRemaining)) });
      }
    }
  }

  updateTransientEffects(dt) {
    if (this.screenFlashTime > 0) this.screenFlashTime = Math.max(0, this.screenFlashTime - dt);
  }

  flash(color, duration) {
    this.screenFlashColor = color;
    this.screenFlashDuration = duration;
    this.screenFlashTime = duration;
  }

  updateTimer(dt) {
    if (this.player.dead || this.clearTimer >= 0) return;
    this.timeAccumulator += dt;
    if (this.timeAccumulator >= 1) {
      const whole = Math.floor(this.timeAccumulator);
      this.timeAccumulator -= whole;
      this.timeRemaining = Math.max(0, this.timeRemaining - whole);
      if (this.timeRemaining <= 0) this.player.die();
    }
  }

  triggerGoal() {
    this.player.locked = true;
    this.player.setState("FLAG");
    this.clearTimer = 1.8;
    const bonus = Math.max(0, Math.ceil(this.timeRemaining)) * 10;
    this.scoreSystem.add(bonus);
    this.floatingText.spawn(this.player.centerX, this.player.y - 8, `TIME +${bonus}`, "#a4ffe9");
    this.camera.addTrauma(0.12);
    this.flash("#c9fff5", 0.18);
  }

  resolveCheckpoints() {
    for (let i = 0; i < this.level.checkpoints.length; i += 1) {
      if (this.checkpointFlags[i]) continue;
      const cp = this.level.checkpoints[i];
      if (this.player.x < cp.x) continue;
      this.checkpointFlags[i] = 1;
      this.session.checkpoint = { x: cp.spawnX, y: cp.spawnY };
      this.events.emit(Event.CHECKPOINT_REACHED, { index: i });
      this.floatingText.spawn(cp.x, 172, "CHECKPOINT", "#8dffe8");
      this.flash("#8dffe8", 0.09);
    }
  }

  spawnFromBlock(type, col, row) {
    const s = this.tileMap.tileSize;
    if (type === "shard") {
      this.events.emit(Event.COIN_COLLECTED, {});
      this.particles.collect(col * s + s * 0.5, row * s - 2);
      this.floatingText.spawn(col * s + s * 0.5, row * s - 5, "+100", "#fff088");
      return;
    }
    const item = new Item(type, col * s + 1, row * s);
    item.startEmerging(s);
    this.entities.push(item);
  }

  bumpEnemiesAbove(col, row) {
    const s = this.tileMap.tileSize;
    const left = col * s;
    const right = left + s;
    const blockTop = row * s;
    for (let i = 0; i < this.entities.length; i += 1) {
      const enemy = this.entities[i];
      if (enemy.kind !== "enemy" || !enemy.active) continue;
      const enemyBottom = enemy.y + enemy.height;
      if (enemy.x + enemy.width <= left || enemy.x >= right) continue;
      if (enemyBottom < blockTop - 8 || enemyBottom > blockTop + 2) continue;
      enemy.vy = -160;
      enemy.direction *= -1;
    }
  }

  destroy() {
    this.scoreSystem.destroy();
    this.particles.clear();
    this.floatingText.clear();
    this.entities.length = 0;
  }
}
