class SceneTitle extends Scene {
  constructor(app) {
    super(app);
    this.canvas = app.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.mousePoint = app.mousePoint;
    this.keys = app.keys;
  }

  update() { 
    if (this.t > 3) {
      return 'PacSnakeInvaders';
    }
  }
  draw(ctx, width, height, t, mousePoint) { 
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.font = '24px VT323';
    ctx.fillStyle = 'white';
    ctx.fillText('Retro Incremental', 100, 100);
  }
}

Scenes.Title = SceneTitle;
