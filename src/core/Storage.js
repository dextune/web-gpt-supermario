const KEY = "starbound-sprint-v1";

export class Storage {
  load() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "{}");
      return {
        highScore: Number(value.highScore) || 0,
        unlockedLevel: Math.max(1, Number(value.unlockedLevel) || 1),
        settings: { masterVolume: Number(value.settings?.masterVolume ?? 0.55) },
      };
    } catch {
      return { highScore: 0, unlockedLevel: 1, settings: { masterVolume: 0.55 } };
    }
  }

  save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // Storage can be unavailable in privacy/sandboxed contexts.
    }
  }
}
