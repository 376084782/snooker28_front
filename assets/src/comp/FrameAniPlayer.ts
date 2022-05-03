
const { ccclass, property } = cc._decorator;

@ccclass
export default class FrameAniPlayer extends cc.Component {

    @property(cc.SpriteAtlas)
    plist: cc.SpriteAtlas = null;


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        console.log(this.plist)

    }

    // update (dt) {}
}
