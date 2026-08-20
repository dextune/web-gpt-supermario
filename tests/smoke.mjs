import assert from "node:assert/strict";
import fs from "node:fs";
import { Tile } from "../src/data/constants.js";
import { TileMap } from "../src/world/TileMap.js";
import { CollisionSystem } from "../src/engine/systems/CollisionSystem.js";
import { Entity } from "../src/engine/Entity.js";
import { EntityFactory } from "../src/gameplay/factories/EntityFactory.js";
import { LevelLoader } from "../src/world/LevelLoader.js";

const map = new TileMap(10, 5, 16);
for (let col = 0; col < 10; col += 1) map.set(col, 4, Tile.GROUND);

const body = new Entity("test", 20, 49, 14, 14);
body.vy = 120;
new CollisionSystem(map).move(body, 1 / 60);
assert.equal(body.grounded, true);
assert.equal(body.y, 50);
assert.equal(body.vy, 0);

const levelData = JSON.parse(fs.readFileSync(new URL("../assets/levels/demo.json", import.meta.url), "utf8"));
const level = new LevelLoader(new EntityFactory()).parse(levelData);
assert.equal(level.tileMap.width, 180);
assert.ok(level.entities.length >= 10);
assert.equal(level.tileMap.get(10, 9), Tile.ITEM);
assert.equal(level.tileMap.getBlockPayload(12, 9).type, "powerCore");

console.log("smoke tests passed");
