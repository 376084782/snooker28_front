// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Utils from "../../commonScripts/utils/Utils";
import ConfigCustom from "../config/ConfigCustom";
import FrameAnimatePlayer from "../../commonScripts/FrameAnimatePlayer";
import SocketManager from "../manager/SocketManager";
import PromiseUtil from "../../commonScripts/utils/PromiseUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AreaChat extends cc.Component {

    @property(cc.ScrollView)
    wrapMsg: cc.ScrollView = null;

    @property(cc.Node)
    btnChat: cc.Node = null;
    @property(cc.Node)
    wrapChat: cc.Node = null;
    @property(cc.Node)
    shape: cc.Node = null;

    @property(cc.ScrollView)
    wrapEmoji: cc.ScrollView = null;

    @property(cc.Prefab)
    prefabMsg: cc.Prefab = null;

    @property(cc.Prefab)
    prefabEmoji: cc.Prefab = null;
    @property(cc.Node)
    innerMsg: cc.Node = null;
    @property(cc.Node)
    innerEmoji: cc.Node = null;

    canClick = true;
    start() {
        this.wrapMsg.node.active = true;
        this.wrapEmoji.node.active = false;
        this.toggle(false)
        this.shape.on(cc.Node.EventType.TOUCH_END, e => {
            this.toggle(false)
        })
        this.btnChat.on(cc.Node.EventType.TOUCH_END, e => {
            this.toggle()
        })

        this.renderAll()

    }
    onChangeTab(toggle: cc.Toggle) {
        this.wrapMsg.node.active = toggle.node.name == 'tabMsg';
        this.wrapEmoji.node.active = toggle.node.name == 'tabEmoji';
    }
    renderAll() {
        this.innerMsg.removeAllChildren()
        ConfigCustom.chatMsgList.forEach((conf) => {
            let sp = cc.instantiate(this.prefabMsg);
            let txt = sp.getChildByName('txt').getComponent(cc.Label);
            txt.string = conf.msg;
            this.innerMsg.addChild(sp);
            sp.on(cc.Node.EventType.TOUCH_END, e => {
                this.sendMsg('CHAT', {
                    type: 1, conf: {
                        msg: conf.msg,
                        audio: conf.audio
                    }
                })
            })
        })
        this.innerEmoji.removeAllChildren()
        ConfigCustom.emojiList.forEach(async conf => {
            let spWrap = new cc.Node();
            spWrap.width = 86;
            spWrap.height = 90;
            let sp = cc.instantiate(this.prefabEmoji);
            sp.scale = .9
            spWrap.addChild(sp)
            let list = await Utils.load(conf.url, cc.SpriteAtlas) as cc.SpriteAtlas;
            let player = sp.getComponent(FrameAnimatePlayer)
            player.listSp = list.getSpriteFrames();
            player.play()
            this.innerEmoji.addChild(spWrap);
            sp.on(cc.Node.EventType.TOUCH_END, e => {
                this.sendMsg('CHAT', {
                    type: 2, conf: {
                        url: conf.url,
                        audio: conf.audio
                    }
                })
            })
        })
    }
    toggle(flag?) {
        if (flag != undefined) {
            this.wrapChat.active = flag
        } else {
            this.wrapChat.active = !this.wrapChat.active;
        }
        this.shape.active = this.wrapChat.active;
    }
    sendMsg(type, conf) {
        this.toggle(false)
        if (!this.canClick) {
            Utils.showToast('请勿频繁发送~')
            return
        }
        this.canClick = false;
        SocketManager.sendMessage('CHAT', {
            type, conf
        })
        PromiseUtil.wait(3).then(e => {
            this.canClick = true;
        })

    }

    // update (dt) {}
}
