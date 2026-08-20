import { Action } from "../data/constants.js";

const ACTIONS = Object.values(Action);
const INDEX = Object.freeze(Object.fromEntries(ACTIONS.map((name, index) => [name, index])));

const KEY_BINDINGS = Object.freeze({
  ArrowLeft: Action.LEFT, KeyA: Action.LEFT,
  ArrowRight: Action.RIGHT, KeyD: Action.RIGHT,
  ArrowUp: Action.UP, KeyW: Action.UP,
  ArrowDown: Action.DOWN, KeyS: Action.DOWN,
  KeyZ: Action.JUMP, Space: Action.JUMP,
  KeyX: Action.RUN, ShiftLeft: Action.RUN, ShiftRight: Action.RUN,
  Escape: Action.PAUSE, KeyP: Action.PAUSE,
  Enter: Action.START, KeyR: Action.RESTART, F2: Action.DEBUG,
});

export class InputManager {
  constructor(root = window) {
    this.root = root;
    this.held = new Uint8Array(ACTIONS.length);
    this.pressed = new Uint8Array(ACTIONS.length);
    this.released = new Uint8Array(ACTIONS.length);
    this.keyboardHeld = new Uint8Array(ACTIONS.length);
    this.touchHeld = new Uint8Array(ACTIONS.length);
    this.gamepadHeld = new Uint8Array(ACTIONS.length);
    this.disposers = [];
    this.onKeyDown = (event) => this.setKey(event, true);
    this.onKeyUp = (event) => this.setKey(event, false);
  }

  initialize(touchRoot = document) {
    this.root.addEventListener("keydown", this.onKeyDown, { passive: false });
    this.root.addEventListener("keyup", this.onKeyUp, { passive: false });
    this.disposers.push(() => this.root.removeEventListener("keydown", this.onKeyDown));
    this.disposers.push(() => this.root.removeEventListener("keyup", this.onKeyUp));

    for (const button of touchRoot.querySelectorAll("[data-action]")) {
      const action = button.dataset.action;
      if (!(action in INDEX)) continue;
      const down = (event) => {
        event.preventDefault();
        button.setPointerCapture?.(event.pointerId);
        this.setSource(this.touchHeld, action, true);
      };
      const up = (event) => {
        event.preventDefault();
        this.setSource(this.touchHeld, action, false);
      };
      button.addEventListener("pointerdown", down);
      button.addEventListener("pointerup", up);
      button.addEventListener("pointercancel", up);
      this.disposers.push(() => {
        button.removeEventListener("pointerdown", down);
        button.removeEventListener("pointerup", up);
        button.removeEventListener("pointercancel", up);
      });
    }
  }

  setKey(event, isDown) {
    const action = KEY_BINDINGS[event.code];
    if (!action) return;
    if ([Action.LEFT, Action.RIGHT, Action.UP, Action.DOWN, Action.JUMP, Action.RUN, Action.PAUSE, Action.START].includes(action)) {
      event.preventDefault();
    }
    this.setSource(this.keyboardHeld, action, isDown);
  }

  setSource(source, action, isDown) {
    const index = INDEX[action];
    source[index] = isDown ? 1 : 0;
    this.reconcile(index);
  }

  reconcile(index) {
    const next = (this.keyboardHeld[index] | this.touchHeld[index] | this.gamepadHeld[index]) ? 1 : 0;
    const previous = this.held[index];
    if (next && !previous) this.pressed[index] = 1;
    if (!next && previous) this.released[index] = 1;
    this.held[index] = next;
  }

  pollGamepads() {
    if (!navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    const pad = pads && pads[0];
    const left = pad ? (pad.axes[0] < -0.35 || pad.buttons[14]?.pressed) : false;
    const right = pad ? (pad.axes[0] > 0.35 || pad.buttons[15]?.pressed) : false;
    const down = pad ? (pad.axes[1] > 0.35 || pad.buttons[13]?.pressed) : false;
    const jump = pad ? Boolean(pad.buttons[0]?.pressed) : false;
    const run = pad ? Boolean(pad.buttons[2]?.pressed || pad.buttons[5]?.pressed) : false;
    const pause = pad ? Boolean(pad.buttons[9]?.pressed) : false;
    this.setGamepad(Action.LEFT, left);
    this.setGamepad(Action.RIGHT, right);
    this.setGamepad(Action.DOWN, down);
    this.setGamepad(Action.JUMP, jump);
    this.setGamepad(Action.RUN, run);
    this.setGamepad(Action.PAUSE, pause);
  }

  setGamepad(action, isDown) {
    const index = INDEX[action];
    const value = isDown ? 1 : 0;
    if (this.gamepadHeld[index] === value) return;
    this.gamepadHeld[index] = value;
    this.reconcile(index);
  }

  isHeld(action) { return this.held[INDEX[action]] === 1; }
  wasPressed(action) { return this.pressed[INDEX[action]] === 1; }
  wasReleased(action) { return this.released[INDEX[action]] === 1; }

  endFrame() {
    this.pressed.fill(0);
    this.released.fill(0);
  }

  destroy() {
    for (const dispose of this.disposers) dispose();
    this.disposers.length = 0;
    this.held.fill(0);
    this.pressed.fill(0);
    this.released.fill(0);
  }
}
