const { ccclass, property } = cc._decorator;

@ccclass
export default class FrameAnimatePlayer extends cc.Component {
  @property(cc.SpriteAtlas)
  res: cc.SpriteAtlas = null;

  @property(cc.Boolean)
  autoPlay: boolean = false;

  @property(cc.Boolean)
  loop: boolean = false;

  @property(cc.Float)
  interval: number = 1 / 10;
  get listSp() {
    return this.res.getSpriteFrames();
  }
  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {
    if (this.autoPlay) {
      this.play();
    }
  }
  idx = 0;
  play() {
    this.unscheduleAllCallbacks();
    this.schedule(this.playNext, this.interval);
  }
  playNext() {
    this.idx++;
    if (this.listSp.length <= this.idx) {
      if (!this.loop) {
        this.unscheduleAllCallbacks();
        return;
      } else {
        this.idx = 0;
      }
    }
    let sp = this.listSp[this.idx];
    this.node.getComponent(cc.Sprite).spriteFrame = sp;
    let size = sp.getOriginalSize();
    this.node.width = size.width;
    this.node.height = size.height;
  }
  // update (dt) {}
}
