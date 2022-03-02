class SceneUpgrades extends Scene {
  constructor(app) {
    super(app);
    this.createButton(100, 0, 50, 30, 'DONE', () => {this.nextScene = 'Snake'});
  }

  update() { }

  draw(ctx, width, height, t, mousePoint) { 
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.font = '24px VT323';
    ctx.fillStyle = 'white';
    ctx.fillText('Upgrades', 5, 20);

    const upgrades = [
      {text: 'More cow bell', cost: 10},
      {text: 'Less cow bell', cost: 20}
    ];

    ctx.fillText(`Score: ${app.state.score}`, 160, 20);

    upgrades.forEach( (u, i) => {
      this.createButton(10, 35 + i * 35, 40, 30, 'Buy', () => {});
      ctx.fillText(`${u.text}: ${u.cost}`, 55, 57 + i * 35);

    });
  }
}

Scenes.Upgrades = SceneUpgrades;
