import AudioPlayer from "../../commonScripts/core/AudioPlayer";
import EventManager from "../../commonScripts/core/EventManager";
import PopupManager from "../../commonScripts/core/PopupManager";
import Utils from "../../commonScripts/utils/Utils";
import GameManager from "../manager/GameManager";
import SocketManager from "../manager/SocketManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneRoom extends cc.Component {

    @property(cc.Prefab)
    prefabRoom: cc.Prefab = null;

    @property(cc.Node)
    wrap: cc.Node = null;

    @property(cc.Node)
    btnRule: cc.Node = null;

    @property(cc.Node)
    btnBack: cc.Node = null;

    @property(cc.Node)
    shapeUnlinked: cc.Node = null;
    start() {
        this.shapeUnlink.active = false;
        AudioPlayer.resumeAllMusic();
        this.listen()
        this.wrap.removeAllChildren();

        this.initRoom();
        this.schedule(this.initRoom, 5, cc.macro.REPEAT_FOREVER)
    }
    updateShapeUnlink(flag) {
        this.shapeUnlinked.active = flag;
    }
    @property(cc.Node)
    shapeUnlink: cc.Node = null;
    @property(cc.Node)
    shapeUnlinkBtn: cc.Node = null;
    listen() {
        this.shapeUnlinkBtn.on(cc.Node.EventType.TOUCH_END, e => {
            location.href = 'uniwebview://close';
        })
        EventManager.on("game/updateShapeUnlink", this.updateShapeUnlink, this);
        this.btnBack.on(cc.Node.EventType.TOUCH_END, e => {
            PopupManager.show('modal/modalExit', {
                call() {
                    location.href = 'uniwebview://close'
                }
            })
        })

        this.btnRule.on(cc.Node.EventType.TOUCH_END, e => {
            PopupManager.show('modal/modalRule')
        })
        EventManager.on('game/showUnlink', this.showUnlink, this)
    }
    showUnlink() {
        this.updateShapeUnlink(false)
        this.shapeUnlink.active = true;
    }
    async initRoom() {
        let list = await Utils.doAjax({
            url: '/room/list',
            method: 'get',
            data: {}
        }) as any[]
        this.wrap.removeAllChildren();
        list.forEach(conf => {
            let sp = cc.instantiate(this.prefabRoom);
            let img = sp.getComponent(cc.Sprite);
            let txt = sp.getChildByName('场次数字').getComponent(cc.Label);
            let txtPeople = sp.getChildByName('txtPeople').getComponent(cc.Label);
            let txtMin = sp.getChildByName('wrapMin').getChildByName('txtMin').getComponent(cc.Label);
            let map = {
                1: '低倍场',
                2: '中倍场',
                3: '高倍场',
                4: '大师场',
                5: '宗师场',
                6: 'VIP场',
            }
            Utils.setSpImg(img, `切图/房间/${map[conf.id]}`)
            txt.string = (conf.basicChip / 100).toFixed(0)
            txtMin.string = `${Utils.numberFormat(conf.min)}-${Utils.numberFormat(conf.max)}`
            txtPeople.string = '' + (conf.count * 39)
            this.wrap.addChild(sp);
            sp.on(cc.Node.EventType.TOUCH_END, e => {
                this.doJoinRoom(conf.id)
            })
        });
    }
    doJoinRoom(level) {
        SocketManager.sendMessage('MATCH', { level, flag: true })
    }

    // update (dt) {}
}
