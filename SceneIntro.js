/*
  player going to work
  get captured by invader
  go to Invaders scene
*/

class SceneIntro extends Scene {
  constructor(app) {
    super(app);
  }

  update() { 
    if (this.app.state.startLevel > 1) {
      this.nextScene = 'Invaders';
    }
    if (this.t > 10) {
      this.nextScene = 'Invaders';
    }
  }
  draw(ctx, width, height, t, mousePoint) { 
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // draw road
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.lineTo(width, 300);
    ctx.moveTo(0, 400);
    ctx.lineTo(width, 400);
    ctx.stroke();

    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.setLineDash([10, 30]);
    ctx.moveTo(0, 350);
    ctx.lineTo(width, 350);
    ctx.stroke();
    ctx.setLineDash([]);

    //draw buildings
    const buildings = [
      {w: 80, h: 200},
      {w: 100, h: 260},
      {w: 80, h: 100},
      {w: 110, h: 180},
      {w: 80, h: 120}
    ];

    let nextx = 0;
    buildings.forEach( b => {
      ctx.strokeStyle = 'blue';
      ctx.strokeRect(nextx, 300 - b.h, b.w, b.h);
      nextx += b.w;
    });

    //draw invader
    const frame = Math.floor(t % 2);
    const ix = width - this.t * 55;
    const iy = this.dialog2 ? 100 - (this.t - 4) * 30 : 100;
    const px = this.dialog2 ? ix : this.t * 50;
    const py = this.dialog2 ? 370 - (this.t - 4) * 70 : 370;

    //draw beam
    if (this.dialog2) {
      ctx.fillStyle = 'hsla(172, 100%, 50%, 0.5)';
      ctx.beginPath();
      ctx.moveTo(ix + 11, iy);
      ctx.lineTo(px + 50, py);
      ctx.lineTo(px - 50, py);
      ctx.lineTo(ix + 11, iy);
      ctx.fill();
    }

    this.app.images.drawFrame(ctx, 'invader', frame, ix, iy);

    //draw player
    const maxOpen = Math.PI / 2;
    const curOpen = maxOpen / 2 + (maxOpen / 2) * Math.sin(t * 24);
    const pr = 24;

    ctx.fillStyle = 'yellow';
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.PI);
    ctx.beginPath();
    ctx.arc(0, 0, pr, Math.PI + curOpen / 2, Math.PI * 2 + Math.PI / 8);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, pr, - Math.PI / 8, Math.PI - curOpen / 2);
    ctx.fill();
    ctx.restore();


    if (this.t > 2 && !this.dialog1) {
      this.showDialog('player', "嗨。 我是复古先生。 今天只是复古城里平凡的一天。 我要去上班了", () => this.dialog1 = true);
    }

    if (this.t > 4 && !this.dialog2) {
      this.showDialog('invader', "这个生命体似乎很合适。 请跟我来！", () => this.dialog2 = true);
    }

  }
}

Scenes.Intro = SceneIntro;
