export class SpawnManager {
  constructor(margin = 96) {
    this.margin = margin;
  }

  update(entities, camera) {
    const minX = camera.x - this.margin;
    const maxX = camera.x + camera.viewWidth + this.margin;
    for (let i = 0; i < entities.length; i += 1) {
      const entity = entities[i];
      if (entity.state === "DEAD") continue;
      entity.simulationActive = entity.x + entity.width >= minX && entity.x <= maxX;
    }
  }
}
