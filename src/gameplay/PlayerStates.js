function locomotionState(animation, animationRate = 1) {
  return Object.freeze({
    enter(player) {
      player.stateTime = 0;
      player.animation = animation;
      player.animationRate = animationRate;
    },
    update(player, dt) {
      player.stateTime += dt;
    },
    exit() {},
    handleInput() {},
  });
}

const LAND_STATE = Object.freeze({
  enter(player) {
    player.stateTime = 0;
    player.animation = "land";
    player.animationRate = 1;
  },
  update(player, dt) {
    player.stateTime += dt;
  },
  exit() {},
  handleInput() {},
});

export const PLAYER_STATES = Object.freeze({
  IDLE: locomotionState("idle", 1),
  WALK: locomotionState("walk", 1),
  RUN: locomotionState("run", 1.25),
  SKID: locomotionState("skid", 1),
  JUMP: locomotionState("jump", 1),
  FALL: locomotionState("fall", 1),
  LAND: LAND_STATE,
  CROUCH: locomotionState("crouch", 1),
  HIT: locomotionState("hit", 1),
  POWER_UP: locomotionState("power-up", 1),
  POWER_DOWN: locomotionState("power-down", 1),
  DEAD: locomotionState("dead", 1),
  FLAG: locomotionState("goal", 1),
  PIPE: locomotionState("locked", 1),
  LOCKED: locomotionState("locked", 1),
});
