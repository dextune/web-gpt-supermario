import { TileMap } from "./TileMap.js";

export class LevelLoader {
  constructor(entityFactory) {
    this.entityFactory = entityFactory;
  }

  parse(data) {
    if (!Number.isInteger(data.width) || !Number.isInteger(data.height) || !Number.isInteger(data.tileSize)) {
      throw new Error("Level requires integer width, height, and tileSize");
    }
    const tileMap = new TileMap(data.width, data.height, data.tileSize);

    for (const rect of data.terrain ?? []) {
      for (let row = rect.y; row < rect.y + rect.h; row += 1) {
        for (let col = rect.x; col < rect.x + rect.w; col += 1) tileMap.set(col, row, rect.tile);
      }
    }

    for (const block of data.blocks ?? []) {
      tileMap.set(block.x, block.y, block.tile);
      if (block.payload) tileMap.setBlockPayload(block.x, block.y, block.payload);
    }

    const entities = [];
    for (const definition of data.entities ?? []) {
      entities.push(this.entityFactory.create(definition.type, definition));
    }

    return {
      name: data.name ?? "Untitled",
      tileMap,
      spawn: data.spawn ?? { x: 32, y: 180 },
      goal: data.goal ?? null,
      entities,
      checkpoints: data.checkpoints ?? [],
      time: data.time ?? 300,
    };
  }
}
