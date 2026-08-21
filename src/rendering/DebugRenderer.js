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
    const player = world.player;
    const camera = world.camera;
    let activeCount = 0;
    for (let i = 0; i < world.entities.length; i += 1) {
      const entity = world.entities[i];
      if (entity.active && entity.simulationActive !== false) activeCount += 1;
    }

    ctx.save();
    ctx.font = "8px monospace";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#06111ee8";
    ctx.fillRect(4, 28, 170, 61);
    ctx.fillStyle = "#dffcff";
    ctx.fillText(`FPS ${this.fps.toFixed(1)}  FT ${(this.frameTime * 1000).toFixed(2)}ms`, 8, 32);
    ctx.fillText(`ENT ${world.entities.length} ACTIVE ${activeCount}`, 8, 42);
    ctx.fillText(`CAM ${camera.x.toFixed(1)},${camera.y.toFixed(1)}`, 8, 52);
    ctx.fillText(`P ${player.x.toFixed(1)},${player.y.toFixed(1)} V ${player.vx.toFixed(1)},${player.vy.toFixed(1)}`, 8, 62);
    ctx.fillText(`${player.state} G:${player.grounded ? 1 : 0} POW:${player.power}`, 8, 72);
    ctx.strokeStyle = "#ff4edb";
    ctx.strokeRect(Math.round(player.x - camera.x) + .5, Math.round(player.y) + .5, player.width - 1, player.height - 1);
    ctx.restore();
  }
}
