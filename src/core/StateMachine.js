export class StateMachine {
  constructor(owner, definitions, initialState) {
    this.owner = owner;
    this.definitions = definitions;
    this.currentName = initialState;
    this.current = definitions[initialState] ?? null;
    this.current?.enter?.(owner, null);
  }

  set(nextName) {
    if (nextName === this.currentName) return false;
    const next = this.definitions[nextName];
    if (!next) throw new Error(`Unknown state: ${nextName}`);
    const previousName = this.currentName;
    this.current?.exit?.(this.owner, nextName);
    this.currentName = nextName;
    this.current = next;
    this.current.enter?.(this.owner, previousName);
    return true;
  }

  update(dt) {
    this.current?.update?.(this.owner, dt);
  }

  handleInput(input) {
    this.current?.handleInput?.(this.owner, input);
  }
}
