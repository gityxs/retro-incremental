class Scene {
  constructor(app) {
    this.app = app;
    this.canvas = app.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
    this.desc = '-';
    this.mousePoint = app.mousePoint;
    this.keys = app.keys;
    this.buttons = [];
    this.nextScene = undefined;
    this.paused = false;
  }

  load() {
    this.t = 0;
  }
  unload() { }
  update() { }
  _update() { 
    if (this.app.keys.Enter) {
      if (this.buttons.length > 0) {
        this.buttons[0].callback();
      }
    }
    if (!this.paused) {
      this.t += 0.033;
      this.update();
    }
  }
  draw(ctx, width, height, t, mousePoint) { }
  _draw() { 
    if (!this.paused) {
      this.ctx.save();
      this.draw(this.ctx, this.canvas.width, this.canvas.height, this.t, this.mousePoint);
      this.ctx.restore();
    }

    this.drawDialog();
    this.drawButtons();
  }
  click(e) {
    this.buttons.forEach( b => {
      if (this.isMouseInRect(b.x, b.y, b.w, b.h)) {
        b.callback();
      }
    });
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
  destroyButton(id) {
    //id would have to be passed in the config parameter when creating
    this.buttons = this.buttons.filter( b => b.id !== id );
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

    ctx.restore();
  }
  isMouseInRect(x, y, w, h) {
    const mx = this.mousePoint.x;
    const my = this.mousePoint.y;

    return (mx >= x) && (mx <= x + w) && (my >= y) && (my <= y + h);
  }
  showDialog(speaker, text, callback) {
    this.speaker = speaker;
    this.paused = true;
    this.dialogCallback = callback;
    this.createButton(this.canvas.width/2 - 20, this.canvas.height - 100 - 35, 40, 30, 'OK', () => {
      this.paused = false;
      this.dialog = undefined;
      this.destroyButton('dialog');
      if (this.dialogCallback) {
        this.dialogCallback();
      }
      this.dialogCallback = undefined;
    },
    {id: 'dialog'});
    this.dialog = this.splitDialog(text);
  }
  splitDialog(text) {
    let lines = [];

    if (text.match(/\n/)) {
      text.split`\n`.forEach( l => {
        lines = lines.concat(this.splitDialog(l)); 
      });
    } else {
      const maxWidth = 200;
      this.ctx.font = '20px VT323';
      let curWidth = 0;
      let curText = '';
      text.split` `.forEach( w => {
        const metrics = this.ctx.measureText(w + ' ');
        if (curWidth + metrics.width > maxWidth) {
          lines.push(curText);
          curWidth = metrics.width;
          curText = w + ' ';
        } else {
          curWidth += metrics.width;
          curText += w + ' ';
        }
      });
      if (curText.length > 0) {
        lines.push(curText);
      }
    }
    return lines;
  }
  drawDialog() {
    if (this.dialog === undefined) {return;}

    const ctx = this.ctx;
    ctx.save();
    ctx.font = '20px VT323';

    ctx.fillStyle = 'black';
    ctx.fillRect(100, 100, this.canvas.width - 200 , this.canvas.height - 200);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 100, this.canvas.width - 200, this.canvas.height - 200);
    app.images.draw(ctx, 'dialog' + this.speaker, 120, 120);

    ctx.fillStyle = 'white';
    let curY = 170;
    let dy = 24;
    this.dialog.forEach( l => {
      ctx.fillText(l, 120, curY);
      curY += dy;
    });

    ctx.restore();
  }

  drawBoard(ctx, width, height) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.beginPath();
    //draw board grid based on board array
    for (let y = 0; y < this.board.length; y++) {
      const row = this.board[y];
      for (let x = 0; x < row.length; x++) {
        const cell = row[x];
        switch (cell) {
          case '=': {
            ctx.moveTo(x * this.scale, (y + 0.33) * this.scale);
            ctx.lineTo((x + 1) * this.scale, (y + 0.33) * this.scale);
            ctx.moveTo(x * this.scale, (y + 0.67) * this.scale);
            ctx.lineTo((x + 1) * this.scale, (y + 0.67) * this.scale);
            break;;
          }
          case 'H': {
            ctx.moveTo((x + 0.33) * this.scale, y * this.scale);
            ctx.lineTo((x + 0.33) * this.scale, (y + 1) * this.scale);
            ctx.moveTo((x + 0.67) * this.scale, y * this.scale);
            ctx.lineTo((x + 0.67) * this.scale, (y + 1) * this.scale);
            break;
          }
          case 'R': {
            ctx.moveTo((x + 0.67) * this.scale, (y + 1) * this.scale);
            ctx.arc((x + 1) * this.scale, (y + 1) * this.scale, 0.33 * this.scale, Math.PI, 3 * Math.PI / 2);
            ctx.moveTo((x + 0.33) * this.scale, (y + 1) * this.scale);
            ctx.arc((x + 1) * this.scale, (y + 1) * this.scale, 0.67 * this.scale, Math.PI, 3 * Math.PI / 2);
            break;
          }
          case '(': {
            ctx.moveTo(x * this.scale, (y + 0.67) * this.scale);
            ctx.arc(x * this.scale, (y + 1) * this.scale, 0.33 * this.scale, 3 * Math.PI / 2, 2 * Math.PI);
            ctx.moveTo(x * this.scale, (y + 0.33) * this.scale);
            ctx.arc(x * this.scale, (y + 1) * this.scale, 0.67 * this.scale, 3 * Math.PI / 2, 2 * Math.PI);
            break;
          }
          case 'L': {
            ctx.moveTo((x + 0.67) * this.scale, y * this.scale);
            ctx.arc((x + 1) * this.scale, y * this.scale, 0.33 * this.scale, Math.PI, Math.PI / 2, true);
            ctx.moveTo((x + 0.33) * this.scale, y * this.scale);
            ctx.arc((x + 1) * this.scale, y * this.scale, 0.67 * this.scale, Math.PI, Math.PI / 2, true);
            break;
          }
          case 'J': {
            ctx.moveTo((x + 0.33) * this.scale, y * this.scale);
            ctx.arc(x * this.scale, y * this.scale, 0.33 * this.scale, 0, Math.PI / 2);
            ctx.moveTo((x + 0.67) * this.scale, y * this.scale);
            ctx.arc(x * this.scale, y * this.scale, 0.67 * this.scale, 0, Math.PI / 2);
            break;
          }
          case 'Q': {
            ctx.moveTo(x * this.scale, (y + 0.33) * this.scale);
            ctx.lineTo((x + 1) * this.scale, (y + 0.33) * this.scale);
            ctx.moveTo(x * this.scale, (y + 0.67) * this.scale);
            ctx.arc((x + 0.18) * this.scale, (y + 1) * this.scale, 0.33 * this.scale, 3 * Math.PI / 2, 2 * Math.PI);
            break;
          }
          case 'W': {
            ctx.moveTo(x * this.scale, (y + 0.33) * this.scale);
            ctx.lineTo((x + 1) * this.scale, (y + 0.33) * this.scale);
            ctx.moveTo((x + 1) * this.scale, (y + 0.67) * this.scale);
            ctx.arc((x + 0.82) * this.scale, (y + 1) * this.scale, 0.33 * this.scale, 3 * Math.PI / 2, Math.PI, true);
            break;
          }
          case 'A': {
            ctx.moveTo((x + 0.33) * this.scale, y * this.scale);
            ctx.lineTo((x + 0.33) * this.scale, (y + 1) * this.scale);
            ctx.moveTo((x + 0.67) * this.scale, y * this.scale);
            ctx.arc((x + 1) * this.scale, (y + 0.18) * this.scale, 0.33 * this.scale, Math.PI, Math.PI / 2, true);
            break;
          }
          case 'S': {
            ctx.moveTo((x + 0.33) * this.scale, y * this.scale);
            ctx.lineTo((x + 0.33) * this.scale, (y + 1) * this.scale);
            ctx.moveTo((x + 0.67) * this.scale, (y + 1) * this.scale);
            ctx.arc((x + 1) * this.scale, (y + 0.82) * this.scale, 0.33 * this.scale, Math.PI, 3 * Math.PI / 2);
            break;
          }
          case 'Z': {
            ctx.moveTo((x + 0.67) * this.scale, y * this.scale);
            ctx.lineTo((x + 0.67) * this.scale, (y + 1) * this.scale);
            ctx.moveTo((x + 0.33) * this.scale, y * this.scale);
            ctx.arc(x * this.scale, (y + 0.18) * this.scale, 0.33 * this.scale, 0, Math.PI / 2);
            break;
          }
          case 'X': {
            ctx.moveTo((x + 0.67) * this.scale, y * this.scale);
            ctx.lineTo((x + 0.67) * this.scale, (y + 1) * this.scale);
            ctx.moveTo((x + 0.33) * this.scale, (y + 1) * this.scale);
            ctx.arc(x * this.scale, (y + 0.82) * this.scale, 0.33 * this.scale, 0, 3 * Math.PI / 2, true);
            break;
          }
          case '-': {
            ctx.moveTo(x * this.scale, (y + 0.5) * this.scale);
            ctx.lineTo((x + 1) * this.scale, (y + 0.5) * this.scale);
            break;
          }
          case '|': {
            ctx.moveTo((x + 0.5) * this.scale, y * this.scale);
            ctx.lineTo((x + 0.5) * this.scale, (y + 1) * this.scale);
            break;
          }
          case 'r': {
            ctx.moveTo((x + 0.5) * this.scale, (y + 1) * this.scale);
            ctx.arc((x + 1) * this.scale, (y + 1) * this.scale, 0.5 * this.scale, Math.PI, 3 * Math.PI / 2);
            break;
          }
          case '9': {
            ctx.moveTo(x * this.scale, (y + 0.5) * this.scale);
            ctx.arc(x * this.scale, (y + 1) * this.scale, 0.5 * this.scale, 3 * Math.PI / 2, 2 * Math.PI);
            break;
          }
          case 'l': {
            ctx.moveTo((x + 0.5) * this.scale, y * this.scale);
            ctx.arc((x + 1) * this.scale, y * this.scale, 0.5 * this.scale, Math.PI, Math.PI / 2, true);
            break;
          }
          case 'j': {
            ctx.moveTo((x + 0.5) * this.scale, y * this.scale);
            ctx.arc(x * this.scale, y * this.scale, 0.5 * this.scale, 0, Math.PI / 2);
            break;
          }
          case 'g': {
            //this space draws as empty but looks non-empty to prevent player from trying to enter
            break;
          }
          case '#': {
            //this space draws as empty but looks non-empty to prevent anything from trying to enter
            break;
          }
          default: {
          }
        }
      }
    }
    ctx.stroke();
  }
}
const Scenes = {};
