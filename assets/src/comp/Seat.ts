import AudioPlayer from "../../commonScripts/core/AudioPlayer";
import PopupManager from "../../commonScripts/core/PopupManager";
import FrameAnimatePlayer from "../../commonScripts/FrameAnimatePlayer";
import MathUtil from "../../commonScripts/utils/MathUtil";
import PromiseUtil from "../../commonScripts/utils/PromiseUtil";
import Utils from "../../commonScripts/utils/Utils";
import GameManager from "../manager/GameManager";
import Ball from "./Ball";
import Clock from "./Clock";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Seat extends cc.Component {
  @property(sp.Skeleton)
  aniFire: sp.Skeleton = null;
  @property(sp.Skeleton)
  lightBall: sp.Skeleton = null;

  @property(cc.Sprite)
  avatar: cc.Sprite = null;

  @property(cc.Sprite)
  shape: cc.Sprite = null;

  @property(cc.Label)
  nickname: cc.Label = null;
  @property(cc.Label)
  coin: cc.Label = null;
  info: any = {};

  @property(cc.Node)
  nodeUnlink: cc.Node = null;

  @property(Clock)
  clock: Clock = null;

  @property(cc.Node)
  btnChangeDesk: cc.Node = null;

  @property(cc.Integer)
  seat: number = 0;

  @property(cc.Sprite)
  bg: cc.Sprite = null;
  get isSelf() {
    return this.seat == 0;
  }
  toggleFire(flag = true) {
    this.aniFire.node.active = flag;
  }
  hideAll() {
    this.hideWin()
    this.txtTotal.node.active = this.isSelf;
    this.wrapExtraAnnounce.active = false;
    this.aniBao.node.active = false;
    this.aniFire.node.active = false;
    this.shape.node.active = false;
    this.tag.node.active = false;
    this.tagBao.node.active = false;
    this.clock.node.active = false;
    this.iconStatus.node.active = false
    this.tagWatching.node.active = false
    if (this.btnChangeDesk) {
      this.btnChangeDesk.active = false
    }
    this.tagFirst.node.active = false
    if (this.isSelf) {

    } else {
      this.lightBall.node.active = false;
      this.wrapBalls.active = false;
      this.wrapLine.active = false;
    }

  }
  start() {
    this.txtWinStartY = this.txtWin.node.y
    this.spBubble.active = false;
    this.spEmoji.active = false;
    this.nodeUnlink.active = false;
    // this.showWin(1000)
    // this.showTag()

    // this.showTagAdd()
    this.bg.node.on(cc.Node.EventType.TOUCH_END, e => {
      PopupManager.show('modal/modalInfo', this.info)
    })
  }
  loadingAvatar = false
  async setInfo(info: any) {
    this.info = info;
    console.log(info, GameManager.step)
    if (!info) {
      this.node.active = false;
    } else {
      this.node.active = true;
      this.nickname.string = info.nickname;
      Utils.setSpImgFromNet(this.avatar, info.avatar);
      this.nodeUnlink.active = !!info.isDisConnected;
      this.coin.string = Utils.numberFormat(info.coin, 2)

      if (!GameManager.mapAvatar[info.uid] && !this.loadingAvatar) {
        this.loadingAvatar = true
        // 获取头像
        let data: any = await Utils.doAjax({
          url: '/avatar', data: { uid: info.uid }, method: 'get'
        })
        GameManager.mapAvatar[info.uid] = data
        this.loadingAvatar = false
      }
      let dataAvatar = GameManager.mapAvatar[info.uid]
      if (dataAvatar.src.headimg) {
        let img = 'data:image/jpg;base64,' + dataAvatar.src.headimg
        Utils.setSpImgFromNet(this.avatar, img);
        this.info.avatar = img
      }

      if (GameManager.step == 1 && !info.inGame) {
        this.hideAll()
        this.tagWatching.node.active = true
        if (this.btnChangeDesk) {
          this.btnChangeDesk.active = true
        }
      } else {
        this.tagWatching.node.active = false
        if (this.btnChangeDesk) {
          this.btnChangeDesk.active = GameManager.step != 1
        }
        this.tagFirst.node.active = GameManager.gameInfo.firstSeat == info.seat
        if (GameManager.step == 0) {
          if (!this.isSelf) {
            this.iconStatus.node.active = info.ready;
            Utils.setSpImg(this.iconStatus, '切图/main/准备')
          }
        }
      }
    }
  }
  protected onLoad(): void {
    this.hideAll();
  }

  @property(sp.Skeleton)
  aniBao: sp.Skeleton = null;
  @property(sp.Skeleton)
  iconWin: sp.Skeleton = null;
  @property(cc.Label)
  txtWin: cc.Label = null;

  txtWinStartY = 0;
  showTag() {
    this.tag.node.active = true;
  }
  async showWin(num, isWin) {
    this.clock.node.active = false;
    this.aniBao.node.active = true;
    this.aniBao.setToSetupPose();
    this.aniBao.setAnimation(1, 'bao', false)
    if (this.iconWin && isWin) {
      this.iconWin.node.active = true;
      this.iconWin.setAnimation(1, this.seat == 1 ? 'win' : 'win2', true)
    }
    if (this.txtWin) {
      this.txtWin.node.active = true;
      this.txtWin.string = `+${num}`;
      cc.tween(this.txtWin.node)
        .set({ opacity: 0, y: this.txtWinStartY - 20 })
        .to(.2, {
          opacity: 255, y: this.txtWinStartY
        }).start();
    }
  }
  hideWin() {
    if (this.txtWin) {
      this.txtWin.node.active = false;
    }
    if (this.iconWin) {
      this.iconWin.node.active = false;
    }
  }
  @property(cc.Sprite)
  tagFirst: cc.Sprite = null;
  @property(cc.Sprite)
  tagWatching: cc.Sprite = null;


  @property(cc.Sprite)
  tag: cc.Sprite = null;

  @property(sp.Skeleton)
  tagBao: sp.Skeleton = null;
  @property(cc.Prefab)
  prefabBall: cc.Prefab = null;
  @property([Ball])
  listBall: Ball[] = []

  @property(cc.Label)
  txtCount: cc.Label = null;
  @property(cc.Label)
  txtNum: cc.Label = null;
  @property(cc.Node)
  wrapExtraAnnounce: cc.Node = null;
  @property(Ball)
  maxBall: Ball = null;
  @property(cc.Label)
  txtTotal: cc.Label = null;

  @property(cc.Sprite)
  iconStatus: cc.Sprite = null;


  endTime = 0;
  showClock(endTime) {
    this.clock.node.active = true;
    this.iconStatus.node.active = false;
    this.endTime = endTime
  }
  protected update(dt: number): void {
    let txt = this.clock.node.getChildByName('文字').getComponent(cc.Label);
    let t = Math.floor((this.endTime - new Date().getTime()) / 1000)
    if (t < 0) {
      t = 0
    }
    txt.string = ('000' + t).slice(-2)
  }
  showAction(type) {
    this.clock.node.active = false;
    let map = {
      1: '加注2',
      2: GameManager.gameInfo.count == 1 && GameManager.gameInfo.round == 2 ? '下注要求' : '跟注要求',
      3: '跟注2'
    }
    if (map[type]) {
      this.iconStatus.node.active = true;
      Utils.setSpImg(this.iconStatus, `切图/main/${map[type]}`)
    } else {
      this.iconStatus.node.active = false;
    }
  }
  @property(cc.Node)
  wrapBalls: cc.Node = null
  @property(cc.Node)
  wrapLine: cc.Node = null
  list = []
  async showNum(showExtra) {
    // 翻球动画
    if (!this.isSelf && !this.isBallShowed) {
      this.isBallShowed = true;
      this.lightBall.node.active = true;
      this.lightBall.setToSetupPose();
      this.lightBall.setAnimation(1, 'guangdian', false);
      await PromiseUtil.wait(.3)
      this.renderNum(this.list, true)
      this.txtTotal.node.active = true;
      this.wrapExtraAnnounce.active = showExtra;
    }
  }
  isBallShowed = false;
  renderNum(list: number[], showNum = false) {
    this.list = list;
    let l = [].concat(list)
    if (!this.isSelf && !showNum) {
      if (l[0]) {
        l[0] = 99
      }
    }
    this.updateTag()

    if (!this.isSelf) {
      if (list.length >= 5) {
        this.wrapBalls.scale = .75
        this.listBall[5].node.active = true
        this.listBall[6].node.active = true
      } else {
        this.wrapBalls.scale = 1
        this.listBall[5].node.active = false
        this.listBall[6].node.active = false
      }
    }
    let n = GameManager.getSumExpFirst(list);
    this.txtCount.string = `${n}点`

    if (this.txtTotal) {
      this.txtTotal.string = `总点数：${MathUtil.sum(list)}点`
    }
    if (this.txtNum) {
      this.txtNum.string = `总球数：${list.length}`
    }
    if (this.maxBall) {
      if (list[1]) {
        this.maxBall.node.active = true
        this.maxBall.num = Math.max(...list.slice(1, list.length))
      }
      else {
        this.maxBall.node.active = false
      }
    }

    l.forEach((num, i) => {
      let ball = this.listBall[i];
      if (ball) {
        let ctr = ball.getComponent(Ball);
        ctr.num = num;
      }
    })
  }
  updateTag() {
    let n = GameManager.getSumExpFirst(this.list)
    if (this.info.isLose) {
      this.tag.node.active = true;
      Utils.setSpImg(this.tag, `切图/main/放弃`)
      this.shape.node.active = true;
    } else if (n >= 28) {
      AudioPlayer.playEffectByUrl('音效/爆点')

      this.tagBao.node.active = true;
      this.tagBao.setBonesToSetupPose();
      this.tagBao.setAnimation(1, 'baodian', true);
      this.shape.node.active = true;
    } else {
      this.tag.node.active = false;
    }
  }


  @property(cc.Node)
  spBubble: cc.Node = null;

  @property(cc.Node)
  spEmoji: cc.Node = null;
  async showChat({ type, conf }) {
    if (type == 1) {
      this.spBubble.active = true;
      let txt = this.spBubble.getChildByName('txt').getComponent(cc.Label);
      txt.string = conf.msg;
    } else if (type == 2) {
      this.spEmoji.active = true;
      let list = await Utils.load(conf.url, cc.SpriteAtlas) as cc.SpriteAtlas;
      let player = this.spEmoji.getComponent(FrameAnimatePlayer)
      player.listSp = list.getSpriteFrames();
      player.play()
    }
    if (conf.audio) {
      AudioPlayer.playEffectByUrl(conf.audio)
    }
    this.unschedule(this.autoHideChat);
    this.scheduleOnce(this.autoHideChat, 3)
  }
  autoHideChat() {
    this.spBubble.active = false;
    this.spEmoji.active = false;
  }
}
