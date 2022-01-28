
import EventManager from "../../commonScripts/core/EventManager";
import Utils from "../../commonScripts/utils/Utils";
import GameManager from "../manager/GameManager";
import SocketManager from "../manager/SocketManager";
import Chip from "./Chip";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChipSelecter extends cc.Component {

  @property(cc.Node)
  btn: cc.Node = null;
  @property(cc.Node)
  wrap: cc.Node = null;

  @property(cc.Layout)
  list: cc.Layout = null;

  @property(cc.Prefab)
  prefabChip: cc.Prefab = null;

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.wrap.active = false;
  }

  start() {
    this.btn.on(cc.Node.EventType.TOUCH_END, e => {
      this.wrap.active = !this.wrap.active;
    })
  }
  initChipList(list) {
    this.list.node.removeAllChildren();
    let gameInfo = GameManager.gameInfo;
    list.forEach((num, i) => {
      let isEnoungh = GameManager.selfInfo.coin >= num;
      let isBiggerThanNow = num > gameInfo.chip
      let round = gameInfo.round;
      console.log(i)
      let flagRound2 = round > 2 || (round <= 2 && i <= 1);
      console.log(flagRound2, 'flagRound2')
      let flagCanClick = isEnoungh && isBiggerThanNow && flagRound2
      let sp = cc.instantiate(this.prefabChip);
      let ctr = sp.getComponent(Chip);
      ctr.setData(num)
      let img = sp.getComponent(cc.Sprite);

      Utils.setGrey(!flagCanClick, img)
      this.list.node.addChild(sp);
      sp.on(cc.Node.EventType.TOUCH_END, e => {
        this.wrap.active = false;
        if (flagCanClick) {
          GameManager.selectedChip = num
          EventManager.emit('game/updateSelChip')
        }
      })
    });
  }

  // update (dt) {}
}
