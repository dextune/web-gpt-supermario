export class DebugRenderer {
  constructor(renderer) {
    this.renderer = renderer;
    this.enabled = false;
    this.frameTime = 0;
    this.fps = 0;
  }

  toggle() { this.enabled = !this.enabled; }

  updateFrameTime(frameTime) {
    this.frameTime = frameTime;
    if (frameTime > 0) this.fps = this.fps * 0.9 + (1 / frameTime) * 0.1;
  }

  render(world) {
    if (!this.enabled || !world) return;
    const ctx = this.renderer.ctx;
    const p = world.player;
    const cam = world.camera;
    ctx.save();
    ctx.font = "8px monospace";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#000c";
    ctx.fillRect(3, 27, 145, 59);
    ctx.fillStyle = "#eaffff";
    ctx.fillText(`FPS ${this.fps.toFixed(1)}  FT ${(this.frameTime * 1000).toFixed(2)}ms`, 6, 30);
    ctx.fillText(`ENT ${world.entities.length} ACTIVE ${world.entities.filter(e => e.active && e.simulationActive !== false).length}`, 6, 40);
    ctx.fillText(`CAM ${cam.x.toFixed(1)},${cam.y.toFixed(1)}`, 6, 50);
    ctx.fillText(`P ${p.x.toFixed(1)},${p.y.toFixed(1)} V ${p.vx.toFixed(1)},${p.vy.toFixed(1)}`, 6, 60);
    ctx.fillText(`${p.state} G:${p.grounded ? 1 : 0} POW:${p.power}`, 6, 70);
    ctx.strokeStyle = "#ff38d1";
    ctx.strokeRect(Math.round(p.x - cam.x) + .5, Math.round(p.y) + .5, p.width - 1, p.height - 1);
    ctx.restore();
  }
}
