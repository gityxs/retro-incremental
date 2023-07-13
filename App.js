class App {
  constructor() {
    this.scenes = Scenes;
    this.mousePoint = { x: 0, y: 0, u: 0, v: 0 };
    this.keys = {};

    this.images = new Images();
    this.images.loadSpriteSheet('./sprites.json');

    this.canvas = document.getElementById('cmain');
    this.canvas.onmousemove = (e) => this.mouseMove(e);
    this.canvas.onclick = (e) => this.mouseClick(e);
    document.onkeydown = (e) => this.keydown(e);
    document.onkeyup = (e) => this.keyup(e);
    this.canvas.ontouchstart

    this.upgrades = [
      {text: '提高起始等级', lvlVar: 'slvl', cost: 5000, costMul: 100, stateVar: 'startLevel', upgradeType: '+', upgradeVal: 1, maxVal: 4},
      {text: '提高颗粒价值', lvlVar: 'pvlvl', cost: 200, costMul: 2, stateVar: 'pValue', upgradeType: '*', upgradeVal: 2},
      {text: '增加能量颗粒几率', lvlVar: 'pplvl', cost: 200, costMul: 2, stateVar: 'pChance', upgradeType: '*', upgradeVal: 2},
      {text: '提高生命值', lvlVar: 'hplvl', cost: 1000, stateVar: 'hp', costMul: 2, upgradeType: '+', upgradeVal: 1}
    ];

    this.loadFromStorage();

    this.loadScene('Loading');
    //this.loadScene('Intro');
    //this.loadScene('Invaders');
    //this.loadScene('Snake');
    //this.loadScene('PacSnakeInvaders');
    //this.loadScene('Upgrades');
    //this.loadScene('Ending');
    setInterval(() => app.tick(), 33);
    setInterval(() => app.saveToStorage(), 5000);

  }

  loadFromStorage() {
    const rawState = localStorage.getItem('retroIncremental');

    this.state = {
      score: 0,
      hp: 1,
      pValue: 1,
      pChance: 1, 
      startLevel: 1,
      maxStartLevel: 1,
      slvl: 0,
      pvlvl: 0,
      pplvl: 0,
      hplvl: 0
    };

    if (rawState !== null) {
      const loadedState = JSON.parse(rawState);
      this.state = {...this.state, ...loadedState};
    }

    this.saveToStorage();
  }

  saveToStorage() {
    const saveString = JSON.stringify(this.state);
    localStorage.setItem('retroIncremental', saveString);
  }

  reset() {
    localStorage.removeItem('retroIncremental');
    window.location.reload();
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
      this.currentScene._update();
    }
  }

  draw() {
    if (this.currentScene) {
      this.currentScene._draw();
    }
  }

  tick() {
    this.update();
    this.draw();

    if (this.currentScene.nextScene) {
      this.currentScene.unload();
      this.currentScene = new this.scenes[this.currentScene.nextScene](this);
      this.currentScene.nextScene = undefined;
      this.currentScene.load();
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

  mouseClick(e) {
    if (this.currentScene) {
      this.currentScene.click(e);
    }
  }

  getUpgradeCost(index) {
    const upgrade = this.upgrades[index];
    const curLvl = this.state[upgrade.lvlVar];
    return upgrade.cost * Math.pow(upgrade.costMul, curLvl); 
  }

  buyUpgrade(index) {
    const upgrade = this.upgrades[index];
    const upgradeCost = this.getUpgradeCost(index);
    let canBuy = upgradeCost <= this.state.score;
    if (upgrade.stateVar === 'startLevel') {
      canBuy = canBuy && (this.state.startLevel + 1 <= this.state.maxStartLevel);
    }
    if (canBuy) {
      this.state.score -= upgradeCost;
      this.state[upgrade.lvlVar]++;
      switch (upgrade.upgradeType) {
        case '+': {
          this.state[upgrade.stateVar] += upgrade.upgradeVal;
          break;
        }
        case '*': {
          this.state[upgrade.stateVar] *= upgrade.upgradeVal;
          break;
        }
        default: {
          throw 'INVALID UPGRADE TYPE ' + upgrade.upgradeType;
        }
      }
    }
  }

}

const app = new App();
