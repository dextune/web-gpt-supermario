import { ObjectPool } from "../core/ObjectPool.js";

function makeLabel() {
  return { active: false, x: 0, y: 0, vy: -22, life: 0, maxLife: 0.72, text: "", color: "#fff6b0" };
}

export class FloatingTextSystem {
  constructor() {
    this.pool = new ObjectPool(makeLabel, 24);
  }

  spawn(x, y, text, color = "#fff6b0") {
    const label = this.pool.acquire();
    label.x = x;
    label.y = y;
    label.vy = -22;
    label.life = 0;
    label.maxLife = 0.72;
    label.text = text;
    label.color = color;
  }

  update(dt) {
    const active = this.pool.active;
    for (let i = active.length - 1; i >= 0; i -= 1) {
      const label = active[i];
      label.life += dt;
      if (label.life >= label.maxLife) {
        this.pool.releaseAt(i);
        continue;
      }
      label.y += label.vy * dt;
      label.vy *= Math.max(0, 1 - dt * 3.5);
    }
  }

  clear() {
    this.pool.clear();
  }
}
