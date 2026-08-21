import { Tile } from "../data/constants.js";

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function variation(col, row) {
  return ((col * 17 + row * 31) ^ (col << 2)) & 3;
}

function drawGround(ctx, map, col, row, x, y, s) {
  const topOpen = map.get(col, row - 1) === Tile.EMPTY || map.get(col, row - 1) === Tile.ONE_WAY;
  const leftOpen = map.get(col - 1, row) !== Tile.GROUND;
  const rightOpen = map.get(col + 1, row) !== Tile.GROUND;
  rect(ctx, x, y, s, s, "#573c31");
  rect(ctx, x, y, s, 2, topOpen ? "#b8d45e" : "#72513a");
  if (topOpen) {
    rect(ctx, x, y + 2, s, 2, "#78aa48");
    rect(ctx, x + 2, y + 4, s - 4, 2, "#5e8f3b");
    const v = variation(col, row);
    rect(ctx, x + 2 + v * 2, y, 2, 1, "#e2ef91");
    rect(ctx, x + 10 - v, y + 1, 3, 1, "#9ec94f");
  }
  rect(ctx, x + 2, y + 7, 4, 3, "#6c4a37");
  rect(ctx, x + 9, y + 11, 5, 3, "#3f2c27");
  rect(ctx, x + 6, y + 4, 2, 2, "#8b6041");
  if (leftOpen) rect(ctx, x, y + 4, 2, s - 4, "#402d28");
  if (rightOpen) rect(ctx, x + s - 2, y + 4, 2, s - 4, "#352622");
}

function drawBreakable(ctx, x, y, s, col, row) {
  rect(ctx, x, y, s, s, "#4b241f");
  rect(ctx, x + 1, y + 1, s - 2, s - 2, "#b85f3e");
  rect(ctx, x + 2, y + 2, s - 4, 3, "#e1915f");
  rect(ctx, x + 2, y + 6, 6, 2, "#71372a");
  rect(ctx, x + 10, y + 6, 4, 2, "#71372a");
  rect(ctx, x + 7, y + 8, 2, 6, "#71372a");
  if (variation(col, row) & 1) {
    rect(ctx, x + 3, y + 10, 3, 1, "#f0ad73");
    rect(ctx, x + 12, y + 11, 2, 2, "#8f4934");
  } else {
    rect(ctx, x + 10, y + 3, 3, 1, "#f0ad73");
    rect(ctx, x + 3, y + 12, 2, 2, "#8f4934");
  }
}

function drawItemBlock(ctx, x, y, s, time, col, row) {
  const pulse = (Math.floor(time * 4 + col + row) & 1) === 0;
  rect(ctx, x, y, s, s, "#6d4f12");
  rect(ctx, x + 1, y + 1, s - 2, s - 2, pulse ? "#f6c845" : "#e8ad2f");
  rect(ctx, x + 2, y + 2, s - 4, 2, "#ffe98f");
  rect(ctx, x + 2, y + s - 3, s - 4, 1, "#a66d1c");
  rect(ctx, x + 6, y + 4, 5, 2, "#fff6bd");
  rect(ctx, x + 9, y + 6, 3, 3, "#fff6bd");
  rect(ctx, x + 7, y + 8, 4, 3, "#fff6bd");
  rect(ctx, x + 7, y + 12, 3, 2, "#fff6bd");
  rect(ctx, x + 2, y + 2, 2, 2, "#9b6c1f");
  rect(ctx, x + s - 4, y + 2, 2, 2, "#9b6c1f");
  rect(ctx, x + 2, y + s - 4, 2, 2, "#9b6c1f");
  rect(ctx, x + s - 4, y + s - 4, 2, 2, "#9b6c1f");
}

function drawUsedBlock(ctx, x, y, s) {
  rect(ctx, x, y, s, s, "#273541");
  rect(ctx, x + 1, y + 1, s - 2, s - 2, "#64717a");
  rect(ctx, x + 2, y + 2, s - 4, 2, "#91a0a5");
  rect(ctx, x + 4, y + 6, s - 8, 5, "#4c5961");
  rect(ctx, x + 6, y + 7, 4, 2, "#76868c");
}

function drawHazard(ctx, x, y, s, col) {
  rect(ctx, x, y + s - 3, s, 3, "#562336");
  const shift = col & 1 ? 0 : 1;
  ctx.fillStyle = "#9d3351";
  ctx.beginPath();
  ctx.moveTo(x, y + s - 3);
  ctx.lineTo(x + 4 + shift, y + 3);
  ctx.lineTo(x + 8, y + s - 3);
  ctx.lineTo(x + 12 - shift, y + 2);
  ctx.lineTo(x + s, y + s - 3);
  ctx.fill();
  rect(ctx, x + 4 + shift, y + 5, 2, 5, "#f47c84");
  rect(ctx, x + 12 - shift, y + 4, 2, 4, "#f47c84");
}

function drawOneWay(ctx, x, y, s, col) {
  rect(ctx, x, y + 1, s, 5, "#263c54");
  rect(ctx, x, y, s, 2, "#94c7dc");
  rect(ctx, x + 1, y + 2, s - 2, 2, "#527795");
  rect(ctx, x + ((col & 1) ? 3 : 11), y + 2, 2, 2, "#c8edf2");
  rect(ctx, x + 2, y + 6, 3, 3, "#182838");
  rect(ctx, x + s - 5, y + 6, 3, 3, "#182838");
}

const DRAWERS = Object.freeze({
  [Tile.GROUND]: (ctx, map, col, row, x, y, s) => drawGround(ctx, map, col, row, x, y, s),
  [Tile.BREAKABLE]: (ctx, map, col, row, x, y, s) => drawBreakable(ctx, x, y, s, col, row),
  [Tile.ITEM]: (ctx, map, col, row, x, y, s, time) => drawItemBlock(ctx, x, y, s, time, col, row),
  [Tile.USED]: (ctx, map, col, row, x, y, s) => drawUsedBlock(ctx, x, y, s),
  [Tile.HAZARD]: (ctx, map, col, row, x, y, s) => drawHazard(ctx, x, y, s, col),
  [Tile.ONE_WAY]: (ctx, map, col, row, x, y, s) => drawOneWay(ctx, x, y, s, col),
});

export function drawTileArt(ctx, map, tile, col, row, x, y, s, time) {
  const draw = DRAWERS[tile];
  if (draw) draw(ctx, map, col, row, x, y, s, time);
}
