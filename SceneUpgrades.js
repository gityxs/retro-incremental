class SceneUpgrades extends Scene {
  constructor(app) {
    super(app);
    this.createButton(10, 460, 428, 30, '轮回', () => {this.nextScene = 'Intro'});
    this.app.upgrades.forEach( (u, i) => {
    this.createButton(10, 230 + i * 35, 40, 30, '买', () => {this.app.buyUpgrade(i)}, {id: i});
    });
  }

  update() { 
    const deleteButtons = [];
    this.buttons.forEach( b => {
      if (b.id === undefined) {return;}
      const upgrade = this.app.upgrades[b.id];
      if (this.app.state[upgrade.stateVar] >= (upgrade.maxVal ?? Infinity)) {
        deleteButtons.push(b.id);
      }
    });

    deleteButtons.forEach( i => this.destroyButton(i) );
  }

  draw(ctx, width, height, t, mousePoint) { 
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.font = '24px VT323';
    ctx.fillStyle = 'white';

    ctx.fillText('不好了！ 复古先生死了！ 幸运的是，', 10, 30);
    ctx.fillText('轮回是复古城里的一件事。', 10, 60);
    ctx.fillText('当你返回时，你的进度将会丢失', 10, 90);
    ctx.fillText('但你购买的升级永远不会消失。', 10, 120);


    ctx.fillText(`分数: ${app.state.score}`, 10, 180);
    ctx.fillText('升级:', 10, 210);

    this.app.upgrades.forEach( (u, i) => {
      const upgradeCost = this.app.getUpgradeCost(i);
      let canBuy = upgradeCost <= this.app.state.score;
      if (u.stateVar === 'startLevel') {
        canBuy = canBuy && (this.app.state.startLevel + 1 <= this.app.state.maxStartLevel);
      }
      ctx.fillStyle = canBuy ? 'green' : 'red';
      ctx.fillText(`${u.text}: ${upgradeCost}`, 58, 253 + i * 35);
    });
  }
}

Scenes.Upgrades = SceneUpgrades;
