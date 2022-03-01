class SceneTitle extends Scene {
  constructor(app) {
    super(app);
    this.createButton(100, 200, 100, 100, 'START', () => {this.nextScene = 'Snake'});
  }

  update() { 
    //if (this.t > 3) {
    //  return 'PacSnakeInvaders';
    //}
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
