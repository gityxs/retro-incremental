'use strict';

class SketchInvadersPlayer {
  constructor(sketch, x, y, dir) {
    this.sketch = sketch;
    this.startx = x;
    this.starty = y;
    this.startdir = dir;
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.powered = false;
    this.eatCount = 0;
    this.powerEnd = -1;
    this.tailSize = 0;
    this.length = 0;
    this.lastKey = 0;
    this.hp = app.state.hp;
    this.tail = undefined;
    this.trail = [];
    this.ghostsEaten = 0;
    this.invinTimeout = 0;
    for (let i = 0; i < 7; i++) {
      this.trail.push({x: this.x, y: this.y});
    }
    this.dead = false;
    this.dirAngleMap = {
      l: 0,
      r: Math.PI,
      u: Math.PI / 2,
      d: -Math.PI / 2
    };
    this.dirMoveMap = {
      l: [-1, 0],
      r: [1, 0],
      u: [0, -1],
      d: [0, 1]
    };
    this.dirCheckAdd = {
      l: [0, 0],
      r: [1, 0],
      u: [0, 0],
      d: [0, 1]
    }
  }

  update() {
    const startx = this.x;
    const starty = this.y;
    //try to move in the player direction without going off the valid path
    const move = this.dirMoveMap[this.dir];
    const speed = 0.2;
    const newX = this.x + move[0] * speed;
    const newY = this.y + move[1] * speed;
    const dirCheck = this.dirCheckAdd[this.dir];
    const gridX = Math.floor(newX + dirCheck[0]);
    const gridY = Math.floor(newY + dirCheck[1]);
    if (this.sketch.board[gridY]?.[gridX] === ' ') {
      this.x = newX;
      this.y = newY;
      if (this.dir === 'l' || this.dir === 'r') {
        this.y = Math.round(this.y);
      }
      if (this.dir === 'u' || this.dir === 'd') {
        this.x = Math.round(this.x);
      }
    } else {
      //if we can't take a step, round the position to make it easier to turn
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
    }

    //wrap around 
    if (this.x < 0.2 && this.dir === 'l') {
      this.x = 27;
    }
    if (this.x > 26.8 && this.dir === 'r') {
      this.x = 0;
    }
    if (this.y < 0.2 && this.dir === 'u') {
      this.y = 30;
    }
    if (this.y > 29.8 && this.dir === 'd') {
      this.y = 0;
    }

    //if we actually moved, update the trail
    if (this.x !== startx || this.y !== starty) {
      this.trail.shift();
      this.trail.push({x: startx, y: starty});
    }


    const keys = {...this.sketch.keys};

    //handle key presses
    if (keys.w || keys.ArrowUp) {
      const movex = Math.round(this.x + this.dirMoveMap.u[0]);
      const movey = Math.round(this.y + this.dirMoveMap.u[1]);
      if (this.sketch.board[movey]?.[movex] === ' ') {
        this.dir = 'u';
      }
      this.lastKey = this.sketch.t;
    } 
    if (keys.s || keys.ArrowDown) {
      const movex = Math.round(this.x + this.dirMoveMap.d[0]);
      const movey = Math.round(this.y + this.dirMoveMap.d[1]);
      if (this.sketch.board[movey]?.[movex] === ' ') {
        this.dir = 'd';
      }
      this.lastKey = this.sketch.t;
    } 
    if (keys.a || keys.ArrowLeft) {
      const movex = Math.round(this.x + this.dirMoveMap.l[0]);
      const movey = Math.round(this.y + this.dirMoveMap.l[1]);
      if (this.sketch.board[movey]?.[movex] === ' ') {
        this.dir = 'l';
      }
      this.lastKey = this.sketch.t;
    } 
    if (keys.d || keys.ArrowRight) {
      const movex = Math.round(this.x + this.dirMoveMap.r[0]);
      const movey = Math.round(this.y + this.dirMoveMap.r[1]);
      if (this.sketch.board[movey]?.[movex] === ' ') {
        this.dir = 'r';
      }
      this.lastKey = this.sketch.t;
    }


    //eat pellets
    this.sketch.pellets.forEach( p => {
      if (p.x === gridX && p.y === gridY && p.eaten === false) {
        p.eaten = true;
        this.eatCount++;
        app.state.score += (this.length + 1) * (p.power ? 100 : 10) * app.state.pValue;
        if (!this.dialog1) {
          this.sketch.showDialog('player', 'Wow! A pellet! Delicious and valuable!', () => this.dialog1 = true);
        }
        if (p.power) {
          this.powered = true;
          this.powerEnd = this.sketch.t + 5;
          if (!this.dialog2) {
            this.sketch.showDialog('player', "Now I can eat the invaders!\nYum!", () => this.dialog2 = true);
          }
        }
        this.tailSize += 0.5;
      }
    });

    //end power mode if timeout
    if (this.sketch.t > this.powerEnd) {
      this.powered = false;
    }

    //interact with ghosts
    this.sketch.ghosts.forEach( g => {
      const dx = this.x - g.x;
      const dy = this.y - g.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 0.7 * 0.7) {
        if (this.powered) {
          g.alive = false;
          app.state.score += (this.length + 1) * 100 * app.state.pValue;
          this.tailSize += 1;
          this.ghostsEaten++;

          if (this.sketch.ghosts.length === 1) {
            this.sketch.showDialog('invader', "This is not going how I had planned! Let's try something new.", () => this.sketch.nextScene = 'Snake');
          }
        } else {
          if (this.sketch.t > this.invinTimeout) {
            this.die();
          }
        }
      }
    });

    //die if hit by bullet
    this.sketch.bullets.forEach( b => {
      const dx = this.x - b.x;
      const dy = this.y - b.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 0.7 * 0.7) {
        if (this.powered) {
          b.alive = false;
          app.state.score += (this.length + 1) * 1 * app.state.pValue;
          this.tailSize += 1;
        } else {
          if (this.sketch.t > this.invinTimeout) {
            this.die();
          }
        }
      }
    });

    if (this.tail !== undefined) {
      this.tail.update();
    }

  }

  die() {

    this.hp--;
    this.invinTimeout = this.sketch.t + 0.5;
    if (this.hp > 0) {return;}

    this.x = this.startx;
    this.y = this.starty;
    this.dir = this.startdir;
    this.length = 0;
    if (this.tail !== undefined) {
      this.tail.die();
    }
    this.tail = undefined;
    this.powered = false;
    this.powerEnd = -1;
    this.dead = true;
    this.tailSize = 0;
    this.trail = [];
    for (let i = 0; i < 7; i++) {
      this.trail.push({x: this.x, y: this.y});
    }

    this.sketch.ghosts = [];
    this.sketch.bullets = [];
  }

  draw(ctx, scale, t) {
    const maxOpen = Math.PI / 2;
    const curOpen = maxOpen / 2 + (maxOpen / 2) * Math.sin(t * 24);

    const poweredFractionRemaining = (this.powerEnd - t) / 10;
    const flashRate = poweredFractionRemaining > 0.25 ? 0 : 200;
    const colorIndex = this.powered ? Math.round(0.5 + 0.5 * Math.cos(poweredFractionRemaining * flashRate)) : 0;
    ctx.fillStyle = ['yellow', 'blue'][colorIndex];
    ctx.save();
    ctx.translate((this.x + 0.5) * scale, (this.y + 0.5) * scale);
    ctx.rotate(this.dirAngleMap[this.dir]);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, scale * 0.8, Math.PI + curOpen / 2, Math.PI - curOpen / 2);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();

    if (this.tail !== undefined) {
      this.tail.draw(ctx, scale, t);
    }
  }
}

class SketchInvadersGhost {
  constructor(sketch, x, y, dir) {
    this.sketch = sketch;
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.alive = true;
    this.rndMove = false;
    this.dirAngleMap = {
      l: 0,
      r: Math.PI,
      u: Math.PI / 2,
      d: -Math.PI / 2
    };
    this.dirMoveMap = {
      l: [-1, 0],
      r: [1, 0],
      u: [0, -1],
      d: [0, 1]
    };
    this.dirCheckAdd = {
      l: [0, 0],
      r: [1, 0],
      u: [0, 0],
      d: [0, 1]
    }
  }

  update() {

    const moveDown = this.sketch.t % 4 < 0.3;
    const moveRight = (this.sketch.t % 8) - 4 < 0;

    if (!this.rndMove) {
      this.dir = moveDown ? 'd' : (moveRight ? 'r' : 'l');
    }

    if (this.y > 22) {
      this.rndMove = true;
    }


    const move = this.dirMoveMap[this.dir];

    const speed = 0.1;
    const newX = this.x + move[0] * speed;
    const newY = this.y + move[1] * speed;
    const dirCheck = this.dirCheckAdd[this.dir];
    const gridX = Math.floor(newX + dirCheck[0]);
    const gridY = Math.floor(newY + dirCheck[1]);
    const testCell = this.sketch.board[gridY]?.[gridX];
    //don't move onto the player tail
    let curTail = this.sketch.player.tail;
    let tailHit = false;
    while (curTail !== undefined) {
      const dx = newX - curTail.x;
      const dy = newY - curTail.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 0.7 * 0.7) {
        tailHit = true;
      }
      
      curTail = curTail.tail;
    }

    if ((testCell === ' ' || testCell === 'g') && !tailHit) {
      this.x = newX;
      this.y = newY;
      if (this.dir === 'l' || this.dir === 'r') {
        this.y = Math.round(this.y);
      }
      if (this.dir === 'u' || this.dir === 'd') {
        this.x = Math.round(this.x);
      }
    } else {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
    }

    if (this.x < 0.2 && this.y === 14 && this.dir === 'l') {
      this.x = 27;
    }
    if (this.x > 26.8 && this.y === 14 && this.dir === 'r') {
      this.x = 0;
    }

    const keys = {};
    //select a random key that isn't just moving backwards
    keys.w = Math.random() > 0.98 && this.dir !== 'd';
    keys.s = Math.random() > 0.98 && this.dir !== 'u';
    keys.a = Math.random() > 0.98 && this.dir !== 'r';
    keys.d = Math.random() > 0.98 && this.dir !== 'l';
    if (tailHit) {
      const reverse = {
        l: 'd',
        r: 'a',
        u: 's',
        d: 'w'
      };
      keys[reverse[this.dir]] = true;
    }

    if (keys.w) {
      const movex = Math.round(this.x + this.dirMoveMap.u[0]);
      const movey = Math.round(this.y + this.dirMoveMap.u[1]);
      if (this.sketch.board[movey]?.[movex] === ' ') {
        this.dir = 'u';
      }
    } 
    if (keys.s) {
      const movex = Math.round(this.x + this.dirMoveMap.d[0]);
      const movey = Math.round(this.y + this.dirMoveMap.d[1]);
      if (this.sketch.board[movey]?.[movex] === ' ') {
        this.dir = 'd';
      }
    } 
    if (keys.a) {
      const movex = Math.round(this.x + this.dirMoveMap.l[0]);
      const movey = Math.round(this.y + this.dirMoveMap.l[1]);
      if (this.sketch.board[movey]?.[movex] === ' ') {
        this.dir = 'l';
      }
    } 
    if (keys.d) {
      const movex = Math.round(this.x + this.dirMoveMap.r[0]);
      const movey = Math.round(this.y + this.dirMoveMap.r[1]);
      if (this.sketch.board[movey]?.[movex] === ' ') {
        this.dir = 'r';
      }
    }

    let bulletThreshold;

    if (this.rndMove) {
      bulletThreshold = 0.95;
    } else {
      bulletThreshold = this.sketch.lmap(this.y, 4, 28, 1, 0.98);
    }


    //fire a bullet
    if (Math.random() > bulletThreshold) {
      this.sketch.bullets.push(new SketchInvadersBullet(this.sketch, Math.floor(this.x), this.y));
    }
  }

  draw(ctx, scale, t) {
    const poweredFractionRemaining = (this.sketch.player.powerEnd - t) / 10;
    const flashRate = poweredFractionRemaining > 0.25 ? 0 : 200;
    const colorIndex = this.sketch.player.powered ? Math.round(0.5 + 0.5 * Math.cos(poweredFractionRemaining * flashRate)) : 0;
    const dx = this.x * scale - 2;
    const dy = this.y * scale - 2;
    const frame = Math.floor(t % 2);
    const spriteName = colorIndex === 0 ? 'invader' : 'invaderBlue';
    app.images.drawFrame(ctx, spriteName, frame, dx, dy);
  }
}

class SketchInvadersBullet {
  constructor(sketch, x, y) {
    this.sketch = sketch;
    this.x = x;
    this.y = y;
    this.alive = true;
    this.dirMoveMap = {
      l: [-1, 0],
      r: [1, 0],
      u: [0, -1],
      d: [0, 1]
    };
    this.dirCheckAdd = {
      l: [0, 0],
      r: [1, 0],
      u: [0, 0],
      d: [0, 1]
    }
  }
  
  update() {
    //bullets only go down
    const move = this.dirMoveMap.d;
    const speed = 0.2;
    const newX = this.x + move[0] * speed;
    const newY = this.y + move[1] * speed;
    const dirCheck = this.dirCheckAdd.d;
    const gridX = Math.floor(newX + dirCheck[0]);
    const gridY = Math.floor(newY + dirCheck[1]);
    const testCell = this.sketch.board[gridY]?.[gridX];
    //don't move onto the player tail
    let curTail = this.sketch.player.tail;
    let tailHit = false;
    while (curTail !== undefined) {
      const dx = newX - curTail.x;
      const dy = newY - curTail.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 0.7 * 0.7) {
        this.alive = false;
      }
      
      curTail = curTail.tail;
    }

    if ((testCell === ' ' || testCell === 'g') && !tailHit) {
      this.x = newX;
      this.y = newY;
      if (this.dir === 'l' || this.dir === 'r') {
        this.y = Math.round(this.y);
      }
      if (this.dir === 'u' || this.dir === 'd') {
        this.x = Math.round(this.x);
      }
    } else {
      this.alive = false;
    }
  }

  draw(ctx, scale, t) {
    const poweredFractionRemaining = (this.sketch.player.powerEnd - t) / 10;
    const flashRate = poweredFractionRemaining > 0.25 ? 0 : 200;
    const colorIndex = this.sketch.player.powered ? Math.round(0.5 + 0.5 * Math.cos(poweredFractionRemaining * flashRate)) : 0;
    ctx.fillStyle = ['white', 'blue'][colorIndex];
    const width = 3;
    const height = 9;
    ctx.fillRect((this.x + 0.5) * scale - width / 2, (this.y + 0.5) * scale - height / 2, width, height);
  }

}

class SketchInvadersPellet {
  constructor(sketch, x, y, power) {
    this.sketch = sketch;
    this.x = x;
    this.y = y;
    this.power = power;
    this.eaten = false;
  }

  update() {}

  draw(ctx, scale, t) {
    if (this.eaten) {return;}
    const r = this.power ? 0.5 : 0.12;
    ctx.beginPath();
    ctx.arc((this.x + 0.5) * scale, (this.y + 0.5) * scale, r * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

class SceneInvaders extends Scene {
  constructor(app) {
    super(app);
    this.scale = 16;
    this.width = Math.floor(this.canvas.width / this.scale);
    this.height = this.width;
    app.state.maxStartLevel = Math.max(app.state.maxStartLevel, 2);
  }

  load() {
    super.load();
    this.ghosts = [];
    this.bullets = [];

    this.player = new SketchInvadersPlayer(this, 13.5, 23, 'r');

    //define the board layouts
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
    'H          R==(            H'.split``,
    'H          H  H            H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'H                          H'.split``,
    'L==========================J'.split``
    ];

    this.pellets = [];

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 8; col++) {
        const gx = 1 + col * 2;
        const gy = 4 + row * 2;
        this.ghosts.push(new SketchInvadersGhost(this, gx, gy, 'u'));
      }
    }

  }

  update() {
    
    if (this.app.state.startLevel > 2) {
      this.nextScene = 'Snake';
    }

    this.bullets.forEach( b => {
      b.update();
    });

    this.player.update();

    this.ghosts.forEach( g => {
      g.update();
    });

    this.pellets = this.pellets.filter( p => !p.eaten );

    const pprob = 0.01 + 0.5;
    const pthresh = this.pellets.length === 0 ? 0 : (1 - pprob);
    const powerprob = 1 / (50 / app.state.pChance);
    const powerthresh = 1 - powerprob;


    if (this.pellets.length < 50 && Math.random() > pthresh) {
      const newx = 1 + Math.floor(Math.random() * 26);
      const newy = 28 - Math.floor(Math.random() * 4);
      const power = this.t > 15 && Math.random() > powerthresh;
      if (this.board[newy][newx] === ' ' && newx !== 12 && newx !== 13) {
        this.pellets.push(new SketchInvadersPellet(this, newx, newy, power));
      }
    }

    //remove dead objects
    this.ghosts = this.ghosts.filter( g => g.alive );
    this.bullets = this.bullets.filter( b => b.alive );

    if (this.player.dead) {
      this.nextScene = 'Upgrades';
    }
    
  }

  draw(ctx, width, height, t, mousePoint) {
    this.drawBoard(ctx, width, height);
 
    //set the fill style here to improve performance
    ctx.fillStyle = 'white';
    this.pellets.forEach( o => {
      o.draw(ctx, this.scale, t);
    });

    this.ghosts.forEach( g => {
      g.draw(ctx, this.scale, t);
    });

    this.player.draw(ctx, this.scale, t);

    this.bullets.forEach( b => {
      b.draw(ctx, this.scale, t);
    });

    //draw score
    ctx.fillStyle = 'white';
    ctx.font = '25px VT323';
    ctx.fillText(`分数: ${app.state.score}`, 10, 508);

    //draw hp
    const hp = this.player.hp;
    const maxhp = app.state.hp;
    const hpWidth = 100;
    const hpHeight = 10;
    const hpPieceWidth = hpWidth / maxhp;
    const barWidth = Math.max(1, hpPieceWidth - 2);
    ctx.fillStyle = 'red';

    for (let i = 0; i < maxhp; i++) {
      const squareHP = maxhp - i;
      if (hp < squareHP) {continue;}
      const startx = width - hpWidth - 5 + i * hpPieceWidth;
      ctx.fillRect(startx, height - hpHeight - 5, barWidth, hpHeight); 
    }
  }
}

Scenes.Invaders = SceneInvaders;
