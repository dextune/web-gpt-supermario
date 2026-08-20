import { ObjectPool } from "../core/ObjectPool.js";

function makeParticle() {
  return { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0.45, size: 2 };
}

export class ParticleSystem {
  constructor() {
    this.pool = new ObjectPool(makeParticle, 64);
  }

  burst(x, y, count = 6) {
    for (let i = 0; i < count; i += 1) {
      const p = this.pool.acquire();
      const angle = (i / count) * Math.PI * 2;
      const speed = 35 + (i % 3) * 13;
      p.x = x; p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 25;
      p.life = 0;
      p.maxLife = 0.32 + (i % 4) * 0.05;
      p.size = 1 + (i % 2);
    }
  }

  update(dt) {
    const active = this.pool.active;
    for (let i = active.length - 1; i >= 0; i -= 1) {
      const p = active[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.pool.releaseAt(i);
        continue;
      }
      p.vy += 260 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  clear() { this.pool.clear(); }
}
