export class SpatialHash {
  constructor(cellSize = 32) {
    this.cellSize = cellSize;
    this.buckets = new Map();
    this.usedBuckets = [];
    this.queryId = 1;
  }

  clear() {
    for (const bucket of this.usedBuckets) bucket.length = 0;
    this.usedBuckets.length = 0;
  }

  bucketFor(cx, cy) {
    const key = cy * 8192 + cx;
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = [];
      this.buckets.set(key, bucket);
    }
    if (bucket.length === 0) this.usedBuckets.push(bucket);
    return bucket;
  }

  insert(entity) {
    const size = this.cellSize;
    const minX = Math.floor(entity.x / size);
    const maxX = Math.floor((entity.x + entity.width - 0.001) / size);
    const minY = Math.floor(entity.y / size);
    const maxY = Math.floor((entity.y + entity.height - 0.001) / size);
    for (let cy = minY; cy <= maxY; cy += 1) {
      for (let cx = minX; cx <= maxX; cx += 1) this.bucketFor(cx, cy).push(entity);
    }
  }

  query(x, y, width, height, out) {
    out.length = 0;
    const stamp = this.queryId++;
    const size = this.cellSize;
    const minX = Math.floor(x / size);
    const maxX = Math.floor((x + width - 0.001) / size);
    const minY = Math.floor(y / size);
    const maxY = Math.floor((y + height - 0.001) / size);
    for (let cy = minY; cy <= maxY; cy += 1) {
      for (let cx = minX; cx <= maxX; cx += 1) {
        const bucket = this.buckets.get(cy * 8192 + cx);
        if (!bucket) continue;
        for (let i = 0; i < bucket.length; i += 1) {
          const entity = bucket[i];
          if (entity.queryStamp === stamp) continue;
          entity.queryStamp = stamp;
          out.push(entity);
        }
      }
    }
    return out;
  }
}
