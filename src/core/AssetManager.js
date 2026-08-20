export class AssetManager {
  constructor(audioContext = null) {
    this.audioContext = audioContext;
    this.cache = new Map();
  }

  async loadJSON(url) {
    if (this.cache.has(url)) return this.cache.get(url);
    const promise = fetch(url).then((response) => {
      if (!response.ok) throw new Error(`Failed to load JSON: ${url} (${response.status})`);
      return response.json();
    });
    this.cache.set(url, promise);
    return promise;
  }

  loadImage(url) {
    if (this.cache.has(url)) return this.cache.get(url);
    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      image.src = url;
    });
    this.cache.set(url, promise);
    return promise;
  }

  async loadAudio(url) {
    if (this.cache.has(url)) return this.cache.get(url);
    if (!this.audioContext) throw new Error("AudioContext is not configured");
    const promise = fetch(url)
      .then((response) => response.arrayBuffer())
      .then((buffer) => this.audioContext.decodeAudioData(buffer));
    this.cache.set(url, promise);
    return promise;
  }

  clear() {
    this.cache.clear();
  }
}
