import PromiseUtil from "../../commonScripts/utils/PromiseUtil";
import Utils from "../../commonScripts/utils/Utils";
import Ball from "./Ball";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AreaBallTop extends cc.Component {

    @property(sp.Skeleton)
    ani: sp.Skeleton = null;

    @property(cc.Prefab)
    prefabBall: cc.Prefab = null;

    @property(cc.Node)
    wrap: cc.Node = null;
    protected onLoad(): void {
        this.ani.node.active = false;
    }
    start() {
        // this.delNum(3, cc.v2(100, -100));
    }
    playAnimate() {
        this.ani.node.active = true;
        this.ani.setAnimation(1, 'faqiu', false)
    }

    delNum(idx, pos: cc.Vec2) {
        return new Promise(rsv => {
            let ball = this.listBall[idx];
            cc.tween(ball.node)
                .to(.3, {
                    x: pos.x, y: pos.y
                })
                .call(async e => {
                    rsv(null)
                }).start();
        })
    }
    listBall: Ball[] = []
    initBall(list: number[]) {
        this.wrap.removeAllChildren();
        this.listBall = []
        let eachW = 50;
        let space = 2.6;
        let w = list.length * eachW + space * (list.length - 1);
        let startX = (this.wrap.width - w) / 2;

        list.forEach((num, i) => {
            let ball = cc.instantiate(this.prefabBall);
            let ctr = ball.getComponent(Ball);
            ctr.num = num;
            this.wrap.addChild(ball);
            ball.x = startX + (eachW + space) * i + (eachW / 2);
            this.listBall.push(ctr);
        })
    }

    // update (dt) {}
}
