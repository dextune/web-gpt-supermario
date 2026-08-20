import { Entity } from "../engine/Entity.js";

export class Item extends Entity {
  constructor(type, x, y) {
    const size = type === "powerCore" ? 14 : 9;
    super("item", x, y, size, size);
    this.type = type;
    this.age = 0;
    this.spawnY = y;
    this.emerging = false;
    this.emergeTargetY = y;
    this.direction = 1;
    if (type === "powerCore") {
      this.gravity = 900;
      this.maxFallSpeed = 320;
      this.vx = 34;
    }
  }

  startEmerging(distance = 16) {
    this.emerging = true;
    this.emergeTargetY = this.y - distance;
    this.vx = 0;
    this.vy = -24;
  }

  update(dt) {
    this.age += dt;
    if (this.emerging && this.y <= this.emergeTargetY) {
      this.y = this.emergeTargetY;
      this.emerging = false;
      this.vy = 0;
      if (this.type === "powerCore") this.vx = 34 * this.direction;
    }
  }
}
