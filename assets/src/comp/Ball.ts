import Utils from "../../commonScripts/utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Ball extends cc.Component {

    @property(cc.Sprite)
    bg: cc.Sprite = null;

    _num = 0;
    get num() {
        return this._num
    }
    set num(n) {
        this._num = n;
        this.bg.node.active = this.num > 0;
        if (this.num > 0) {
            if (this.num >= 99) {
                Utils.setSpImg(this.bg, `切图/球/_`)
            } else {
                Utils.setSpImg(this.bg, `切图/球/${this.num}`)
            }
        }
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
