import { PopupBase } from "../../commonScripts/popups/PopupBase";
import Ball from "../comp/Ball";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ModalWin extends PopupBase {

    @property(cc.Label)
    txtCount: cc.Label = null;

    @property([Ball])
    listBall: Ball[] = []

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
    }
    init(data: any): void {
        this.renderNum(data.list, data.total)

    }

    renderNum(list, num) {
        this.txtCount.string = `总点数:${num}点`

        list.forEach((num, i) => {
            let ball = this.listBall[i];
            if (ball) {
                let ctr = ball.getComponent(Ball);
                ctr.num = num;
            }
        })
    }
    // update (dt) {}
}
