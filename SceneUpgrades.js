class SceneUpgrades extends Scene {
  constructor(app) {
    super(app);
    this.createButton(100, 0, 50, 30, 'DONE', () => {this.nextScene = 'Intro'});
    this.app.upgrades.forEach( (u, i) => {
      this.createButton(10, 35 + i * 35, 40, 30, 'Buy', () => {this.app.buyUpgrade(i)});
    });
  }

  update() { }

  draw(ctx, width, height, t, mousePoint) { 
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.font = '24px VT323';
    ctx.fillStyle = 'white';
    ctx.fillText('Upgrades', 5, 20);

    //more health
    //more points per pellet
    //start on higher level


    ctx.fillText(`Score: ${app.state.score}`, 160, 20);

    this.app.upgrades.forEach( (u, i) => {
      ctx.fillStyle = u.cost <= this.app.state.score ? 'green' : 'red';
      ctx.fillText(`${u.text}: ${u.cost}`, 55, 57 + i * 35);
    });
  }
}

Scenes.Upgrades = SceneUpgrades;
