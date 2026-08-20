import { Entity } from "../engine/Entity.js";
import { ENEMY_CONFIG } from "../data/enemyConfig.js";

export class Enemy extends Entity {
  constructor(type, x, y) {
    const config = ENEMY_CONFIG[type];
    super("enemy", x, y, config.width, config.height);
    this.type = type;
    this.config = config;
    this.direction = -1;
    this.state = type === "shell" ? "WALKING" : "WALKING";
    this.gravity = config.gravity ?? 0;
    this.maxFallSpeed = config.maxFallSpeed ?? 0;
    this.spawnX = x;
    this.spawnY = y;
    this.age = 0;
    this.score = config.score;
  }

  updateAI(dt) {
    this.age += dt;
    if (this.type === "flier") {
      this.x += this.direction * this.config.speed * dt;
      this.y = this.spawnY + Math.sin(this.age * this.config.frequency) * this.config.amplitude;
      return;
    }

    if (this.state === "SHELL_IDLE" || this.state === "DEAD") {
      this.vx = 0;
      return;
    }

    const speed = this.state === "SHELL_MOVING" ? this.config.shellSpeed : this.config.speed;
    this.vx = this.direction * speed;
  }

  postCollision() {
    if (this.collision.left || this.collision.right) this.direction *= -1;
  }

  stomp() {
    if (this.type !== "shell") {
      this.state = "DEAD";
      this.active = false;
      return "defeated";
    }
    if (this.state === "WALKING") {
      this.state = "SHELL_IDLE";
      this.vx = 0;
      return "shell_idle";
    }
    if (this.state === "SHELL_MOVING") {
      this.state = "SHELL_IDLE";
      this.vx = 0;
      return "shell_idle";
    }
    return "shell_idle";
  }

  kick(direction) {
    if (this.type !== "shell" || this.state !== "SHELL_IDLE") return false;
    this.state = "SHELL_MOVING";
    this.direction = direction || 1;
    this.vx = this.direction * this.config.shellSpeed;
    return true;
  }
}
