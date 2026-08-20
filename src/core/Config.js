import { FIXED_DT, LOGICAL_HEIGHT, LOGICAL_WIDTH } from "../data/constants.js";

export const Config = Object.freeze({
  fixedDt: FIXED_DT,
  maxFrameTime: 0.25,
  maxCatchUpSteps: 8,
  logicalWidth: LOGICAL_WIDTH,
  logicalHeight: LOGICAL_HEIGHT,
  camera: {
    deadZoneLeft: 84,
    deadZoneRight: 142,
    lookAhead: 28,
    catchUp: 7.5,
  },
  debug: false,
  levelUrl: "./assets/levels/demo.json",
  initialLives: 3,
  levelTime: 300,
});
