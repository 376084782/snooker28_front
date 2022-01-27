
const { ccclass, property } = cc._decorator;

@ccclass
export default class WaitingStart extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }
    startTime = 0
    setStartTime(t) {
        this.startTime = t
    }
    update(dt) {
        if (!this.startTime) {
            return
        }
        let s = Math.ceil((this.startTime - new Date().getTime()) / 1000)
        if (s <= 0) {
            s = 0
        }
        this.label.string = '' + s;
    }
}
