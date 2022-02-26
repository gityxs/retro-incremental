class App {
  constructor() {
    this.scenes = Scenes;
    this.paused = false;
    this.mousePoint = { x: 0, y: 0, u: 0, v: 0 };
    this.keys = {};

    this.canvas = document.getElementById('cmain');
    this.canvas.onmousemove = (e) => this.mouseMove(e);
    document.onkeydown = (e) => this.keydown(e);
    document.onkeyup = (e) => this.keyup(e);

    this.loadScene('Title');
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
      this.nextScene = this.currentScene._update();
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

    if (this.nextScene) {
      this.currentScene.unload();
      this.currentScene = new this.scenes[this.nextScene](this);
      this.currentScene.load();
      this.nextScene = undefined;
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

}

const app = new App();
