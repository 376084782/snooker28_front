import AudioPlayer from "./core/AudioPlayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonDown extends cc.Component {
  startSkin: cc.SpriteFrame = null;

  @property(cc.SpriteFrame)
  skinDown: cc.SpriteFrame = null;

  @property(cc.Label)
  txtTime: cc.Label = null;
  // onLoad () {}
  sec = 0;
  startCountDown(sec) {
    this.disabled = true;
    this.sec = sec;
    this.tickerTimeDown();
    this.unschedule(this.tickerTimeDown);
    this.schedule(this.tickerTimeDown, 1, sec);
  }
  tickerTimeDown() {
    if (!this.txtTime) {
      return;
    }
    this.txtTime.node.active = true;
    this.txtTime.string = `${this.sec}s`;
    this.sec--;
    if (this.sec <= 0) {
      this.txtTime.node.active = false;
      this.disabled = false;
    }
  }

  _disabled: boolean = false;
  @property
  set disabled(flag) {
    this._disabled = flag;
    this.setSkin();
  }
  get disabled() {
    return this._disabled;
  }
  onLoad() {
    if (this.txtTime) {
      this.txtTime.node.active = false;
    }
    this.disabled = false;
  }
  setSkin() {
    let sp = this.getComponent(cc.Sprite);
    if (!!this.startSkin) {
      sp.spriteFrame = this.startSkin;
    }
  }
  start() {
    let sp = this.getComponent(cc.Sprite);
    this.startSkin = sp.spriteFrame;
    this.node.on(
      cc.Node.EventType.TOUCH_START,
      e => {
        sp.spriteFrame = this.skinDown;
        AudioPlayer.playEffectByUrl("sound/按钮3", false);
        let evt = new cc.Event("btnClicked", false);
        this.node.dispatchEvent(evt);
        // cc.tween(this.node)
        //   .to(0.15, { scaleX: 0.9, scaleY: 0.9 })
        //   .start();
      },
      this
    );
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.doAtCancel, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.doAtCancel, this);
  }
  doAtCancel() {
    this.setSkin();
    // cc.tween(this.node)
    //   .to(0.15, { scaleX: 1, scaleY: 1 })
    //   .start();
  }

  // update (dt) {}
}
