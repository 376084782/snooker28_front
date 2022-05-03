import AudioPlayer from "../../commonScripts/core/AudioPlayer";
import Utils from "../../commonScripts/utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BtnMusic extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    @property(cc.Integer)
    type: number = 1;

    music = 0;
    start() {
        if (this.type == 1) {
            this.music = AudioPlayer.musicVolume;
        } else {
            this.music = AudioPlayer.effectVolume;
        }
        this.updateImg()
        this.node.on(cc.Node.EventType.TOUCH_END, e => {
            this.music = this.music == 1 ? 0 : 1
            if (this.type == 1) {
                AudioPlayer.setMusicVolume(this.music)
            } else {
                AudioPlayer.setEffectVolume(this.music)
            }
            this.updateImg()
        })
    }
    updateImg() {
        Utils.setSpImg(this.getComponent(cc.Sprite), `切图/chat/${this.type == 1 ? '声音' : '音乐'}-${this.music == 0 ? '关' : '开'}`)
    }

    // update (dt) {}
}
