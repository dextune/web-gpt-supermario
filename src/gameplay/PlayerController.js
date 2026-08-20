import { Action } from "../data/constants.js";
import { PLAYER_CONFIG as C } from "../data/playerConfig.js";
import { clamp, moveToward } from "../utils/math.js";

export class PlayerController {
  update(player, input, dt) {
    if (player.dead || player.locked) return;

    const left = input.isHeld(Action.LEFT);
    const right = input.isHeld(Action.RIGHT);
    const direction = left === right ? 0 : right ? 1 : -1;
    const running = input.isHeld(Action.RUN);

    if (input.wasPressed(Action.JUMP)) player.jumpBufferTimer = C.jumpBufferTime;
    else player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - dt);

    if (player.grounded) player.coyoteTimer = C.coyoteTime;
    else player.coyoteTimer = Math.max(0, player.coyoteTimer - dt);

    if (direction !== 0) {
      const maxSpeed = running ? C.runMaxSpeed : C.walkMaxSpeed;
      const sameDirection = player.vx === 0 || Math.sign(player.vx) === direction;
      const acceleration = player.grounded
        ? (sameDirection ? (running ? C.runAcceleration : C.walkAcceleration) : C.turnAcceleration)
        : C.airAcceleration;
      player.vx = moveToward(player.vx, direction * maxSpeed, acceleration * dt);
      player.facing = direction;
      player.skidding = player.grounded && !sameDirection && Math.abs(player.vx) > C.skidThreshold;
    } else {
      const decel = player.grounded ? C.groundDeceleration : C.airDeceleration;
      player.vx = moveToward(player.vx, 0, decel * dt);
      player.skidding = false;
    }

    if (player.jumpBufferTimer > 0 && player.coyoteTimer > 0) {
      player.vy = C.jumpVelocity;
      player.grounded = false;
      player.coyoteTimer = 0;
      player.jumpBufferTimer = 0;
      player.setState("JUMP");
    }

    if (input.wasReleased(Action.JUMP) && player.vy < 0) {
      player.vy *= C.jumpCutMultiplier;
    }

    const rising = player.vy < 0;
    const holdingJump = input.isHeld(Action.JUMP);
    const gravity = rising ? (holdingJump ? C.heldJumpGravity : C.gravity) : C.fallGravity;
    player.vy = clamp(player.vy + gravity * dt, -1000, C.maxFallSpeed);

    if (!player.grounded) player.setState(player.vy < 0 ? "JUMP" : "FALL");
    else if (player.skidding) player.setState("SKID");
    else if (Math.abs(player.vx) < 3) player.setState("IDLE");
    else player.setState(running && Math.abs(player.vx) > C.walkMaxSpeed * 0.88 ? "RUN" : "WALK");
  }
}
