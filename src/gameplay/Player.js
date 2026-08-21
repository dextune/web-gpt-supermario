import { Entity } from "../engine/Entity.js";
import { PLAYER_CONFIG as C } from "../data/playerConfig.js";
import { StateMachine } from "../core/StateMachine.js";
import { PLAYER_STATES } from "./PlayerStates.js";

export class Player extends Entity {
  constructor(x, y) {
    super("player", x, y, C.width, C.height);
    this.stateTime = 0;
    this.animation = "idle";
    this.animationRate = 1;
    this.fsm = new StateMachine(this, PLAYER_STATES, "IDLE");
    this.facing = 1;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.invulnerabilityTimer = 0;
    this.hitPoseTimer = 0;
    this.powerPoseTimer = 0;
    this.landingTimer = 0;
    this.skidDustTimer = 0;
    this.power = "NORMAL";
    this.locked = false;
    this.dead = false;
    this.deathTimer = 0;
    this.skidding = false;
    this.runningInput = false;
    this.controlDirection = 0;
    this.jumpStarted = false;
    this.justLanded = false;
    this.landingImpact = 0;
    this.gravity = C.gravity;
    this.maxFallSpeed = C.maxFallSpeed;
  }

  get state() {
    return this.fsm.currentName;
  }

  setState(next) {
    this.fsm.set(next);
  }

  finalizeMovement(dt, wasGrounded, impactVelocity) {
    this.justLanded = !wasGrounded && this.grounded && impactVelocity >= C.landingImpactThreshold;
    this.landingImpact = this.justLanded ? impactVelocity : 0;

    if (this.hitPoseTimer > 0) this.hitPoseTimer = Math.max(0, this.hitPoseTimer - dt);
    if (this.powerPoseTimer > 0) this.powerPoseTimer = Math.max(0, this.powerPoseTimer - dt);
    if (this.landingTimer > 0) this.landingTimer = Math.max(0, this.landingTimer - dt);

    if (this.dead) {
      this.setState("DEAD");
    } else if (this.locked) {
      // Goal/sequence code owns the locked state name.
    } else if (this.powerPoseTimer > 0) {
      this.setState("POWER_UP");
    } else if (this.hitPoseTimer > 0) {
      this.setState("HIT");
    } else if (!this.grounded) {
      this.landingTimer = 0;
      this.setState(this.vy < 0 ? "JUMP" : "FALL");
    } else if (this.justLanded && impactVelocity >= C.landingImpactThreshold) {
      this.landingTimer = C.landingLockTime;
      this.setState("LAND");
    } else if (this.landingTimer > 0) {
      this.setState("LAND");
    } else if (this.skidding) {
      this.setState("SKID");
    } else if (Math.abs(this.vx) < 3) {
      this.setState("IDLE");
    } else {
      const running = this.runningInput && Math.abs(this.vx) > C.walkMaxSpeed * 0.88;
      this.setState(running ? "RUN" : "WALK");
    }

    this.fsm.update(dt);
  }

  applyPower(collisionSystem) {
    if (this.power !== "NORMAL") return false;
    const nextHeight = C.poweredHeight;
    const nextY = this.y + this.height - nextHeight;
    if (!collisionSystem.canFit(this.x, nextY, this.width, nextHeight)) return false;
    this.y = nextY;
    this.height = nextHeight;
    this.power = "BOOST";
    this.powerPoseTimer = C.powerPoseTime;
    this.setState("POWER_UP");
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
      this.hitPoseTimer = C.hitPoseTime;
      this.setState("HIT");
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
