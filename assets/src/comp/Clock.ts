// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Clock extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    _sec = 0;
    set sec(s) {
        this._sec = s;
        this.label.string = '' + s;
    }
    get sec() {
        return this._sec
    }
    start() {
    }
    setTime(s) {
        this.sec = s;
        this.schedule(this.timer, 1)
    }
    timer() {
        if (this.sec > 0) {
            this.sec--
        }
    }

    // update (dt) {}
}
