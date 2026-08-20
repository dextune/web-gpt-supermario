export class GameLoop {
  constructor({ fixedDt, maxFrameTime = 0.25, maxCatchUpSteps = 8, update, render }) {
    this.fixedDt = fixedDt;
    this.maxFrameTime = maxFrameTime;
    this.maxCatchUpSteps = maxCatchUpSteps;
    this.update = update;
    this.render = render;
    this.accumulator = 0;
    this.lastTime = 0;
    this.running = false;
    this.rafId = 0;
    this.boundFrame = (time) => this.frame(time);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now() / 1000;
    this.rafId = requestAnimationFrame(this.boundFrame);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.accumulator = 0;
  }

  frame(nowMs) {
    if (!this.running) return;
    const now = nowMs / 1000;
    const frameTime = Math.min(this.maxFrameTime, Math.max(0, now - this.lastTime));
    this.lastTime = now;
    this.accumulator += frameTime;

    let steps = 0;
    while (this.accumulator >= this.fixedDt && steps < this.maxCatchUpSteps) {
      this.update(this.fixedDt);
      this.accumulator -= this.fixedDt;
      steps += 1;
    }

    if (steps === this.maxCatchUpSteps) this.accumulator = 0;
    this.render(this.accumulator / this.fixedDt, frameTime);
    this.rafId = requestAnimationFrame(this.boundFrame);
  }
}
