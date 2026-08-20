let NEXT_ENTITY_ID = 1;

export class Entity {
  constructor(kind, x, y, width, height) {
    this.id = NEXT_ENTITY_ID++;
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.vx = 0;
    this.vy = 0;
    this.width = width;
    this.height = height;
    this.active = true;
    this.visible = true;
    this.grounded = false;
    this.gravity = 0;
    this.maxFallSpeed = 400;
    this.queryStamp = 0;
    this.collision = {
      left: false, right: false, ceiling: false, floor: false,
      ceilingCol: -1, ceilingRow: -1,
    };
  }

  beginStep() {
    this.prevX = this.x;
    this.prevY = this.y;
    const c = this.collision;
    c.left = c.right = c.ceiling = c.floor = false;
    c.ceilingCol = c.ceilingRow = -1;
  }

  get centerX() { return this.x + this.width * 0.5; }
  get centerY() { return this.y + this.height * 0.5; }
}
