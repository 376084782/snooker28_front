import AudioPlayer from "../../commonScripts/core/AudioPlayer";
import EventManager from "../../commonScripts/core/EventManager";
import PopupManager from "../../commonScripts/core/PopupManager";
import SceneNavigator from "../../commonScripts/core/SceneNavigator";
import MathUtil from "../../commonScripts/utils/MathUtil";
import PromiseUtil from "../../commonScripts/utils/PromiseUtil";
import Utils from "../../commonScripts/utils/Utils";
import AreaBallTop from "../comp/AreaBallTop";
import Ball from "../comp/Ball";
import Chip from "../comp/Chip";
import ChipSelecter from "../comp/ChipSelecter";
import Seat from "../comp/Seat";
import txtWaiting from "../comp/txtWaiting";
import WaitingStart from "../comp/WaitingStart";
import GameManager from "../manager/GameManager";
import SocketManager from "../manager/SocketManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneGame extends cc.Component {

  @property(cc.Prefab)
  prefabShowBall: cc.Prefab = null;

  @property(cc.Node)
  aniFire: cc.Node = null;

  @property(cc.Prefab)
  prefabBall: cc.Prefab = null;
  hideBtns() {

    this.btnPass.active = false
    this.btnCall.active = false
    this.btnAdd.node.active = false
    this.btnGiveup.active = false
  }
  protected onLoad(): void {
    this.txtWaiting2.node.active = false;
    this.ballTop.node.active = false;
    this.hideBtns()
  }
  start() {
    AudioPlayer.resumeAllMusic();
    this.setRoomInfo(true);
    this.listen()


    // this.throwMoney(cc.v2(-100, 100), 1000)

    // PopupManager.show('modal/modalLoser',{total:10,list:[1,2,3,4]})
  }
  listen() {
    this.btnBack.on(cc.Node.EventType.TOUCH_END, e => {
      SocketManager.sendMessage('MATCH', { flag: false })
    })
    this.btnRule.on(cc.Node.EventType.TOUCH_END, e => {
      PopupManager.show('modal/modalRule')
    })
    this.btnReady.on(cc.Node.EventType.TOUCH_END, e => {
      SocketManager.sendMessage('READY', {
        flag: !GameManager.selfInfo.ready
      })
    })
    this.btnGiveup.on(cc.Node.EventType.TOUCH_END, e => {
      SocketManager.sendMessage('ACTION', {
        type: 4
      })
    })
    this.btnPass.on(cc.Node.EventType.TOUCH_END, e => {
      let round = Math.floor(GameManager.gameInfo.count / GameManager.listUser.length) + 1;
      if (round <= 2) {
        return
      }
      SocketManager.sendMessage('ACTION', {
        type: 3, extraData: {
          chip: GameManager.selectedChip
        }
      })
    })
    this.btnCall.on(cc.Node.EventType.TOUCH_END, e => {
      SocketManager.sendMessage('ACTION', {
        type: 2, extraData: {
          chip: GameManager.selectedChip
        }
      })
    })
    EventManager.on('game/updateUserList', this.updateUserList, this);
    EventManager.on('game/updateAll', this.setRoomInfo, this)
    EventManager.on('game/start', this.onStartGame, this)
    EventManager.on('game/throwMoney', this.doThrowMoney, this)
    EventManager.on('game/getBall', this.getBall, this)
    EventManager.on('game/finish', this.onFinish, this)
    EventManager.on('game/onShowBalls', this.onShowBalls, this)
    EventManager.on('game/showAction', this.onShowAction, this)
    EventManager.on('game/showCurrent', this.showCurrent, this)
    EventManager.on('game/updateSelChip', this.updateSelChip, this)
    EventManager.on('game/giveup', this.showGiveup, this)
    EventManager.on('game/showBeforeStart', this.showBeforeStart, this)
  }
  showGiveup({ uid }) {
    let seat = this.listUser.find((e: Seat) => e.info.uid == uid);
    seat.info.isLose = true;
    seat.updateTag();
  }
  onShowAction({ uid, type, data, chipBefore }) {
    let seat = this.listUser.find((e: Seat) => e.info.uid == uid);
    if (seat) {
      seat.showAction(type)
    }
    if (type == 2 || type == 3) {
      if (data.chip > chipBefore) {
        // 加注
        if (data.chip == Math.max(...GameManager.config.chipList)) {
          AudioPlayer.playEffectByUrl('音效/jiadaoding')
          AudioPlayer.playEffectByUrl('音效/着火特效音效')
          this.aniFire.active = true;
          seat.toggleFire(true)
          PromiseUtil.wait(2).then(e => {
            this.aniFire.active = false;
            seat.toggleFire(false)
          })
        } else {
          AudioPlayer.playEffectByUrl('音效/jiazhu')
        }
      } else {
        if (type == 2) {
          // 要球
          AudioPlayer.playEffectByUrl('音效/yaoqiu')
        } else if (type == 3) {
          // 不要球
          AudioPlayer.playEffectByUrl('音效/buyaoqiu')
        } else if (type == 4) {
          // 放弃
          AudioPlayer.playEffectByUrl('音效/fangqi')
        }
      }
    }
    this.checkBtnHide()
  }
  checkBtnHide() {
    if (GameManager.gameInfo.chip >= Math.max(...GameManager.config.chipList)
      || GameManager.selfInfo.coin <= Math.min(...GameManager.config.chipList)) {
      this.btnAdd.node.active = false
      this.btnAdd.wrap.active = false
    }
  }
  showCurrent({ currentSeat, timeEnd, chip }) {
    let seatCurrent = this.listUser.find((e: Seat) => e.info.seat == currentSeat)
    if (seatCurrent) {
      seatCurrent.showClock(timeEnd)
      GameManager.selectedChip = chip
      this.btnPass.active = seatCurrent.isSelf
      this.btnCall.active = seatCurrent.isSelf
      let round = Math.floor(GameManager.gameInfo.count / GameManager.listUser.length) + 1;
      console.log(round, 'round')
      Utils.setGrey(round <= 2, this.btnPass.getComponent(cc.Sprite));
      this.btnAdd.node.active = seatCurrent.isSelf
      this.btnGiveup.active = seatCurrent.isSelf
      this.checkBtnHide()

      let txt1 = this.btnPass.getChildByName('txt').getComponent(cc.Label);
      let txt2 = this.btnCall.getChildByName('txt').getComponent(cc.Label);

      if (GameManager.selfInfo.coin == 0) {
        txt1.string = ''
        txt2.string = ''

      } else if (chip >= GameManager.selfInfo.coin) {
        txt1.string = 'all in'
        txt2.string = 'all in'
      } else {
        txt1.string = Utils.numberFormat(chip)
        txt2.string = Utils.numberFormat(chip)
      }

    }
  }
  updateSelChip() {
    let chip = GameManager.selectedChip
    let txt1 = this.btnPass.getChildByName('txt').getComponent(cc.Label);
    let txt2 = this.btnCall.getChildByName('txt').getComponent(cc.Label);

    if (GameManager.selfInfo.coin == 0) {
      txt1.string = ''
      txt2.string = ''

    } else if (chip >= GameManager.selfInfo.coin) {
      txt1.string = 'all in'
      txt2.string = 'all in'
    } else {
      txt1.string = Utils.numberFormat(chip)
      txt2.string = Utils.numberFormat(chip)
    }

  }
  showMoneyToSeat(uid, sp) {
    let t = .35;
    let seat = this.listUser.find((e: Seat) => e.info.uid == uid);
    if (seat) {
      let posEnd = seat.node.convertToWorldSpaceAR(cc.v2(0, 0));
      this.areaMoney.convertToNodeSpaceAR(posEnd, posEnd);
      cc.tween(sp).to(t, {
        x: posEnd.x, y: posEnd.y, scale: .3
      }).call(e => {
        sp.destroy()
      }).start()
    }

  }
  async onShowBalls({ total, balls, uid }) {
    this.flagBallShown = true;
    this.listUser.forEach((s: Seat) => {
      s.clock.node.active = false;
      s.showNum();
    });
    this.scheduleOnce(async e => {
      if (GameManager.selfInfo.uid != uid) {
        await PopupManager.show('modal/modalLoser', { list: balls, total })
      }
    }, 1)

  }
  flagBallShown = false
  async onFinish({ total, balls, uid, mapGain }) {
    let selfWin = GameManager.selfInfo.uid == uid
    this.hideBtns()
    let btnShowBall = cc.instantiate(this.prefabShowBall);
    btnShowBall.setParent(PopupManager.container || cc.Canvas.instance.node);
    // 显示在最上层
    btnShowBall.setSiblingIndex(cc.macro.MAX_ZINDEX);
    btnShowBall.on(cc.Node.EventType.TOUCH_END, e => {
      SocketManager.sendMessage("SHOW_BALLS", {});
    })
    btnShowBall.active = false;

    // 翻牌
    let listGain = [];
    for (let uu in mapGain) {
      listGain.push({ uid: uu, gain: mapGain[uu] })
    }
    this.areaMoney.children.forEach((sp, idx) => {
      let i = idx % listGain.length;
      if (i == 0) {
        listGain = listGain.filter(e => e.gain > 0);
      }
      i = idx % listGain.length;
      let chip = sp.getComponent(Chip) as Chip;
      let confGain = listGain[i];
      confGain.gain -= chip.num;
      this.showMoneyToSeat(confGain.uid, sp)
    })
    await PromiseUtil.wait(.5);
    btnShowBall.active = selfWin && !this.flagBallShown;
    PromiseUtil.wait(8).then(e => {
      PopupManager.clearAllModal();
      SceneNavigator.go('scene/game', { reconnect: true });
    })
    for (let uu in mapGain) {
      let ss = this.listUser.find((e: Seat) => e.info.uid == uu);
      ss.showWin(mapGain[uu], uu == uid)
    }
    await PromiseUtil.wait(2);
    if (selfWin) {
      AudioPlayer.pauseAllMusic();
      AudioPlayer.playEffectByUrl('音效/胜利');
      // 自己赢了，弹出
      await PopupManager.show('modal/modalWin', {
        num: mapGain[GameManager.selfInfo.uid], call() {
          btnShowBall.setSiblingIndex(cc.macro.MAX_ZINDEX);
        }
      })
    }
  }
  getBall({ ball, uid, listNew, ballLeft }) {
    let user = GameManager.listUser.find(e => e.uid == uid);
    let ctrSeat = this.listUser.find((e: Seat) => e.info.uid == uid);
    if (ctrSeat) {
      let ctrBall = this.ballTop.listBall.find((e: Ball) => e.num == ball);
      if (ctrBall) {
        let sp = cc.instantiate(ctrBall.node) as cc.Node;
        this.node.addChild(sp);
        let posStart = ctrBall.node.convertToWorldSpaceAR(cc.v2(0, 0));
        this.node.convertToNodeSpaceAR(posStart, posStart);
        let ballLast = ctrSeat.listBall[user.ballList.length - 1];
        let posEnd = ballLast.node.convertToWorldSpaceAR(cc.v2(0, 0));
        this.node.convertToNodeSpaceAR(posEnd, posEnd);
        cc.tween(sp)
          .set({
            x: posStart.x, y: posStart.y
          }).to(.3, {
            x: posEnd.x, y: posEnd.y, scale: ballLast.node.scale
          }).call(e => {
            sp.destroy();
            ctrSeat.renderNum(listNew);
            this.ballTop.initBall(ballLeft)
          }).start();
      }
    }
  }
  doThrowMoney({ uid, num }) {
    let seat = this.listUser.find((e: Seat) => e.info.uid == uid);
    if (seat) {
      let pos = seat.node.convertToWorldSpaceAR(cc.v2(0, 0))
      this.throwMoney(num, true, pos)
    }
  }
  async onStartGame(data) {
    this.topQues.active = true;
    this.ballTop.node.active = false;
    // 第一轮发三个私有球
    let ballQues = this.topQues.getChildByName('ball');
    let posStart = ballQues.convertToWorldSpaceAR(cc.v2(0, 0));
    this.node.convertToNodeSpaceAR(posStart, posStart)
    let timeAni = .35;
    GameManager.listUser.forEach((info, i) => {
      let ctr = this.listUser.find((e: Seat) => e.info.uid == info.uid)
      if (ctr) {
        let endBall = ctr.listBall[0].node
        let posEnd = endBall.convertToWorldSpaceAR(cc.v2(0, 0))
        this.node.convertToNodeSpaceAR(posEnd, posEnd)
        let ball = cc.instantiate(this.prefabBall);
        let ctrBall = ball.getComponent(Ball);
        ctrBall.num = 99;
        this.node.addChild(ball);
        ctr.renderNum([])

        ctr.iconStatus.node.active = false;
        cc.tween(ball).set({
          x: posStart.x, y: posStart.y
        }).delay(timeAni * i).to(timeAni, {
          x: posEnd.x, y: posEnd.y,
          scale: ctr.isSelf ? 1 : .8
        }).call(e => {
          ctr.renderNum(info.ballList)
          ball.destroy()
        }).start()
      }
    })
    await PromiseUtil.wait(timeAni * 3);
    this.topQues.active = false;
    this.ballTop.node.active = true;
    this.ballTop.playAnimate()
  }
  onDisable(): void {
  }
  @property(cc.Label)
  txtTotal: cc.Label = null;
  @property(cc.Label)
  txtRound: cc.Label = null;
  @property(cc.Label)
  txtRoom: cc.Label = null;
  @property(cc.Node)
  btnBack: cc.Node = null;
  @property(cc.Node)
  btnRule: cc.Node = null;
  @property(cc.Node)
  btnReady: cc.Node = null;
  @property([Seat])
  listUser: Seat[] = []

  @property(cc.Node)
  topQues: cc.Node = null

  @property(AreaBallTop)
  ballTop: AreaBallTop = null
  setRoomInfo(initAll?) {
    let gameInfo = GameManager.gameInfo;
    let config = GameManager.config
    this.txtRoom.string = `${config.name}  底分:${config.basicChip / 100}`
    this.txtTotal.string = '' + MathUtil.sum(gameInfo.deskList)
    this.txtRound.string = `第${Math.floor(gameInfo.count / GameManager.listUser.length) + 1}/15轮`
    this.btnAdd.initChipList(config.chipList)

    if (initAll) {
      this.updateUserList()
      this.listUser.forEach((seat: Seat) => {
        seat.renderNum(seat.info.ballList || [])
      })
      gameInfo.deskList.forEach(num => {
        this.throwMoney(num, false)
      });
      this.ballTop.node.active = true;
      this.ballTop.initBall(gameInfo.ballLeft)
    }

    switch (GameManager.step) {
      case 0: {
        // 匹配阶段
        this.wrapGame.active = false;
        this.wrapReady.active = true;
        this.txtWaiting.node.active = GameManager.listUser.length < 3;
        this.txtWaiting.startTimer();
        break
      }
      case 1: {
        this.listUser.forEach((user: Seat) => {
          user.wrapBalls.active = true;
          user.wrapLine.active = true;
        })

        // 已开始游戏
        this.wrapGame.active = true;
        this.wrapReady.active = false;
        this.topQues.active = false;

        if (initAll) {
          if (GameManager.gameInfo.currentSeat) {
            this.showCurrent({
              currentSeat: GameManager.gameInfo.currentSeat,
              timeEnd: GameManager.gameInfo.timeEnd,
              chip: GameManager.gameInfo.chip
            })
          }
        }
        break
      }
      case 2: {
        // 准备开始阶段
        this.txtWaiting2.node.active = true;
        this.btnReady.active = false;
        this.txtWaiting2.setStartTime(GameManager.gameInfo.timeStart)
      }
    }
  }
  updateUserList() {
    for (let i = 0; i < 3; i++) {
      let seatS = GameManager.getSeatCS(i);
      let info = GameManager.listUser.find(e => e.seat == seatS)
      let seat = this.listUser[i];
      if (info) {
        seat.node.active = true;
        seat.setInfo(info)
      } else {
        seat.node.active = false;
      }
    }
    this.txtWaiting.node.active = GameManager.listUser.length < 3;
    let imgTxt = this.btnReady.getChildByName('txt').getComponent(cc.Sprite);
    Utils.setSpImg(imgTxt, `切图/main/${GameManager.selfInfo.ready ? '取消准备' : '准备2'}`)
  }

  showBeforeStart({ timeStart }) {
    this.txtWaiting.node.active = false;
    this.btnReady.active = false;
    this.txtWaiting2.node.active = true;
    this.txtWaiting2.setStartTime(timeStart)
  }

  @property(cc.Node)
  wrapReady: cc.Node = null;
  @property(txtWaiting)
  txtWaiting: txtWaiting = null

  @property(WaitingStart)
  txtWaiting2: WaitingStart = null

  @property(cc.Node)
  wrapGame: cc.Node = null;
  @property(cc.Node)
  areaMoney: cc.Node = null

  @property(cc.Prefab)
  prefabChip: cc.Prefab = null

  // 动画-扔筹码
  throwMoney(num, withAni = true, posStart = cc.v2(0, 0)) {
    let pos = this.areaMoney.convertToNodeSpaceAR(posStart)
    let sp = cc.instantiate(this.prefabChip);
    let ctr = sp.getComponent(Chip);
    ctr.setData(num)


    let w = this.areaMoney.width;
    let h = this.areaMoney.height;
    cc.tween(sp).set({ x: pos.x, y: pos.y }).to(withAni ? .4 : 0, {
      x: MathUtil.getRandomInt(-w / 2, w / 2),
      y: MathUtil.getRandomInt(-h / 2, h / 2),
    }).start()
    this.areaMoney.addChild(sp);
  }
  // 放弃
  @property(cc.Node)
  btnGiveup: cc.Node = null;
  // 加注
  @property(ChipSelecter)
  btnAdd: ChipSelecter = null;
  // 不要
  @property(cc.Node)
  btnPass: cc.Node = null;
  // 要
  @property(cc.Node)
  btnCall: cc.Node = null;

}
