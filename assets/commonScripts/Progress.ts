const { ccclass, property } = cc._decorator;

@ccclass
export default class Progress extends cc.Component {
  @property(cc.Label)
  label: cc.Label = null;

  @property(cc.Node)
  img: cc.Node = null;
  @property
  maxWidth = 600;
  _progress: number = 0;
  @property
  set progress(val) {
    if (val > 1) {
      val = 1;
    }
    if (val < 0) {
      val = 0;
    }
    this._progress = val;
    if (this.label) {
      this.label.string = "" + val;
    }
    this.img.width = this.maxWidth * val;
  }
  get progress() {
    return this._progress;
  }
  setTxt(txt) {
    if (this.label) {
      this.label.string = txt;
    }
  }
  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {}

  // update (dt) {}
}
