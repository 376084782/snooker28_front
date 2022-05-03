// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { PopupBase } from "../../commonScripts/popups/PopupBase";
import Utils from "../../commonScripts/utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends PopupBase {

    @property(cc.Label)
    txtName: cc.Label = null;
    @property(cc.Label)
    txtGain: cc.Label = null;
    @property(cc.Label)
    txt28: cc.Label = null;

    @property(cc.Sprite)
    avatar: cc.Sprite = null;
    // LIFE-CYCLE CALLBACKS:
    @property(cc.Node)
    btnClose2: cc.Node = null;

    // onLoad () {}

    start() {
        this.btnClose2.on(cc.Node.EventType.TOUCH_END, e => {
            this.hide()
        })
    }

    async init({ uid, avatar, nickname }) {
        Utils.setSpImgFromNet(this.avatar, avatar);
        this.txtName.string = nickname
        let data: any = await Utils.doAjax({
            url: '/user/track',
            method: 'get',
            data: {
                uid
            }
        })
        let gain = data.gain;
        if (gain < 0) {
            gain = 0
        }
        this.txt28.string = '' + data.count28
        this.txtGain.string = '' + gain
    }
    // update (dt) {}
}
