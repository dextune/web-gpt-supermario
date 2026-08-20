import { Event, Tile } from "../data/constants.js";

export class BlockSystem {
  constructor(tileMap, world) {
    this.tileMap = tileMap;
    this.world = world;
    this.bounces = [];
  }

  hit(col, row, player) {
    const tile = this.tileMap.get(col, row);
    if (tile !== Tile.BREAKABLE && tile !== Tile.ITEM) return;

    this.startBounce(col, row);

    if (tile === Tile.BREAKABLE && player.power !== "NORMAL") {
      this.tileMap.set(col, row, Tile.EMPTY);
      this.world.particles.burst(col * this.tileMap.tileSize + 8, row * this.tileMap.tileSize + 8, 8);
      this.world.events.emit(Event.BLOCK_BROKEN, { score: 50 });
      return;
    }

    if (tile === Tile.ITEM) {
      this.tileMap.set(col, row, Tile.USED);
      const payload = this.tileMap.getBlockPayload(col, row) ?? { type: "shard" };
      this.world.spawnFromBlock(payload.type, col, row);
    }

    this.world.bumpEnemiesAbove(col, row);
  }

  startBounce(col, row) {
    this.bounces.push({ col, row, time: 0, duration: 0.16 });
  }

  update(dt) {
    for (let i = this.bounces.length - 1; i >= 0; i -= 1) {
      const bounce = this.bounces[i];
      bounce.time += dt;
      if (bounce.time >= bounce.duration) this.bounces.splice(i, 1);
    }
  }

  offset(col, row) {
    for (let i = 0; i < this.bounces.length; i += 1) {
      const bounce = this.bounces[i];
      if (bounce.col !== col || bounce.row !== row) continue;
      const t = bounce.time / bounce.duration;
      return -Math.sin(t * Math.PI) * 4;
    }
    return 0;
  }
}
