'use strict';

class Images {
  constructor() {
    this.nameMap = {};
    this.loadingCount = 0;
  }

  isDoneLoading() {
    return this.loadingCount === 0;
  }

  loadSingleImage(url, name) {
    const img = new Image();
    images.loadingCount++;
    img.onload = () => {
      this.nameMap[name] = {sx:0, sy: 0, width: img.width, height: img.height, img: img};
      this.loadingCount--;
    };
    img.src = url;
  }

  loadSpriteSheet(jsonurl) {
    this.loadingCount++;

    const xhr = new XMLHttpRequest();
    const imgthis = this;
    xhr.open('GET', jsonurl, true);
    xhr.responseType = 'json';
    xhr.onload = () => {
      let status = xhr.status;
      if (status === 200) {
        let json = xhr.response;
        imgthis.loadSpriteImage(json);
      } else {
        //do something with the error
      }
    };
    xhr.send();
  }

  loadSpriteImage(jsonData) {
    const img = new Image();
    img.onload = () => {
      jsonData.spriteList.forEach(s => {
        this.nameMap[s.name] = {img: img, sx: s.x, sy: s.y, width: s.width, height: s.height};
      });
      this.loadingCount--;
    };
    img.src = jsonData.imgUrl;
  }

  draw(ctx, name, x, y, w, h) {
    //x,y is the upper left corner
    /*
    void ctx.drawImage(image, dx, dy);
    void ctx.drawImage(image, dx, dy, dWidth, dHeight);
    void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    */
    const i = this.nameMap[name];
    const width = w ?? i.width;
    const height = h ?? i.height;
    ctx.drawImage(i.img, i.sx, i.sy, i.width, i.height, x, y, width, height);
  }

  drawFrame(ctx, name, frameNum, x, y, w, h) {
    //x,y is the upper left corner
    /*
    void ctx.drawImage(image, dx, dy);
    void ctx.drawImage(image, dx, dy, dWidth, dHeight);
    void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    */
    const i = this.nameMap[name];
    const width = w ?? i.width;
    const height = h ?? i.height;
    //frames are always layed out horizontally
    //frame N is at i.sx + n * (i.width + 1)
    const frameX = i.sx + frameNum * (i.width + 1);
    ctx.drawImage(i.img, frameX, i.sy, i.width, i.height, x, y, width, height);
  }

  getImageSize(name) {
    const i = images.nameMap[name];
    return {width: i.width, height: i.height};
  }
}

