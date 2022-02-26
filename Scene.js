class Scene {
  constructor(app) {
    this.canvas = app.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.desc = '-';
    this.mousePoint = app.mousePoint;
    this.keys = app.keys;
    this.buttons = [];
  }

  load() {
    this.t = 0;
  }
  unload() { }
  update() { }
  _update() { 
    this.t += 0.033;
    return this.update();
  }
  draw(ctx, width, height, t, mousePoint) { }
  _draw() { 
    this.ctx.save();
    this.draw(this.ctx, this.canvas.width, this.canvas.height, this.t, this.mousePoint);
    this.ctx.restore();

    this.drawButtons();
  }
  rnd(seed) {
    //return a value in [0,1)
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }
  pnoise(x, offset) {
    //return a value in [0, 1)
    //x is position in 1d noise 
    //offset selects between unique 1d noise sequences
    offset = offset|0;
    const x0 = Math.floor(x);
    const x1 = x0 + 1;
    const r0 = this.rnd(x0+offset);
    const r1 = this.rnd(x1+offset);
    const dx = x - x0;
    const rx = (r1 - r0) * dx + r0;
    return rx;
  }
  fnoise(x, config) {
    //return a value in [0, 1)
    //x is position in 1d noise
    //config is array of objects specifying relative amplitude and frequency
    // as {a, s}.
    let asum = 0;
    const r = config.reduce( (acc, c) => {
      asum += c.a;
      return acc + c.a * this.pnoise(x * c.s, c.s);
    }, 0);
    return r / asum;
  }
  lmap(value, inmin, inmax, outmin, outmax) {
    const inSize = inmax - inmin;
    const position = (value - inmin) / inSize;
    const outSize = outmax - outmin;
    return outmin + outSize * position;
  }
  createButton(x, y, w, h, text, callback, config) {
    const newButton = {
      ...{font: 'VT323',
          fontSize: '24px',
          bgColor: 'black',
          fgColor: 'white',
          strokeColor: 'white'},
      ...config,
      x, 
      y, 
      w, 
      h, 
      text,
      callback
    };

    this.buttons.push(newButton);
    return newButton;
  }
  drawButtons() {
    const ctx = this.ctx;
    ctx.save();

    this.buttons.forEach( b => {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${b.fontSize} ${b.font}`;
      ctx.fillStyle = b.bgColor;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = b.strokeColor;
      ctx.lineWidth = this.isMouseInRect(b.x, b.y, b.w, b.h) ? 2 : 1;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = b.fgColor;
      ctx.fillText(b.text, b.x + b.w / 2, b.y + b.h / 2);
    });

    ctx.fillStyle = 'white';
    ctx.fillRect(this.mousePoint.x, this.mousePoint.y, 5, 5);

    ctx.restore();
  }
  isMouseInRect(x, y, w, h) {
    const mx = this.mousePoint.x;
    const my = this.mousePoint.y;

    return (mx >= x) && (mx <= x + w) && (my >= y) && (my <= y + h);
  }
}
const Scenes = {};
