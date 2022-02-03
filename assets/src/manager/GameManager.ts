import PopupManager from "../../commonScripts/core/PopupManager";
import MathUtil from "../../commonScripts/utils/MathUtil";
import Utils from "../../commonScripts/utils/Utils";

export default class GameManager {
  static selectedChip = 0;
  static sort(list) {
    return list.sort((a, b) => {
      let sumA = this.getSumExpFirst(a.ballList);
      let sumB = this.getSumExpFirst(b.ballList);

      let funcCheck2 = () => {
        // B爆点或者认输了，继续比大小
        if (b.ballList.length > a.ballList.length) {
          // B球多 B大
          return 1;
        } else if (b.ballList.length == a.ballList.length) {
          // 一样多的球 第一个球谁大就谁大
          return b.ballList[0] > a.ballList[0] ? 1 : -1;
        } else {
          // B球少 B小
          return -1;
        }
      };
      let funcCheck1 = () => {
        // B没有公开球爆点或者认输
        if (totalB > totalA) {
          // 如果总和B大 B获胜
          return 1;
        } else if (totalB == totalA) {
          if (b.ballList.length > a.ballList.length) {
            return 1;
          } else if (b.ballList.length == a.ballList.length) {
            return b.ballList[0] > a.ballList[0] ? 1 : -1;
          } else {
            return -1;
          }
        } else {
          return -1;
        }
      };
      let totalA = MathUtil.sum(a.ballList);
      let totalB = MathUtil.sum(b.ballList);
      if (sumA > 28 || a.isLose) {
        // A公开球爆点或者认输
        if (sumB < 28 && !b.isLose) {
          // B没有爆点或者认输,B大
          return 1;
        } else {
          return funcCheck2();
        }
      } else {
        // A没有公开求爆点或者认输
        if (sumB < 28 && !b.isLose) {
          if (totalA > 28) {
            // A总球数爆点
            if (totalB > 28) {
              // B总球数也爆点了
              return funcCheck2();
            } else {
              // B总球没有爆点 B大
              return 1;
            }
          } else {
            // A总球没有爆点
            if (totalB > 28) {
              // B总球爆点 A大
              return -1;
            } else {
              return funcCheck1();
            }
          }
        } else {
          return -1;
        }
      }
    });
  }

  static hostAjax = "http://39.101.162.107:9020";
  static hostWS = "ws://39.101.162.107:9021";
  // static ip = 'localhost'
  static getSumExpFirst(list: number[]) {
    let s = 0;
    list.forEach((n, i) => {
      if (i != 0) {
        s += n;
      }
    });
    return s;
  }
  static sum(list: number[]) {
    let s = 0;
    list.forEach((n, i) => {
      s += n;
    });
    return s;
  }
  static config: any = {};
  static gameInfo: any = {};
  static listUser = [];
  static get uid() {
    return Utils.getQueryVariable("uid");
  }
  static level = 1;
  static step = 0;
  static get selfInfo(): any {
    return this.listUser.find(e => e.uid == this.uid);
  }
  static getSeatCS(seatC) {
    let s = seatC + this.selfInfo.seat - 1;
    return (s % 3) + 1;
  }
  static async showAniCoin(posFrom?, posEnd?) {
    let prefabCoin = await Utils.load("prefab/金币", cc.Prefab);
    let wrap = cc.Canvas.instance.node;
    wrap.convertToNodeSpaceAR(posFrom, posFrom);
    let p3 = wrap.convertToNodeSpaceAR(posEnd);
    for (let i = 0; i < 20; i++) {
      let sp = cc.instantiate(prefabCoin) as cc.Node;
      wrap.addChild(sp);
      sp.x = posFrom.x + MathUtil.getRandomInt(-120, 120);
      let y = posFrom.y + Math.random() * 20;
      sp.y = y - 70;
      sp.scale = 0;
      cc.tween(sp)
        .set({ scale: 0 })
        .to(0.1, { scale: 1, y: y })
        .delay(0.1 * Math.random())
        .to(0.2, {
          x: p3.x,
          y: p3.y,
          scale: 0.2
        })
        .call(() => {
          sp.destroy();
        })
        .start();
    }
  }

  static async showTxtAdded(num: number, posStart) {
    let prefab = await Utils.load("prefab/txtCoin", cc.Prefab);
    let sp = cc.instantiate(prefab) as cc.Node;
    let wrap = cc.Canvas.instance.node;
    let p = wrap.convertToNodeSpaceAR(posStart);
    wrap.addChild(sp);
    sp.opacity = 0;
    sp.x = p.x;
    sp.y = p.y;
    let txt = sp.getComponent(cc.Label);
    txt.string = num > 0 ? "+" + num : "" + num;
    sp.color =
      num > 0 ? new cc.Color(247, 237, 71) : new cc.Color(71, 247, 117);
    cc.tween(sp)
      .to(0.2, { x: p.x, y: p.y + 50, opacity: 255 })
      .delay(1)
      .to(0.2, { x: p.x, y: p.y, opacity: 0 })
      .call(() => {
        sp.destroy();
      })
      .start();
  }
  static getMoneyImg(num) {
    return `切图/main/筹码${num / 10000}万`;
  }
}

window["GameManager"] = GameManager;
