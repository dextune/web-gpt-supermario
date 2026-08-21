import { Event } from "../data/constants.js";

export class HUD {
  constructor(root, events) {
    this.root = root;
    this.nodes = {
      score: root.querySelector('[data-hud="score"]'),
      coins: root.querySelector('[data-hud="coins"]'),
      lives: root.querySelector('[data-hud="lives"]'),
      time: root.querySelector('[data-hud="time"]'),
    };
    this.cells = {
      score: this.nodes.score?.parentElement,
      coins: this.nodes.coins?.parentElement,
      lives: this.nodes.lives?.parentElement,
      time: this.nodes.time?.parentElement,
    };
    this.last = { score: -1, coins: -1, lives: -1, time: -1 };
    this.disposers = events ? [
      events.on(Event.SCORE_CHANGED, () => this.pulse("score")),
      events.on(Event.COIN_COLLECTED, () => this.pulse("coins")),
      events.on(Event.PLAYER_HIT, () => this.pulse("lives", "danger")),
    ] : [];
  }

  pulse(key, extra = "") {
    const cell = this.cells[key];
    if (!cell) return;
    cell.classList.remove("hud-pulse", "danger");
    void cell.offsetWidth;
    if (extra) cell.classList.add(extra);
    cell.classList.add("hud-pulse");
  }

  update(session, time) {
    const seconds = Math.max(0, Math.ceil(time));
    if (session.score !== this.last.score) {
      this.nodes.score.textContent = String(session.score).padStart(6, "0");
      this.last.score = session.score;
    }
    if (session.coins !== this.last.coins) {
      this.nodes.coins.textContent = String(session.coins).padStart(2, "0");
      this.last.coins = session.coins;
    }
    if (session.lives !== this.last.lives) {
      this.nodes.lives.textContent = String(session.lives);
      this.last.lives = session.lives;
    }
    if (seconds !== this.last.time) {
      this.nodes.time.textContent = String(seconds);
      this.last.time = seconds;
      this.cells.time?.classList.toggle("warning", seconds <= 30);
    }
  }

  destroy() {
    for (const dispose of this.disposers) dispose();
    this.disposers.length = 0;
  }
}
