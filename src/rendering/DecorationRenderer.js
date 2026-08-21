function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function drawGrass(ctx, x, y, d) {
  const variant = d.variant ?? 0;
  rect(ctx, x, y - 3, 2, 3, "#4c853c");
  rect(ctx, x + 2, y - 5 - (variant & 1), 2, 5 + (variant & 1), "#74aa45");
  rect(ctx, x + 4, y - 3, 2, 3, "#4d8c40");
  rect(ctx, x + 2, y - 6, 1, 2, "#c3dc72");
}

function drawRock(ctx, x, y, d) {
  const width = 8 + ((d.variant ?? 0) & 3) * 2;
  rect(ctx, x + 1, y - 6, width - 2, 6, "#314656");
  rect(ctx, x + 3, y - 8, Math.max(3, width - 6), 3, "#526c7b");
  rect(ctx, x + 3, y - 7, 3, 1, "#91a8ad");
  rect(ctx, x, y - 2, width, 2, "#1d2c38");
}

function drawCrystal(ctx, x, y, d) {
  const tall = 9 + ((d.variant ?? 0) & 3) * 2;
  ctx.fillStyle = "#1f766f";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 4, y - tall);
  ctx.lineTo(x + 8, y);
  ctx.fill();
  ctx.fillStyle = "#47d7c1";
  ctx.beginPath();
  ctx.moveTo(x + 4, y - tall);
  ctx.lineTo(x + 6, y - 2);
  ctx.lineTo(x + 8, y);
  ctx.fill();
  rect(ctx, x + 3, y - tall + 2, 2, 4, "#c2fff2");
}

function drawRelay(ctx, x, y, d, time) {
  const pulse = (Math.floor(time * 4 + (d.variant ?? 0)) & 1) === 0;
  rect(ctx, x + 3, y - 24, 3, 24, "#243544");
  rect(ctx, x + 4, y - 23, 1, 20, "#607786");
  rect(ctx, x, y - 3, 10, 3, "#152532");
  rect(ctx, x + 1, y - 28, 8, 5, "#17394a");
  rect(ctx, x + 3, y - 30, 4, 3, pulse ? "#b6fff1" : "#4be0ca");
  rect(ctx, x + 9, y - 26, 7, 2, "#40576a");
  rect(ctx, x + 15, y - 28, 2, 5, "#718c9e");
}

function drawSign(ctx, x, y, d) {
  rect(ctx, x + 5, y - 16, 2, 16, "#5b3f31");
  rect(ctx, x, y - 18, 15, 8, "#3a5565");
  rect(ctx, x + 1, y - 17, 13, 6, "#66818c");
  rect(ctx, x + 3, y - 15, 8, 1, "#d7e9e4");
  rect(ctx, x + 8, y - 14, 3, 3, "#4ce0c7");
  if ((d.variant ?? 0) & 1) rect(ctx, x + 2, y - 12, 4, 1, "#e2c969");
}

function drawRuin(ctx, x, y, d) {
  const height = 24 + ((d.variant ?? 0) & 3) * 6;
  rect(ctx, x, y - height, 7, height, "#49616a");
  rect(ctx, x + 2, y - height + 3, 3, height - 5, "#617984");
  rect(ctx, x + 18, y - height + 6, 7, height - 6, "#415862");
  rect(ctx, x + 3, y - height, 20, 5, "#526d77");
  rect(ctx, x + 6, y - height + 2, 12, 2, "#78919a");
  rect(ctx, x + 8, y - height + 8, 9, 3, "#38505c");
}

function drawVent(ctx, x, y, d, time) {
  rect(ctx, x, y - 6, 12, 6, "#263947");
  rect(ctx, x + 2, y - 8, 8, 3, "#5f7a88");
  rect(ctx, x + 3, y - 7, 6, 1, "#a5bec5");
  if ((Math.floor(time * 3 + (d.variant ?? 0)) & 1) === 0) {
    rect(ctx, x + 4, y - 12, 4, 2, "#d9eef066");
    rect(ctx, x + 5, y - 15, 3, 2, "#e6f6f344");
  }
}

const DRAWERS = Object.freeze({ grass: drawGrass, rock: drawRock, crystal: drawCrystal, relay: drawRelay, sign: drawSign, ruin: drawRuin, vent: drawVent });

export class DecorationRenderer {
  draw(ctx, decorations, cameraX, width, time, layer) {
    for (let i = 0; i < decorations.length; i += 1) {
      const d = decorations[i];
      if ((d.layer ?? "front") !== layer) continue;
      const x = Math.round(d.x - cameraX);
      if (x < -48 || x > width + 48) continue;
      const draw = DRAWERS[d.type];
      if (draw) draw(ctx, x, d.y, d, time);
    }
  }
}
