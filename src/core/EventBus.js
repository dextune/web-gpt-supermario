export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(type, handler) {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(handler);
    return () => this.off(type, handler);
  }

  off(type, handler) {
    const set = this.listeners.get(type);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) this.listeners.delete(type);
  }

  emit(type, payload) {
    const set = this.listeners.get(type);
    if (!set) return;
    for (const handler of set) handler(payload);
  }

  clear() {
    this.listeners.clear();
  }
}
