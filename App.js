class App {
  constructor() {
    this.scenes = Scenes;
    this.paused = false;
    this.mousePoint = { x: 0, y: 0, u: 0, v: 0 };
    this.keys = {};

    this.images = new Images();
    this.images.loadSpriteSheet('./sprites.json');

    this.canvas = document.getElementById('cmain');
    this.canvas.onmousemove = (e) => this.mouseMove(e);
    this.canvas.onclick = (e) => this.mouseClick(e);
    document.onkeydown = (e) => this.keydown(e);
    document.onkeyup = (e) => this.keyup(e);
    this.canvas.ontouchstart

    this.state = {};
    this.state.score = 0;

    //this.loadScene('Loading');
    this.loadScene('Upgrades');
    setInterval(() => app.tick(), 33);

  }

  loadScene(name) {

    if (this.currentScene !== undefined) {
      this.currentScene.unload();
    }
    this.currentScene = new this.scenes[name](this);
    this.currentScene.load();

  }

  update() {
    if (this.currentScene) {
      this.currentScene._update();
    }
  }

  draw() {
    if (this.currentScene) {
      this.currentScene._draw();
    }
  }

  tick() {
    if (!this.paused) {
      this.update();
      this.draw();
    }

    if (this.currentScene.nextScene) {
      this.currentScene.unload();
      this.currentScene = new this.scenes[this.currentScene.nextScene](this);
      this.currentScene.nextScene = undefined;
      this.currentScene.load();
    }
  }

  pause() {
    this.paused = !this.paused;
    if (this.paused) {
      document.getElementById('buttonPause').innerText = 'Run';
    } else {
      document.getElementById('buttonPause').innerText = 'Pause';
    }
  }

  reset() {
    if (this.loadedDay !== undefined) {
      this.loadDay(this.loadedDay);
    }
  }

  mouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePoint.x = Math.max(0, e.clientX - rect.left);
    this.mousePoint.y = Math.max(0, e.clientY - rect.top);
    this.mousePoint.u = this.mousePoint.x / this.canvas.width;
    this.mousePoint.v = this.mousePoint.y / this.canvas.height;
  }

  keydown(e) {
    this.keys[e.key] = true;
  }

  keyup(e) {
    delete this.keys[e.key];
  }

  mouseClick(e) {
    if (this.currentScene) {
      this.currentScene.click(e);
    }
  }

}

const app = new App();
