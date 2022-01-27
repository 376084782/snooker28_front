import Utils from "../../commonScripts/utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class txtWaiting extends cc.Component {

    _sec = 0;
    set sec(t) {
        if (t < 0) {
            t = 0;
        }
        this._sec = t;
        let txt = this.getComponent(cc.Label);
        txt.string = Utils.timeFormat('MM:SS', this.sec)
    };
    get sec() {
        return this._sec;
    }
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }
    startTimer(sec=0) {
        this.sec = sec;
        this.schedule(this.ticker, 1)
    }
    stopTimer() {
        this.unschedule(this.ticker);
    }
    resetAll() {
        this.sec = 0;
        this.stopTimer()
    }
    ticker() {
        this.sec++;
    }

    // update (dt) {}
}
