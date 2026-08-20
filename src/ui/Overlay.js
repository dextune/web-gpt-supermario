export class Overlay {
  constructor(root) {
    this.root = root;
    this.title = root.querySelector('[data-overlay="title"]');
    this.body = root.querySelector('[data-overlay="body"]');
    this.prompt = root.querySelector('[data-overlay="prompt"]');
  }

  show(title, body, prompt = "") {
    this.title.textContent = title;
    this.body.textContent = body;
    this.prompt.textContent = prompt;
    this.root.classList.remove("hidden");
  }

  hide() { this.root.classList.add("hidden"); }
}
