const WALK_PHASE = Object.freeze([0, 1, 0, -1]);
const RUN_PHASE = Object.freeze([0, 2, 0, -2]);

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function pixelShadow(ctx, x, y, width) {
  rect(ctx, x + 2, y, Math.max(4, width - 4), 1, "#14223366");
  rect(ctx, x + 4, y + 1, Math.max(2, width - 8), 1, "#14223333");
}

function beginFacing(ctx, x, y, width, facing) {
  ctx.save();
  if (facing < 0) {
    ctx.translate(Math.round(x + width), Math.round(y));
    ctx.scale(-1, 1);
  } else {
    ctx.translate(Math.round(x), Math.round(y));
  }
}

export function drawPlayerSprite(ctx, player, x, y, time) {
  const powered = player.power !== "NORMAL";
  const spriteW = powered ? 20 : 18;
  const spriteH = powered ? 29 : 20;
  const baseX = Math.round(x - (spriteW - player.width) * 0.5);
  const baseY = Math.round(y + player.height - spriteH);
  const state = player.state;
  const moving = state === "WALK" || state === "RUN";
  const speed = state === "RUN" ? 13 : 8;
  const phase = moving ? Math.floor(time * speed) & 3 : 0;
  const leg = (state === "RUN" ? RUN_PHASE : WALK_PHASE)[phase];
  const bob = state === "IDLE" ? (Math.floor(time * 2.2) & 1) : 0;
  const jump = state === "JUMP";
  const fall = state === "FALL";
  const skid = state === "SKID";
  const land = state === "LAND";
  const hit = state === "HIT";
  const powering = state === "POWER_UP";
  const bodyDrop = land && player.stateTime < 0.055 ? 2 : 0;

  pixelShadow(ctx, baseX, y + player.height, spriteW);
  beginFacing(ctx, baseX, baseY + bob, spriteW, player.facing);

  if (player.dead) {
    ctx.translate(spriteW * 0.5, spriteH * 0.5);
    ctx.rotate(Math.sin(time * 12) * 0.22);
    ctx.translate(-spriteW * 0.5, -spriteH * 0.5);
  }

  const scarfY = (powered ? 10 : 7) + bodyDrop;
  rect(ctx, -3, scarfY + (jump ? 2 : 0), 6, 3, "#9b3f34");
  rect(ctx, -5, scarfY + 1 + (jump ? 3 : 0), 4, 2, "#e06745");
  rect(ctx, 1, scarfY, 4, 2, "#ff9b54");

  if (powered) {
    rect(ctx, 2, 11, 3, 10, "#14293b");
    rect(ctx, 1, 14, 2, 5, "#2bd7c4");
    rect(ctx, 3, 13, 2, 2, "#9df7de");
  }

  const legY = (powered ? 21 : 14) + (land ? 1 : 0);
  const leftLeg = jump ? -1 : fall ? 1 : leg;
  const rightLeg = jump ? 1 : fall ? 0 : -leg;
  rect(ctx, 6 + leftLeg, legY, 4, powered ? 5 : 4, "#16476b");
  rect(ctx, 11 + rightLeg, legY, 4, powered ? 5 : 4, "#123755");
  rect(ctx, 5 + leftLeg, legY + (powered ? 5 : 4), 5, 3, "#0a1725");
  rect(ctx, 11 + rightLeg, legY + (powered ? 5 : 4), 6, 3, "#0a1725");
  rect(ctx, 6 + leftLeg, legY + (powered ? 5 : 4), 3, 1, "#6edaf0");
  rect(ctx, 12 + rightLeg, legY + (powered ? 5 : 4), 3, 1, "#6edaf0");

  const torsoY = (powered ? 10 : 8) + bodyDrop;
  const torsoH = powered ? 12 : 8;
  rect(ctx, 4, torsoY, 13, torsoH, "#0b2134");
  rect(ctx, 5, torsoY + 1, 11, torsoH - 2, powered ? "#167ca1" : "#17658d");
  rect(ctx, 7, torsoY + 2, 5, torsoH - 3, powered ? "#25bca9" : "#2ba3ba");
  rect(ctx, 8, torsoY + 2, 2, torsoH - 4, "#88f0df");
  rect(ctx, 4, torsoY + 1, 2, 4, "#dce9ea");
  rect(ctx, 15, torsoY + 1, 2, 4, "#8fa7b3");

  const armSwing = skid ? -2 : jump ? -1 : moving ? leg : 0;
  rect(ctx, 2, torsoY + 3 + Math.max(0, armSwing), 3, 6, "#123b5a");
  rect(ctx, 16, torsoY + 2 + Math.max(0, -armSwing), 3, 6, "#123b5a");
  rect(ctx, 2, torsoY + 7 + Math.max(0, armSwing), 3, 2, "#d8edf1");
  rect(ctx, 17, torsoY + 6 + Math.max(0, -armSwing), 3, 2, "#d8edf1");

  const headY = (powered ? 1 : 0) + bodyDrop;
  rect(ctx, 5, headY + 1, 11, 2, "#101d2d");
  rect(ctx, 3, headY + 3, 15, 6, "#101d2d");
  rect(ctx, 5, headY, 10, 2, "#eef7f0");
  rect(ctx, 4, headY + 2, 12, 6, "#d8e6e2");
  rect(ctx, 6, headY + 2, 9, 1, "#ffffff");
  rect(ctx, 8, headY + 4, 9, 4, "#081926");
  rect(ctx, 9, headY + 4, 6, 2, "#133f5f");
  rect(ctx, 10, headY + 4, 4, 1, "#72e4ff");
  rect(ctx, 4, headY + 7, 4, 2, "#b9cbc9");
  rect(ctx, 15, headY + 7, 2, 2, "#6a858e");

  if (powered) {
    rect(ctx, 6, 8, 10, 2, "#0e293d");
    rect(ctx, 8, 8, 5, 1, "#f6d26d");
    rect(ctx, 1, 17, 2, 4, "#31efd0");
    if ((Math.floor(time * 8) & 1) === 0) rect(ctx, 0, 20, 2, 3, "#9effeb");
  }

  if (skid) {
    rect(ctx, -2, spriteH - 3, 2, 1, "#e8f0c4");
    rect(ctx, -5, spriteH - 2, 3, 1, "#d7c18e");
  }

  if (land && player.stateTime < 0.055) {
    rect(ctx, 2, spriteH - 2, 3, 1, "#d7c18e");
    rect(ctx, spriteW - 4, spriteH - 2, 3, 1, "#d7c18e");
  }

  if (hit && (Math.floor(time * 22) & 1) === 0) {
    rect(ctx, 3, 3, 2, 6, "#ff9a8f");
    rect(ctx, spriteW - 2, 7, 2, 5, "#ffd0bf");
  }

  if (powering) {
    const flash = Math.floor(time * 18) & 1;
    rect(ctx, -3, 3, 1, flash ? 5 : 3, "#b8fff0");
    rect(ctx, -5, 5, 5, 1, "#b8fff0");
    rect(ctx, spriteW + 1, 12, 1, flash ? 3 : 5, "#ffe58a");
    rect(ctx, spriteW - 1, 14, 5, 1, "#ffe58a");
  }

  ctx.restore();
}

export function drawWalkerSprite(ctx, enemy, x, y, time) {
  const frame = Math.floor((time + enemy.x * 0.01) * 6) & 1;
  const w = 18;
  const h = 15;
  const baseX = Math.round(x - 2);
  const baseY = Math.round(y + enemy.height - h);
  pixelShadow(ctx, baseX, y + enemy.height, w);
  beginFacing(ctx, baseX, baseY, w, enemy.direction);
  rect(ctx, 2, 7, 14, 6, "#261934");
  rect(ctx, 3, 5, 12, 7, "#67407d");
  rect(ctx, 5, 3, 8, 6, "#9a6db0");
  rect(ctx, 4, 1, 3, 4, "#d6a7d5");
  rect(ctx, 12, 1, 3, 4, "#d6a7d5");
  rect(ctx, 5, 4, 2, 2, "#0a1725");
  rect(ctx, 11, 4, 2, 2, "#0a1725");
  rect(ctx, 6, 4, 1, 1, "#f4efff");
  rect(ctx, 12, 4, 1, 1, "#f4efff");
  rect(ctx, 5 + frame, 12, 4, 3, "#151828");
  rect(ctx, 11 - frame, 12, 4, 3, "#151828");
  rect(ctx, 1, 8, 3, 2, "#c77ec5");
  rect(ctx, 14, 8, 3, 2, "#c77ec5");
  ctx.restore();
}

export function drawShellSprite(ctx, enemy, x, y, time) {
  const shellOnly = enemy.state === "SHELL_IDLE" || enemy.state === "SHELL_MOVING";
  const w = 19;
  const h = shellOnly ? 12 : 17;
  const baseX = Math.round(x - 2);
  const baseY = Math.round(y + enemy.height - h);
  pixelShadow(ctx, baseX, y + enemy.height, w);
  beginFacing(ctx, baseX, baseY, w, enemy.direction);
  const spin = enemy.state === "SHELL_MOVING" ? (Math.floor(time * 16) & 3) : 0;

  if (!shellOnly) {
    rect(ctx, 6, 0, 8, 7, "#122933");
    rect(ctx, 7, 1, 6, 5, "#6cb5a3");
    rect(ctx, 12, 2, 2, 2, "#07141d");
    rect(ctx, 14, 4, 3, 2, "#d5e8cf");
    rect(ctx, 3, 11, 4, 5, "#153947");
    rect(ctx, 12, 11, 4, 5, "#153947");
  }

  const sy = shellOnly ? 1 : 6;
  rect(ctx, 2, sy + 3, 15, 7, "#102631");
  rect(ctx, 3, sy + 1, 13, 8, "#24705f");
  rect(ctx, 5, sy, 9, 8, "#4da985");
  rect(ctx, 7, sy + 1, 5, 5, "#91dbc0");
  rect(ctx, 8, sy + 2, 3, 3, spin & 1 ? "#f0ca67" : "#d7f0c6");
  rect(ctx, 4, sy + 8, 11, 2, "#0c1a22");
  if (shellOnly) {
    rect(ctx, 1, sy + 7, 3, 2, "#213946");
    rect(ctx, 15, sy + 7, 3, 2, "#213946");
  }
  ctx.restore();
}

export function drawFlierSprite(ctx, enemy, x, y, time) {
  const frame = Math.floor((time + enemy.age) * 9) & 1;
  const w = 24;
  const baseX = Math.round(x - 5);
  const baseY = Math.round(y - 2);
  pixelShadow(ctx, baseX + 4, y + enemy.height + 5, w - 8);
  beginFacing(ctx, baseX, baseY, w, enemy.direction);
  rect(ctx, 8, 4, 9, 8, "#241c46");
  rect(ctx, 10, 3, 6, 7, "#7157ad");
  rect(ctx, 12, 4, 3, 2, "#d8ccff");
  rect(ctx, 14, 4, 1, 1, "#111226");
  if (frame === 0) {
    rect(ctx, 1, 1, 8, 3, "#8b76ca");
    rect(ctx, 16, 1, 7, 3, "#8b76ca");
    rect(ctx, 3, 0, 4, 1, "#d4c7ff");
    rect(ctx, 18, 0, 3, 1, "#d4c7ff");
  } else {
    rect(ctx, 2, 8, 7, 3, "#8b76ca");
    rect(ctx, 16, 8, 6, 3, "#8b76ca");
    rect(ctx, 4, 11, 3, 1, "#d4c7ff");
    rect(ctx, 18, 11, 2, 1, "#d4c7ff");
  }
  rect(ctx, 9, 11, 3, 2, "#111a2f");
  rect(ctx, 15, 10, 3, 2, "#111a2f");
  ctx.restore();
}

export function drawShardSprite(ctx, item, x, y, time) {
  const bob = Math.round(Math.sin((time + item.age) * 5) * 1.5);
  const phase = Math.floor((time + item.age) * 8) & 3;
  const width = phase === 1 || phase === 3 ? 7 : 11;
  const baseX = Math.round(x + (item.width - width) * 0.5);
  const baseY = Math.round(y - 2 + bob);
  rect(ctx, baseX + Math.floor(width * 0.5) - 1, baseY, 3, 2, "#fff7b0");
  rect(ctx, baseX + 2, baseY + 2, Math.max(3, width - 4), 8, "#f3d94f");
  rect(ctx, baseX, baseY + 5, width, 3, "#d9b934");
  rect(ctx, baseX + 2, baseY + 3, 2, 4, "#fff8bb");
  rect(ctx, baseX + Math.floor(width * 0.5) - 1, baseY + 10, 3, 2, "#b99225");
  if ((Math.floor(time * 4) & 3) === 0) {
    rect(ctx, baseX - 2, baseY + 1, 1, 3, "#fffbe0");
    rect(ctx, baseX - 3, baseY + 2, 3, 1, "#fffbe0");
  }
}

export function drawPowerCoreSprite(ctx, item, x, y, time) {
  const pulse = Math.floor((time + item.age) * 6) & 1;
  const baseX = Math.round(x - 1);
  const baseY = Math.round(y - 2 + Math.sin((time + item.age) * 4));
  rect(ctx, baseX + 2, baseY, 12, 2, "#d9fff5");
  rect(ctx, baseX, baseY + 2, 16, 12, "#0d3541");
  rect(ctx, baseX + 2, baseY + 3, 12, 9, "#24bfa9");
  rect(ctx, baseX + 4, baseY + 4, 8, 7, pulse ? "#88ffe7" : "#5be7d3");
  rect(ctx, baseX + 6, baseY + 5, 4, 5, "#eaffd8");
  rect(ctx, baseX + 1, baseY + 5, 2, 5, "#237181");
  rect(ctx, baseX + 13, baseY + 5, 2, 5, "#071b28");
  rect(ctx, baseX + 3, baseY + 14, 10, 2, "#071821");
}

export function drawUnknownEntity(ctx, entity, x, y) {
  rect(ctx, x, y, entity.width, entity.height, "#ff00d4");
  rect(ctx, x + 2, y + 2, Math.max(1, entity.width - 4), Math.max(1, entity.height - 4), "#1b1022");
}
