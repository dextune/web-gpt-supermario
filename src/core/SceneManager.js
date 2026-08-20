export class SceneManager {
  constructor(initialScene) {
    this.current = initialScene;
    this.previous = null;
    this.listeners = new Set();
  }

  set(scene) {
    if (scene === this.current) return;
    this.previous = this.current;
    this.current = scene;
    for (const listener of this.listeners) listener(scene, this.previous);
  }

  onChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
