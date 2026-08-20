import { Event } from "../data/constants.js";

export class ScoreSystem {
  constructor(events, session) {
    this.events = events;
    this.session = session;
    this.disposers = [
      events.on(Event.ENEMY_DEFEATED, (e) => this.add(e.score ?? 100)),
      events.on(Event.BLOCK_BROKEN, (e) => this.add(e.score ?? 50)),
      events.on(Event.COIN_COLLECTED, () => {
        this.session.coins += 1;
        this.add(100);
      }),
    ];
  }

  add(points) {
    this.session.score += points;
    this.events.emit(Event.SCORE_CHANGED, { score: this.session.score });
  }

  destroy() {
    for (const dispose of this.disposers) dispose();
    this.disposers.length = 0;
  }
}
