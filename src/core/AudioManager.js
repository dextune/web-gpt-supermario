const SFX = Object.freeze({
  jump: Object.freeze([
    Object.freeze([330, 0, 0.045, "square", 0.08]),
    Object.freeze([470, 0.025, 0.055, "square", 0.065]),
  ]),
  land: Object.freeze([
    Object.freeze([92, 0, 0.035, "triangle", 0.045]),
  ]),
  collect: Object.freeze([
    Object.freeze([880, 0, 0.04, "square", 0.085]),
    Object.freeze([1320, 0.035, 0.055, "square", 0.055]),
  ]),
  stomp: Object.freeze([
    Object.freeze([170, 0, 0.035, "square", 0.08]),
    Object.freeze([260, 0.022, 0.045, "triangle", 0.06]),
  ]),
  shell: Object.freeze([
    Object.freeze([130, 0, 0.045, "sawtooth", 0.055]),
    Object.freeze([210, 0.02, 0.05, "square", 0.05]),
  ]),
  block: Object.freeze([
    Object.freeze([240, 0, 0.035, "square", 0.06]),
    Object.freeze([190, 0.03, 0.04, "square", 0.045]),
  ]),
  power: Object.freeze([
    Object.freeze([440, 0, 0.07, "square", 0.07]),
    Object.freeze([660, 0.055, 0.08, "square", 0.065]),
    Object.freeze([990, 0.115, 0.12, "triangle", 0.055]),
  ]),
  hurt: Object.freeze([
    Object.freeze([180, 0, 0.07, "sawtooth", 0.06]),
    Object.freeze([110, 0.05, 0.11, "square", 0.055]),
  ]),
  death: Object.freeze([
    Object.freeze([180, 0, 0.1, "square", 0.07]),
    Object.freeze([135, 0.09, 0.12, "square", 0.065]),
    Object.freeze([88, 0.19, 0.2, "triangle", 0.055]),
  ]),
  goal: Object.freeze([
    Object.freeze([523, 0, 0.09, "square", 0.06]),
    Object.freeze([659, 0.08, 0.09, "square", 0.06]),
    Object.freeze([784, 0.16, 0.12, "triangle", 0.07]),
    Object.freeze([1047, 0.27, 0.18, "triangle", 0.055]),
  ]),
});

export class AudioManager {
  constructor() {
    this.context = null;
    this.master = null;
    this.music = null;
    this.sfx = null;
    this.enabled = true;
    this.masterVolume = 0.55;
    this.musicVolume = 0.45;
    this.sfxVolume = 0.7;
    this.unlockHandler = () => this.unlock();
  }

  initialize() {
    window.addEventListener("pointerdown", this.unlockHandler, { once: true });
    window.addEventListener("keydown", this.unlockHandler, { once: true });
  }

  unlock() {
    if (!this.context) {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return;
      this.context = new AudioContextCtor();
      this.master = this.context.createGain();
      this.music = this.context.createGain();
      this.sfx = this.context.createGain();
      this.music.connect(this.master);
      this.sfx.connect(this.master);
      this.master.connect(this.context.destination);
      this.master.gain.value = this.masterVolume;
      this.music.gain.value = this.musicVolume;
      this.sfx.gain.value = this.sfxVolume;
    }
    if (this.context.state === "suspended") this.context.resume();
  }

  play(name) {
    const notes = SFX[name];
    if (!notes || !this.enabled || !this.context || this.context.state !== "running") return;
    const base = this.context.currentTime;
    for (let i = 0; i < notes.length; i += 1) {
      const note = notes[i];
      this.scheduleTone(note[0], base + note[1], note[2], note[3], note[4]);
    }
  }

  tone(frequency = 440, duration = 0.06, type = "square", volume = 0.12) {
    if (!this.enabled || !this.context || this.context.state !== "running") return;
    this.scheduleTone(frequency, this.context.currentTime, duration, type, volume);
  }

  scheduleTone(frequency, start, duration, type, volume) {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(Math.max(0.001, volume), start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(this.sfx);
    osc.start(start);
    osc.stop(start + duration + 0.01);
  }

  destroy() {
    window.removeEventListener("pointerdown", this.unlockHandler);
    window.removeEventListener("keydown", this.unlockHandler);
    this.context?.close();
    this.context = null;
  }
}
