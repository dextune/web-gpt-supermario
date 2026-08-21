import { FIXED_DT, LOGICAL_HEIGHT, LOGICAL_WIDTH } from "../data/constants.js";

export const Config = Object.freeze({
  fixedDt: FIXED_DT,
  maxFrameTime: 0.25,
  maxCatchUpSteps: 8,
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  camera: {
    deadZoneLeft: 108,
    deadZoneRight: 194,
    lookAhead: 42,
    lookAheadCatchUp: 5.8,
    catchUp: 8.2,
    shakeDecay: 3.8,
    maxShake: 3.2,
  },
  debug: false,
  levelUrl: "./assets/levels/demo.json",
  initialLives: 3,
  levelTime: 300,
});
