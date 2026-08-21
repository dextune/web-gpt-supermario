import assert from "node:assert/strict";
import fs from "node:fs";
import { Tile } from "../src/data/constants.js";
import { TileMap } from "../src/world/TileMap.js";
import { CollisionSystem } from "../src/engine/systems/CollisionSystem.js";
import { Entity } from "../src/engine/Entity.js";
import { EntityFactory } from "../src/gameplay/factories/EntityFactory.js";
import { LevelLoader } from "../src/world/LevelLoader.js";
import { Player } from "../src/gameplay/Player.js";
import { Camera } from "../src/world/Camera.js";

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
assert.ok(level.entities.length >= 20);
assert.ok(level.decorations.length >= 20);
assert.equal(level.tileMap.get(10, 9), Tile.ITEM);
assert.equal(level.tileMap.getBlockPayload(12, 9).type, "powerCore");

const player = new Player(0, 0);
player.grounded = true;
player.vx = 45;
player.finalizeMovement(1 / 60, true, 0);
assert.equal(player.state, "WALK");
player.grounded = false;
player.vy = -80;
player.finalizeMovement(1 / 60, true, 0);
assert.equal(player.state, "JUMP");
player.grounded = true;
player.vy = 0;
player.finalizeMovement(1 / 60, false, 240);
assert.equal(player.state, "LAND");

const camera = new Camera(320, 240, {deadZoneLeft:108,deadZoneRight:194,lookAhead:42,lookAheadCatchUp:5.8,catchUp:8.2,shakeDecay:3.8,maxShake:3.2});
camera.setBounds(2880, 240);
camera.addTrauma(0.5);
camera.update({ centerX: 200, vx: 100, facing: 1 }, 1 / 60);
assert.ok(Math.abs(camera.shakeX) > 0 || Math.abs(camera.shakeY) > 0);
assert.ok(camera.lookAhead > 0);

console.log("smoke tests passed");
