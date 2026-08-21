import { Tile } from "../data/constants.js";
import { lerp } from "../utils/math.js";
import { BackgroundRenderer } from "./BackgroundRenderer.js";
import { drawEntitySprite } from "./RenderCatalog.js";
import { drawPlayerSprite } from "./PixelArt.js";
import { drawTileArt } from "./TileArt.js";

/** Canvas renderer. Gameplay entities expose state; visual interpretation stays in rendering modules. */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
    this.background = new BackgroundRenderer();
  }

  render(world, alpha) {
    const ctx = this.ctx;
    const cameraX = lerp(world.camera.prevX, world.camera.x, alpha);
    const visualTime = performance.now() * 0.001;
    this.background.draw(ctx, this.canvas.width, this.canvas.height, cameraX, visualTime);
    this.drawTiles(ctx, world, cameraX, visualTime);
    this.drawGoal(ctx, world, cameraX, visualTime);
    this.drawEntities(ctx, world, cameraX, alpha, visualTime);
    this.drawPlayer(ctx, world.player, cameraX, alpha, visualTime);
    this.drawParticles(ctx, world, cameraX);
  }

  drawTiles(ctx, world, cameraX, visualTime) {
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
        const x = Math.round(col * s - cameraX);
        const y = Math.round(row * s + offsetY);
        drawTileArt(ctx, map, tile, col, row, x, y, s, visualTime);
      }
    }
  }

  drawEntities(ctx, world, cameraX, alpha, visualTime) {
    const entities = world.entities;
    for (let i = 0; i < entities.length; i += 1) {
      const entity = entities[i];
      if (!entity.active || !entity.visible) continue;
      const x = Math.round(lerp(entity.prevX, entity.x, alpha) - cameraX);
      const y = Math.round(lerp(entity.prevY, entity.y, alpha));
      if (x + entity.width < -24 || x > this.canvas.width + 24) continue;
      drawEntitySprite(ctx, entity, x, y, visualTime);
    }
  }

  drawPlayer(ctx, player, cameraX, alpha, visualTime) {
    if (!player.visible) return;
    if (player.invulnerabilityTimer > 0 && Math.floor(player.invulnerabilityTimer * 18) % 2 === 0) return;
    const x = Math.round(lerp(player.prevX, player.x, alpha) - cameraX);
    const y = Math.round(lerp(player.prevY, player.y, alpha));
    drawPlayerSprite(ctx, player, x, y, visualTime);
  }

  drawParticles(ctx, world, cameraX) {
    const active = world.particles.pool.active;
    for (let i = 0; i < active.length; i += 1) {
      const particle = active[i];
      const life = particle.maxLife > 0 ? particle.life / particle.maxLife : 1;
      ctx.fillStyle = life < 0.45 ? "#fff3a3" : life < 0.75 ? "#f0c55c" : "#d78e45";
      const x = Math.round(particle.x - cameraX);
      const y = Math.round(particle.y);
      ctx.fillRect(x, y, particle.size + 1, particle.size + 1);
      if (particle.size > 1 && life < 0.55) {
        ctx.fillStyle = "#fffbd5";
        ctx.fillRect(x + 1, y, 1, 1);
      }
    }
  }

  drawGoal(ctx, world, cameraX, visualTime) {
    const goal = world.level.goal;
    if (!goal) return;
    const x = Math.round(goal.x - cameraX);
    if (x < -28 || x > this.canvas.width + 28) return;
    const y = Math.round(goal.y);
    const h = goal.height;
    const pulse = Math.floor(visualTime * 5) & 1;

    ctx.fillStyle = "#102334";
    ctx.fillRect(x + 6, y + 2, 5, h - 2);
    ctx.fillStyle = "#bfd9df";
    ctx.fillRect(x + 7, y + 1, 2, h - 1);
    ctx.fillStyle = "#f1fbff";
    ctx.fillRect(x + 7, y, 4, 3);
    ctx.fillStyle = "#142b3e";
    ctx.fillRect(x + 2, y + h - 5, 14, 5);
    ctx.fillStyle = "#2c6e77";
    ctx.fillRect(x + 4, y + h - 7, 10, 2);

    ctx.fillStyle = "#0d4051";
    ctx.fillRect(x + 10, y + 6, 18, 11);
    ctx.fillStyle = pulse ? "#45efcf" : "#32cbb7";
    ctx.fillRect(x + 12, y + 8, 14, 7);
    ctx.fillStyle = "#d9fff6";
    ctx.fillRect(x + 13, y + 9, 4, 2);
    ctx.fillStyle = "#f3d76e";
    ctx.fillRect(x + 22, y + 10, 2, 3);
  }
}
