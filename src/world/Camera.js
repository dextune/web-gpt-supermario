import { clamp } from "../utils/math.js";

export class Camera {
  constructor(viewWidth, viewHeight, config) {
    this.x = 0;
    this.y = 0;
    this.prevX = 0;
    this.prevY = 0;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.config = config;
    this.worldWidth = viewWidth;
    this.worldHeight = viewHeight;
    this.lookAhead = 0;
    this.trauma = 0;
    this.shakePhase = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.prevShakeX = 0;
    this.prevShakeY = 0;
  }

  setBounds(width, height) {
    this.worldWidth = width;
    this.worldHeight = height;
  }

  snapTo(target) {
    this.lookAhead = 0;
    this.x = clamp(target.centerX - this.viewWidth * 0.38, 0, Math.max(0, this.worldWidth - this.viewWidth));
    this.prevX = this.x;
    this.y = 0;
    this.prevY = 0;
  }

  addTrauma(amount) {
    this.trauma = clamp(this.trauma + amount, 0, 1);
  }

  update(target, dt) {
    this.prevX = this.x;
    this.prevY = this.y;
    this.prevShakeX = this.shakeX;
    this.prevShakeY = this.shakeY;

    const speedRatio = clamp(Math.abs(target.vx) / 120, 0, 1);
    const direction = target.vx === 0 ? target.facing : Math.sign(target.vx);
    const targetLookAhead = direction * this.config.lookAhead * speedRatio;
    const lookResponse = 1 - Math.exp(-this.config.lookAheadCatchUp * dt);
    this.lookAhead += (targetLookAhead - this.lookAhead) * lookResponse;

    const screenX = target.centerX - this.x;
    let desired = this.x;
    if (screenX > this.config.deadZoneRight) {
      desired += screenX - this.config.deadZoneRight;
    } else if (screenX < this.config.deadZoneLeft) {
      desired += screenX - this.config.deadZoneLeft;
    }
    desired += this.lookAhead;

    const response = 1 - Math.exp(-this.config.catchUp * dt);
    this.x += (desired - this.x) * response;
    this.x = clamp(this.x, 0, Math.max(0, this.worldWidth - this.viewWidth));
    this.y = 0;

    this.trauma = Math.max(0, this.trauma - this.config.shakeDecay * dt);
    this.shakePhase += dt * 38;
    const amplitude = this.config.maxShake * this.trauma * this.trauma;
    this.shakeX = Math.sin(this.shakePhase * 1.7) * amplitude;
    this.shakeY = Math.cos(this.shakePhase * 2.3 + 0.8) * amplitude * 0.72;
  }
}
