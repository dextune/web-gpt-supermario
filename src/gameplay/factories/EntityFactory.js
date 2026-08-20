import { Enemy } from "../Enemy.js";
import { Item } from "../Item.js";

export class EntityFactory {
  constructor() {
    this.registry = new Map();
    this.register("walker", (d) => new Enemy("walker", d.x, d.y));
    this.register("shell", (d) => new Enemy("shell", d.x, d.y));
    this.register("flier", (d) => new Enemy("flier", d.x, d.y));
    this.register("shard", (d) => new Item("shard", d.x, d.y));
    this.register("powerCore", (d) => new Item("powerCore", d.x, d.y));
  }

  register(type, creator) {
    this.registry.set(type, creator);
  }

  create(type, definition) {
    const creator = this.registry.get(type);
    if (!creator) throw new Error(`Unknown entity type: ${type}`);
    return creator(definition);
  }
}
