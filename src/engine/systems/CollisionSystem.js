export class CollisionSystem {
  constructor(tileMap) {
    this.tileMap = tileMap;
  }

  move(entity, dt, allowOneWay = true) {
    entity.beginStep();
    entity.grounded = false;
    this.moveX(entity, entity.vx * dt);
    this.moveY(entity, entity.vy * dt, allowOneWay);
  }

  moveX(entity, dx) {
    if (dx === 0) return;
    entity.x += dx;
    const map = this.tileMap;
    const s = map.tileSize;
    const minRow = Math.floor(entity.y / s);
    const maxRow = Math.floor((entity.y + entity.height - 0.001) / s);

    if (dx > 0) {
      const col = Math.floor((entity.x + entity.width - 0.001) / s);
      for (let row = minRow; row <= maxRow; row += 1) {
        if (!map.isSolid(col, row)) continue;
        entity.x = col * s - entity.width;
        entity.vx = 0;
        entity.collision.right = true;
        return;
      }
    } else {
      const col = Math.floor(entity.x / s);
      for (let row = minRow; row <= maxRow; row += 1) {
        if (!map.isSolid(col, row)) continue;
        entity.x = (col + 1) * s;
        entity.vx = 0;
        entity.collision.left = true;
        return;
      }
    }
  }

  moveY(entity, dy, allowOneWay) {
    const map = this.tileMap;
    const s = map.tileSize;
    const oldBottom = entity.y + entity.height;
    entity.y += dy;
    const minCol = Math.floor(entity.x / s);
    const maxCol = Math.floor((entity.x + entity.width - 0.001) / s);

    if (dy > 0) {
      const row = Math.floor((entity.y + entity.height - 0.001) / s);
      for (let col = minCol; col <= maxCol; col += 1) {
        const tileTop = row * s;
        const blocks = map.isSolid(col, row) ||
          (allowOneWay && map.isOneWay(col, row) && oldBottom <= tileTop + 1);
        if (!blocks) continue;
        entity.y = tileTop - entity.height;
        entity.vy = 0;
        entity.grounded = true;
        entity.collision.floor = true;
        return;
      }
    } else if (dy < 0) {
      const row = Math.floor(entity.y / s);
      for (let col = minCol; col <= maxCol; col += 1) {
        if (!map.isSolid(col, row)) continue;
        entity.y = (row + 1) * s;
        entity.vy = 0;
        entity.collision.ceiling = true;
        entity.collision.ceilingCol = col;
        entity.collision.ceilingRow = row;
        return;
      }
    }
  }

  canFit(x, y, width, height) {
    const map = this.tileMap;
    const s = map.tileSize;
    const minCol = Math.floor(x / s);
    const maxCol = Math.floor((x + width - 0.001) / s);
    const minRow = Math.floor(y / s);
    const maxRow = Math.floor((y + height - 0.001) / s);
    for (let row = minRow; row <= maxRow; row += 1) {
      for (let col = minCol; col <= maxCol; col += 1) {
        if (map.isSolid(col, row)) return false;
      }
    }
    return true;
  }
}
