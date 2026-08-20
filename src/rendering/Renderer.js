import { Tile } from "../data/constants.js";
import { lerp } from "../utils/math.js";

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
  }

  render(world, alpha) {
    const ctx = this.ctx;
    const cameraX = lerp(world.camera.prevX, world.camera.x, alpha);
    this.drawBackground(ctx, cameraX);
    this.drawTiles(ctx, world, cameraX);
    this.drawGoal(ctx, world, cameraX);
    this.drawEntities(ctx, world, cameraX, alpha);
    this.drawPlayer(ctx, world.player, cameraX, alpha);
    this.drawParticles(ctx, world, cameraX);
  }

  drawBackground(ctx, cameraX) {
    ctx.fillStyle = "#5da9e9";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#d8f3ff";
    const drift = -((cameraX * 0.15) % 90);
    for (let i = -1; i < 5; i += 1) {
      const x = drift + i * 90;
      ctx.fillRect(x, 46 + (i % 2) * 15, 28, 5);
      ctx.fillRect(x + 6, 41 + (i % 2) * 15, 16, 5);
    }
    ctx.fillStyle = "#9acb89";
    const hill = -((cameraX * 0.35) % 128);
    for (let i = -1; i < 4; i += 1) {
      const x = hill + i * 128;
      ctx.beginPath();
      ctx.moveTo(x, 208);
      ctx.lineTo(x + 38, 155);
      ctx.lineTo(x + 76, 208);
      ctx.fill();
    }
  }

  drawTiles(ctx, world, cameraX) {
    const map = world.tileMap;
    const s = map.tileSize;
    const startCol = Math.max(0, Math.floor(cameraX / s));
    const endCol = Math.min(map.width - 1, Math.ceil((cameraX + this.canvas.width) / s));
    const endRow = Math.min(map.height - 1, Math.ceil(this.canvas.height / s));

    for (let row = 0; row <= endRow; row += 1) {
      for (let col = startCol; col <= endCol; col += 1) {
        const tile = map.get(col, row);
        if (tile === Tile.EMPTY) continue;
        const offsetY = world.blockSystem.offset(col, row);
        this.drawTile(ctx, tile, Math.round(col * s - cameraX), row * s + offsetY, s);
      }
    }
  }

  drawTile(ctx, tile, x, y, s) {
    if (tile === Tile.GROUND) {
      ctx.fillStyle = "#5b3f2c"; ctx.fillRect(x, y, s, s);
      ctx.fillStyle = "#76a943"; ctx.fillRect(x, y, s, 4);
      ctx.fillStyle = "#79543a"; ctx.fillRect(x + 3, y + 7, 5, 3);
    } else if (tile === Tile.BREAKABLE) {
      ctx.fillStyle = "#ba6a42"; ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
      ctx.fillStyle = "#e09a65"; ctx.fillRect(x + 2, y + 3, s - 4, 2);
      ctx.fillStyle = "#6f3b2c"; ctx.fillRect(x + 7, y + 1, 2, s - 2);
    } else if (tile === Tile.ITEM) {
      ctx.fillStyle = "#f0b934"; ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
      ctx.fillStyle = "#fff4a8"; ctx.fillRect(x + 6, y + 4, 4, 5); ctx.fillRect(x + 7, y + 11, 2, 2);
    } else if (tile === Tile.USED) {
      ctx.fillStyle = "#8b7353"; ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
      ctx.fillStyle = "#ae9978"; ctx.fillRect(x + 3, y + 3, s - 6, 2);
    } else if (tile === Tile.HAZARD) {
      ctx.fillStyle = "#c93f50";
      ctx.beginPath();
      ctx.moveTo(x, y + s); ctx.lineTo(x + s * .25, y + 3); ctx.lineTo(x + s * .5, y + s);
      ctx.lineTo(x + s * .75, y + 3); ctx.lineTo(x + s, y + s); ctx.fill();
    } else if (tile === Tile.ONE_WAY) {
      ctx.fillStyle = "#516b8a"; ctx.fillRect(x, y, s, 4);
      ctx.fillStyle = "#87a6c8"; ctx.fillRect(x + 2, y, s - 4, 2);
    }
  }

  drawEntities(ctx, world, cameraX, alpha) {
    const entities = world.entities;
    for (let i = 0; i < entities.length; i += 1) {
      const e = entities[i];
      if (!e.active || !e.visible) continue;
      const x = Math.round(lerp(e.prevX, e.x, alpha) - cameraX);
      const y = Math.round(lerp(e.prevY, e.y, alpha));
      if (x + e.width < -8 || x > this.canvas.width + 8) continue;

      if (e.kind === "enemy") this.drawEnemy(ctx, e, x, y);
      else if (e.kind === "item") this.drawItem(ctx, e, x, y);
    }
  }

  drawEnemy(ctx, e, x, y) {
    if (e.type === "walker") {
      ctx.fillStyle = "#593c73"; ctx.fillRect(x + 1, y + 3, e.width - 2, e.height - 4);
      ctx.fillStyle = "#d3b4f0"; ctx.fillRect(x + 3, y + 1, e.width - 6, 5);
      ctx.fillStyle = "#10151e"; ctx.fillRect(x + 4, y + 6, 2, 2); ctx.fillRect(x + 9, y + 6, 2, 2);
    } else if (e.type === "shell") {
      ctx.fillStyle = e.state === "SHELL_MOVING" ? "#f36f4a" : "#2f7d6d";
      ctx.fillRect(x + 1, y + 5, e.width - 2, e.height - 6);
      ctx.fillStyle = "#a7e0c1"; ctx.fillRect(x + 3, y + 2, e.width - 6, 7);
      if (e.state === "SHELL_IDLE") { ctx.fillStyle = "#16222b"; ctx.fillRect(x + 3, y + 9, e.width - 6, 3); }
    } else {
      ctx.fillStyle = "#7c4dff"; ctx.fillRect(x + 2, y + 3, e.width - 4, e.height - 4);
      ctx.fillStyle = "#d8ccff"; ctx.fillRect(x - 3, y + 5, 5, 3); ctx.fillRect(x + e.width - 2, y + 5, 5, 3);
    }
  }

  drawItem(ctx, e, x, y) {
    if (e.type === "shard") {
      ctx.fillStyle = "#f9f871";
      ctx.beginPath(); ctx.moveTo(x + 4, y); ctx.lineTo(x + e.width, y + 4); ctx.lineTo(x + 4, y + e.height); ctx.lineTo(x, y + 4); ctx.fill();
    } else {
      ctx.fillStyle = "#4ef2c2"; ctx.fillRect(x + 2, y + 2, e.width - 4, e.height - 4);
      ctx.fillStyle = "#e7fff8"; ctx.fillRect(x + 5, y, 4, e.height);
    }
  }

  drawPlayer(ctx, p, cameraX, alpha) {
    if (!p.visible) return;
    if (p.invulnerabilityTimer > 0 && Math.floor(p.invulnerabilityTimer * 18) % 2 === 0) return;
    const x = Math.round(lerp(p.prevX, p.x, alpha) - cameraX);
    const y = Math.round(lerp(p.prevY, p.y, alpha));
    ctx.fillStyle = p.power === "BOOST" ? "#ff6c6c" : "#243b80";
    ctx.fillRect(x + 2, y + 2, p.width - 4, p.height - 2);
    ctx.fillStyle = "#f4d6a0"; ctx.fillRect(x + 4, y + 1, p.width - 6, 6);
    ctx.fillStyle = "#10151e"; ctx.fillRect(x + (p.facing > 0 ? 9 : 4), y + 4, 2, 2);
    ctx.fillStyle = "#bce7ff"; ctx.fillRect(x + 2, y + p.height - 4, 4, 4); ctx.fillRect(x + p.width - 5, y + p.height - 4, 4, 4);
  }

  drawParticles(ctx, world, cameraX) {
    const active = world.particles.pool.active;
    ctx.fillStyle = "#fff1a6";
    for (let i = 0; i < active.length; i += 1) {
      const p = active[i];
      ctx.fillRect(Math.round(p.x - cameraX), Math.round(p.y), p.size, p.size);
    }
  }

  drawGoal(ctx, world, cameraX) {
    const goal = world.level.goal;
    if (!goal) return;
    const x = Math.round(goal.x - cameraX);
    if (x < -20 || x > this.canvas.width + 20) return;
    ctx.fillStyle = "#d9edf6"; ctx.fillRect(x + 7, goal.y, 2, goal.height);
    ctx.fillStyle = "#38d6c2"; ctx.fillRect(x + 9, goal.y + 5, 13, 8);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(x + 4, goal.y - 3, 8, 5);
  }
}
