function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function hash(value) {
  let x = value | 0;
  x = ((x >>> 16) ^ x) * 0x45d9f3b;
  x = ((x >>> 16) ^ x) * 0x45d9f3b;
  return ((x >>> 16) ^ x) >>> 0;
}

export class BackgroundRenderer {
  draw(ctx, width, height, cameraX, time) {
    this.drawSky(ctx, width, height);
    this.drawSun(ctx, width, cameraX);
    this.drawCloudLayer(ctx, width, cameraX, 0.08, 42, "#e7f7f4", "#c7e9ee");
    this.drawFarMountains(ctx, width, cameraX);
    this.drawCloudLayer(ctx, width, cameraX, 0.18, 92, "#d9eff1", "#abd5df");
    this.drawNearHills(ctx, width, cameraX, time);
  }

  drawSky(ctx, width, height) {
    rect(ctx, 0, 0, width, height, "#5aa9e5");
    rect(ctx, 0, 0, width, 42, "#4d9fdf");
    rect(ctx, 0, 42, width, 48, "#55a6e3");
    rect(ctx, 0, 90, width, 52, "#61b1e8");
    rect(ctx, 0, 142, width, 68, "#71bee9");
  }

  drawSun(ctx, width, cameraX) {
    const x = Math.round(width - 58 - (cameraX * 0.025) % 20);
    rect(ctx, x, 28, 18, 2, "#fff2b2");
    rect(ctx, x - 3, 30, 24, 12, "#ffe17f");
    rect(ctx, x, 42, 18, 2, "#f7c95f");
    rect(ctx, x + 4, 32, 10, 8, "#fff4bd");
  }

  drawCloudLayer(ctx, width, cameraX, parallax, baseY, light, shade) {
    const spacing = 118;
    const drift = -((cameraX * parallax) % spacing);
    for (let i = -1; i < Math.ceil(width / spacing) + 2; i += 1) {
      const seed = hash(i + Math.floor(cameraX * parallax / spacing) * 17);
      const x = drift + i * spacing + (seed % 24);
      const y = baseY + (seed % 19);
      const cloudW = 38 + (seed % 18);
      rect(ctx, x + 5, y + 5, cloudW, 7, shade);
      rect(ctx, x + 11, y + 1, Math.floor(cloudW * 0.48), 7, light);
      rect(ctx, x, y + 7, cloudW + 10, 6, light);
      rect(ctx, x + cloudW - 4, y + 5, 10, 5, light);
    }
  }

  drawFarMountains(ctx, width, cameraX) {
    const spacing = 112;
    const drift = -((cameraX * 0.22) % spacing);
    for (let i = -2; i < Math.ceil(width / spacing) + 2; i += 1) {
      const x = Math.round(drift + i * spacing);
      const seed = hash(i + Math.floor(cameraX * 0.22 / spacing) * 31);
      const peak = 116 + (seed % 18);
      const half = 52 + (seed % 16);
      ctx.fillStyle = "#7d8fbb";
      ctx.beginPath();
      ctx.moveTo(x - 8, 208);
      ctx.lineTo(x + half, peak);
      ctx.lineTo(x + half * 2 + 8, 208);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#657ba8";
      ctx.beginPath();
      ctx.moveTo(x + half, peak);
      ctx.lineTo(x + half * 2 + 8, 208);
      ctx.lineTo(x + half + 18, 208);
      ctx.closePath();
      ctx.fill();
      rect(ctx, x + half - 5, peak + 8, 10, 3, "#d8edf1");
      rect(ctx, x + half - 9, peak + 11, 18, 3, "#c8e1ea");
    }
  }

  drawNearHills(ctx, width, cameraX, time) {
    const spacing = 92;
    const drift = -((cameraX * 0.38) % spacing);
    for (let i = -2; i < Math.ceil(width / spacing) + 2; i += 1) {
      const x = Math.round(drift + i * spacing);
      const seed = hash(i + Math.floor(cameraX * 0.38 / spacing) * 47);
      const hillH = 28 + (seed % 22);
      rect(ctx, x, 208 - hillH, 62, hillH, "#4e9e7f");
      rect(ctx, x + 7, 204 - hillH, 48, 4, "#6fbb8d");
      rect(ctx, x + 12, 208 - hillH + 9, 5, 3, "#3d826d");
      rect(ctx, x + 38, 208 - hillH + 15, 7, 3, "#3d826d");
      if (((seed + Math.floor(time)) & 3) === 0) rect(ctx, x + 27, 208 - hillH - 3, 2, 4, "#f3d76e");
    }
  }
}
