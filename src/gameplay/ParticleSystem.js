import { ObjectPool } from "../core/ObjectPool.js";

const PALETTE = Object.freeze({
  dustA: "#e6d4a8",
  dustB: "#b88c61",
  sparkA: "#fff6b0",
  sparkB: "#f1b94d",
  tealA: "#b7fff1",
  tealB: "#32d9bb",
  hitA: "#ffd7d1",
  hitB: "#f05f62",
  debrisA: "#e5905d",
  debrisB: "#7c4131",
});

function makeParticle() {
  return {
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 0.45,
    size: 2,
    endSize: 0,
    gravity: 260,
    drag: 0,
    colorA: PALETTE.sparkA,
    colorB: PALETTE.sparkB,
    shape: 0,
  };
}

export class ParticleSystem {
  constructor() {
    this.pool = new ObjectPool(makeParticle, 96);
  }

  emit(x, y, vx, vy, life, size, endSize, gravity, drag, colorA, colorB, shape = 0) {
    const p = this.pool.acquire();
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = 0;
    p.maxLife = life;
    p.size = size;
    p.endSize = endSize;
    p.gravity = gravity;
    p.drag = drag;
    p.colorA = colorA;
    p.colorB = colorB;
    p.shape = shape;
    return p;
  }

  burst(x, y, count = 6) {
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 34 + (i % 3) * 14;
      this.emit(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed - 24,
        0.32 + (i % 4) * 0.05, 1 + (i % 2), 0, 260, 0, PALETTE.sparkA, PALETTE.sparkB);
    }
  }

  collect(x, y) {
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 42 + (i & 1) * 12;
      this.emit(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed,
        0.28, i & 1 ? 2 : 1, 0, 0, 2.6, PALETTE.sparkA, PALETTE.tealA, 1);
    }
  }

  land(x, y, hard = false) {
    const count = hard ? 8 : 5;
    for (let i = 0; i < count; i += 1) {
      const side = i & 1 ? 1 : -1;
      const speed = 18 + (i % 4) * 8;
      this.emit(x + side * (2 + (i % 3)), y, side * speed, -10 - (i % 3) * 5,
        0.26 + (i % 2) * 0.05, hard ? 2 : 1, 1, 45, 4.4, PALETTE.dustA, PALETTE.dustB);
    }
  }

  skid(x, y, direction) {
    const side = direction || 1;
    for (let i = 0; i < 2; i += 1) {
      this.emit(x, y - i, -side * (18 + i * 9), -7 - i * 5,
        0.24, 1 + i, 0, 30, 5, PALETTE.dustA, PALETTE.dustB);
    }
  }

  stomp(x, y) {
    for (let i = 0; i < 7; i += 1) {
      const spread = (i - 3) / 3;
      this.emit(x, y, spread * 58, -24 - Math.abs(spread) * 12,
        0.24, i === 3 ? 3 : 2, 0, 120, 0, PALETTE.tealA, PALETTE.tealB, 1);
    }
  }

  damage(x, y) {
    for (let i = 0; i < 10; i += 1) {
      const angle = (i / 10) * Math.PI * 2;
      this.emit(x, y, Math.cos(angle) * 62, Math.sin(angle) * 48 - 18,
        0.3, 2, 0, 80, 0, PALETTE.hitA, PALETTE.hitB, 1);
    }
  }

  block(x, y, broken = false) {
    const count = broken ? 10 : 5;
    for (let i = 0; i < count; i += 1) {
      const spread = (i - (count - 1) * 0.5) / Math.max(1, count - 1);
      this.emit(x, y, spread * 76, -46 - (i % 3) * 18,
        broken ? 0.46 : 0.26, broken ? 2 + (i & 1) : 1, 0,
        broken ? 280 : 150, 0,
        broken ? PALETTE.debrisA : PALETTE.sparkA,
        broken ? PALETTE.debrisB : PALETTE.sparkB);
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
      const damping = Math.max(0, 1 - p.drag * dt);
      p.vx *= damping;
      p.vy *= damping;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  clear() {
    this.pool.clear();
  }
}
