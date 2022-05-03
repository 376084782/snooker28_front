import Utils from "../../commonScripts/utils/Utils";
import GameManager from "../manager/GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Chip extends cc.Component {

    @property([cc.Font])
    fntList: cc.Font[] = [];

    @property(cc.Label)
    txt: cc.Label = null;

    @property(cc.Sprite)
    bg: cc.Sprite = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }
    num = 0
    setData(num) {
        this.num = +num
        let i = GameManager.config.chipList.indexOf(num);
        if (i == -1) {
            i = 0;
        }
        let map = [2, 4, 6, 20, 40]
        Utils.setSpImg(this.bg, `切图/main/筹码${map[i]}万`)
        this.txt.font = this.fntList[i]
        this.txt.string = Utils.numberFormat(num)
    }

    // update (dt) {}
}
