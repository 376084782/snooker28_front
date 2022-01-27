import { PopupBase } from "../../commonScripts/popups/PopupBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ModalWin extends PopupBase {

    @property(cc.Label)
    num: cc.Label = null;

    @property(cc.Node)
    btnNext: cc.Node = null;

    @property(sp.Skeleton)
    ani: sp.Skeleton = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.btnNext.on(cc.Node.EventType.TOUCH_END, e => { })
    }
    init(data: any): void {
        // this.ani.setAnimation(1,'',false)
        this.num.string = '+' + data.num
        data.call&&data.call()
    
    }

    // update (dt) {}
}
