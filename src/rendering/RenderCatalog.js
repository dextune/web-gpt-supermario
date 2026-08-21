import {
  drawFlierSprite,
  drawPowerCoreSprite,
  drawShardSprite,
  drawShellSprite,
  drawUnknownEntity,
  drawWalkerSprite,
} from "./PixelArt.js";

const ENTITY_DRAWERS = Object.freeze({
  "enemy:walker": drawWalkerSprite,
  "enemy:shell": drawShellSprite,
  "enemy:flier": drawFlierSprite,
  "item:shard": drawShardSprite,
  "item:powerCore": drawPowerCoreSprite,
});

export function drawEntitySprite(ctx, entity, x, y, time) {
  const draw = ENTITY_DRAWERS[`${entity.kind}:${entity.type}`] ?? drawUnknownEntity;
  draw(ctx, entity, x, y, time);
}
