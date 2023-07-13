class SceneTitle extends Scene {
  constructor(app) {
    super(app);
    this.scale = 16;
    this.width = Math.floor(this.canvas.width / this.scale);
    this.height = this.width;
    this.createButton(100, 400, 248, 30, '开始', () => {this.nextScene = 'Intro'});
    this.createButton(385, 455, 40, 20, '重置', () => {app.reset();}, {fontSize: '12px'});
  }

  load() {
    this.board = [
    'R==========================('.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'L==========================J'.split``
    ];
  }

  update() { }
  draw(ctx, width, height, t, mousePoint) { 
    this.drawBoard(ctx, width, height);

    ctx.font = '36px VT323';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('复古增量', width * 0.5, 80);

    ctx.font = '20px VT323';
    ctx.fillStyle = 'hsla(0, 100%, 100%, 0.1)';
    ctx.fillText('(一个爱情故事))', width * 0.5, 110);

    const scale = 4;
    const px = 55;
    const py = 220;
    const ix = 280;
    const iy = 215;
    this.app.images.draw(ctx, 'dialogplayer', px, py, 20 * scale, 24 * scale);
    this.app.images.draw(ctx, 'dialoginvader', ix, iy, 33 * scale, 24 * scale);
  }

}

Scenes.Title = SceneTitle;
