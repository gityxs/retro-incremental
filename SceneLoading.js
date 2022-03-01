class SceneLoading extends Scene {
  constructor(app) {
    super(app);
  }

  update() { 
    const spritesLoaded = this.app.images.isDoneLoading();
    const fontLoaded = document.fonts.check('10px VT323');
    if (spritesLoaded && fontLoaded) {
      this.nextScene = 'Title';
    }
  }
  draw(ctx, width, height, t, mousePoint) { 
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.font = '24px VT323';
    ctx.fillStyle = this.t > 1 ? 'white' : 'black';
    //we must use the font or it will never show as loaded
    ctx.fillText('LOADING.' + '.'.repeat(Math.floor(this.t % 4)) , 100, 100);
  }
}

Scenes.Loading = SceneLoading;
