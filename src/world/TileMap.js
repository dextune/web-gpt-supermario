import { Tile } from "../data/constants.js";

const SOLID = new Uint8Array(256);
SOLID[Tile.GROUND] = 1;
SOLID[Tile.BREAKABLE] = 1;
SOLID[Tile.ITEM] = 1;
SOLID[Tile.USED] = 1;

export class TileMap {
  constructor(width, height, tileSize) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.tiles = new Uint8Array(width * height);
    this.blockPayload = new Map();
  }

  index(col, row) { return row * this.width + col; }

  inBounds(col, row) {
    return col >= 0 && row >= 0 && col < this.width && row < this.height;
  }

  get(col, row) {
    if (!this.inBounds(col, row)) return row >= this.height ? Tile.GROUND : Tile.EMPTY;
    return this.tiles[this.index(col, row)];
  }

  set(col, row, tile) {
    if (this.inBounds(col, row)) this.tiles[this.index(col, row)] = tile;
  }

  isSolid(col, row) {
    return SOLID[this.get(col, row)] === 1;
  }

  isOneWay(col, row) {
    return this.get(col, row) === Tile.ONE_WAY;
  }

  setBlockPayload(col, row, payload) {
    this.blockPayload.set(this.index(col, row), payload);
  }

  getBlockPayload(col, row) {
    return this.blockPayload.get(this.index(col, row)) ?? null;
  }

  worldWidth() { return this.width * this.tileSize; }
  worldHeight() { return this.height * this.tileSize; }

  overlapsType(x, y, width, height, tileType) {
    const s = this.tileSize;
    const minCol = Math.floor(x / s);
    const maxCol = Math.floor((x + width - 0.001) / s);
    const minRow = Math.floor(y / s);
    const maxRow = Math.floor((y + height - 0.001) / s);
    for (let row = minRow; row <= maxRow; row += 1) {
      for (let col = minCol; col <= maxCol; col += 1) {
        if (this.get(col, row) === tileType) return true;
      }
    }
    return false;
  }
}
