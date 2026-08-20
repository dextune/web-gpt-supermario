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
  }

  setBounds(width, height) {
    this.worldWidth = width;
    this.worldHeight = height;
  }

  snapTo(target) {
    this.x = clamp(target.centerX - this.viewWidth * 0.38, 0, Math.max(0, this.worldWidth - this.viewWidth));
    this.prevX = this.x;
  }

  update(target, dt) {
    this.prevX = this.x;
    this.prevY = this.y;

    const screenX = target.centerX - this.x;
    const direction = target.vx === 0 ? 0 : Math.sign(target.vx);
    let desired = this.x;

    if (screenX > this.config.deadZoneRight) {
      desired += screenX - this.config.deadZoneRight;
    } else if (screenX < this.config.deadZoneLeft) {
      desired += screenX - this.config.deadZoneLeft;
    }

    if (direction > 0) desired += this.config.lookAhead;
    const response = 1 - Math.exp(-this.config.catchUp * dt);
    this.x += (desired - this.x) * response;
    this.x = clamp(this.x, 0, Math.max(0, this.worldWidth - this.viewWidth));
    this.y = 0;
  }
}
