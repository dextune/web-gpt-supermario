import { Entity } from "../engine/Entity.js";
import { PLAYER_CONFIG as C } from "../data/playerConfig.js";
import { StateMachine } from "../core/StateMachine.js";

const NOOP_STATE = Object.freeze({
  enter() {},
  update() {},
  exit() {},
  handleInput() {},
});

const PLAYER_STATES = Object.freeze({
  IDLE: NOOP_STATE,
  WALK: NOOP_STATE,
  RUN: NOOP_STATE,
  SKID: NOOP_STATE,
  JUMP: NOOP_STATE,
  FALL: NOOP_STATE,
  CROUCH: NOOP_STATE,
  HIT: NOOP_STATE,
  POWER_UP: NOOP_STATE,
  POWER_DOWN: NOOP_STATE,
  DEAD: NOOP_STATE,
  FLAG: NOOP_STATE,
  PIPE: NOOP_STATE,
  LOCKED: NOOP_STATE,
});

export class Player extends Entity {
  constructor(x, y) {
    super("player", x, y, C.width, C.height);
    this.fsm = new StateMachine(this, PLAYER_STATES, "IDLE");
    this.facing = 1;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.invulnerabilityTimer = 0;
    this.power = "NORMAL";
    this.locked = false;
    this.dead = false;
    this.deathTimer = 0;
    this.skidding = false;
    this.gravity = C.gravity;
    this.maxFallSpeed = C.maxFallSpeed;
  }

  get state() {
    return this.fsm.currentName;
  }

  setState(next) {
    this.fsm.set(next);
  }

  applyPower(collisionSystem) {
    if (this.power !== "NORMAL") return false;
    const nextHeight = C.poweredHeight;
    const nextY = this.y + this.height - nextHeight;
    if (!collisionSystem.canFit(this.x, nextY, this.width, nextHeight)) return false;
    this.y = nextY;
    this.height = nextHeight;
    this.power = "BOOST";
    return true;
  }

  damage() {
    if (this.invulnerabilityTimer > 0 || this.dead) return "ignored";
    if (this.power !== "NORMAL") {
      const feet = this.y + this.height;
      this.power = "NORMAL";
      this.height = C.height;
      this.y = feet - this.height;
      this.invulnerabilityTimer = C.invulnerabilityTime;
      return "downgraded";
    }
    this.die();
    return "dead";
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.locked = true;
    this.grounded = false;
    this.vx = 0;
    this.vy = C.deathVelocity;
    this.deathTimer = 1.45;
    this.setState("DEAD");
  }
}
