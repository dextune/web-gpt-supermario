export class ObjectPool {
  constructor(factory, initialSize = 32) {
    this.factory = factory;
    this.free = [];
    this.active = [];
    for (let i = 0; i < initialSize; i += 1) this.free.push(factory());
  }

  acquire() {
    const object = this.free.pop() ?? this.factory();
    this.active.push(object);
    object.active = true;
    return object;
  }

  release(object) {
    const index = this.active.indexOf(object);
    if (index >= 0) {
      const last = this.active.pop();
      if (index < this.active.length) this.active[index] = last;
    }
    object.active = false;
    this.free.push(object);
  }

  releaseAt(index) {
    const object = this.active[index];
    const last = this.active.pop();
    if (index < this.active.length) this.active[index] = last;
    object.active = false;
    this.free.push(object);
  }

  clear() {
    while (this.active.length) {
      const object = this.active.pop();
      object.active = false;
      this.free.push(object);
    }
  }
}
