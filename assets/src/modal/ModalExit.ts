// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { PopupBase } from "../../commonScripts/popups/PopupBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ModalExit extends PopupBase {

    @property(cc.Node)
    btnSure: cc.Node = null;

    @property(cc.Node)
    btnCancel: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    call;
    // onLoad () {}

    start() {
        
        this.btnCancel.on(cc.Node.EventType.TOUCH_END, e => {
            this.hide()
        })
        this.btnSure.on(cc.Node.EventType.TOUCH_END, e => {
            this.call && this.call();
            this.hide()
        })
    }
    init({ call }) {
        this.call = call
    }

    // update (dt) {}
}
