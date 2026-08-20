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

  tone(frequency = 440, duration = 0.06, type = "square", volume = 0.12) {
    if (!this.enabled || !this.context || this.context.state !== "running") return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.sfx);
    osc.start(now);
    osc.stop(now + duration);
  }

  destroy() {
    window.removeEventListener("pointerdown", this.unlockHandler);
    window.removeEventListener("keydown", this.unlockHandler);
    this.context?.close();
    this.context = null;
  }
}
