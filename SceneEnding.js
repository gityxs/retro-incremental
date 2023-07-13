class SceneEnding extends Scene {
  constructor(app) {
    super(app);
    this.scale = 16;
    this.width = Math.floor(this.canvas.width / this.scale);
    this.height = this.width;
    this.endStart = undefined;

    this.dialogs = [
      {delay: 1, speaker: 'invader', text: "我不能再这样做了。 你为什么一直和我战斗？!"},
      {delay: 1, speaker: 'player', text: "你绑架了我，把我带到了这个地方！ 我为什么不和你战斗呢？"},
      {delay: 2, speaker: 'invader', text: '你本来应该爱我的！'},
      {delay: 0.5, speaker: 'player', text: '纳尼?!'},
      {delay: 2, speaker: 'invader', text: "我带你来这里是为了照顾你，让你看到你对我来说有多重要。 我想我现在就带你回家。\n除非.."},
      {delay: 1, speaker: 'player', text: "等等。 我只是害怕。 我想尝试一下。"},
      {delay: 0.5, speaker: 'invader', text: "真的吗?!"},
      {delay: 1, speaker: 'player', text: "真的."}
    ];

    this.nextDialog = this.dialogs[0].delay;
  }

  load() {
    super.load();
    this.board = [
    'R============QW============('.split``,
    'H            ||            H'.split``,
    'H r--9 r---9 || r---9 r--9 H'.split``,
    'H |##| |###| || |###| |##| H'.split``,
    'H l--j l---j lj l---j l--j H'.split``,
    'H                          H'.split``,
    'H r--9 r9 r------9 r9 r--9 H'.split``,
    'H l--j || l--9r--j || l--j H'.split``,
    'H      ||    ||    ||      H'.split``,
    'L====( |l--9 || r--j| R====J'.split``,
    '#####H |r--j lj l--9| H#####'.split``,
    '#####H ||          || H#####'.split``,
    '#####H || R==gg==( || H#####'.split``,
    '=====J lj H##gg##H lj L====='.split``,
    '          H######H          '.split``,
    '=====( r9 H######H r9 R====='.split``,
    '#####H || L======J || H#####'.split``,
    '#####H ||          || H#####'.split``,
    '#####H || r------9 || H#####'.split``,
    'R====J lj l--9r--j lj L====('.split``,
    'H            ||            H'.split``,
    'H r--9 r---9 || r---9 r--9 H'.split``,
    'H l-9| l---j lj l---j |r-j H'.split``,
    'H   ||                ||   H'.split``,
    'A-9 || r9 r------9 r9 || r-Z'.split``,
    'S-j lj || l--9r--j || lj l-X'.split``,
    'H      ||    ||    ||      H'.split``,
    'H r----jl--9 || r--jl----9 H'.split``,
    'H l--------j lj l--------j H'.split``,
    'H                          H'.split``,
    'L==========================J'.split``
    ];
  }

  update() { }

  draw(ctx, width, height, t, mousePoint) { 
    this.drawBoard(ctx, width, height);

    if (this.t >= this.nextDialog) {
      const curDialog = this.dialogs.shift();
      if (this.dialogs.length > 0) {
        this.nextDialog = this.t + this.dialogs[0].delay;
      } else {
        this.nextDialog = Infinity;
        this.endStart = this.t + 1;
      }

      this.showDialog(curDialog.speaker, curDialog.text);
    }

    let ix;
    const iy = 17;
    let px;
    const py = 17;
    if (this.endStart !== undefined && this.t >= this.endStart) {
      const fadeIn = Math.min(1, (this.t - this.endStart) / 10);

      ix = this.lmap(fadeIn, 0, 0.6, 16, 27/2);
      px = this.lmap(fadeIn, 0, 0.6, 11, 27/2);

    } else {
      ix = 16;
      px = 11;
    }

    const frame = Math.floor(t % 2);
    this.app.images.drawFrame(ctx, 'invader', frame, ix * this.scale - 2, iy * this.scale - 2);

    const maxOpen = Math.PI / 2;
    const curOpen = maxOpen / 2 + (maxOpen / 2) * Math.sin(t * 24);
    const scale = this.scale;

    ctx.fillStyle = 'yellow';
    ctx.save();
    ctx.translate((px + 0.5) * scale, (py + 0.5) * scale);
    ctx.rotate(Math.PI);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, scale * 0.7, Math.PI + curOpen / 2, Math.PI - curOpen / 2);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();

    if (this.endStart !== undefined && this.t >= this.endStart) {
      const fadeIn = Math.min(1, (this.t - this.endStart) / 10);
      ctx.fillStyle = `hsla(0, 0%, 0%, ${fadeIn})`;
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = 16 * scale;
      const w = fadeIn * 400;
      const ratio = this.app.images.nameMap.heart.width / this.app.images.nameMap.heart.height;
      const h = w / ratio;
  
      this.app.images.draw(ctx, 'heart', cx - w / 2, cy - h / 2, w, h);

      ctx.fillStyle = 'white';
      ctx.font = '30px VT323';
      ctx.textAlign = 'center';
      ctx.fillText('终点', width * fadeIn / 2, 420);

      const mx = this.lmap(fadeIn, 0, 1, 480, 430);
      const my = 400;
      this.app.images.draw(ctx, 'msplayer', mx, my);

      ctx.textAlign = 'right';
      ctx.font = '20px VT323';
      if (fadeIn > 0.95) {
        ctx.fillText('@$*#&%!', mx - 5, my);
      }

    }
    //TODO: add ms pacman giving a wtf

  }
}

Scenes.Ending = SceneEnding;
