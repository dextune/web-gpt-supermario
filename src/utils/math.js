export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export function moveToward(value, target, maxDelta) {
  if (value < target) return Math.min(value + maxDelta, target);
  if (value > target) return Math.max(value - maxDelta, target);
  return target;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function aabb(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}
