export class HUD {
  constructor(root) {
    this.nodes = {
      score: root.querySelector('[data-hud="score"]'),
      coins: root.querySelector('[data-hud="coins"]'),
      lives: root.querySelector('[data-hud="lives"]'),
      time: root.querySelector('[data-hud="time"]'),
    };
    this.last = { score: -1, coins: -1, lives: -1, time: -1 };
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
    }
  }
}
