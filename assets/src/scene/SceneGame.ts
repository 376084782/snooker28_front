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
  btnChangeDesk: cc.Node = null;

  @property(cc.Node)
  aniFire: cc.Node = null;

  @property(cc.Prefab)
  prefabBall: cc.Prefab = null;
  hideBtns() {
    this.btnPass.active = false;
    this.btnCall.active = false;
    this.btnAdd.node.active = false;
    this.btnGiveup.active = false;
  }
  protected onLoad(): void {
    this.aniWin.node.active = false;
    this.shapeUnlink.active = false;
    this.txtWaiting2.node.active = false;
    this.ballTop.node.active = false;
    this.btnShowBall.active = false;
    this.hideBtns();
  }
  @property(cc.Node)
  shapeUnlinked: cc.Node = null;
  start() {
    this.updateShapeUnlink(!!GameManager.selfInfo.isDisConnected)
    AudioPlayer.resumeAllMusic();
    this.wrapGame.active = false;
    this.wrapReady.active = true;
    this.setRoomInfo(true);
    this.listen();

    // this.throwMoney(cc.v2(-100, 100), 1000)

    // PopupManager.show('modal/modalLoser',{total:10,list:[1,2,3,4]})
  }
  listen() {
    this.btnChangeDesk.on(cc.Node.EventType.TOUCH_END, e => {
      SocketManager.sendMessage("CHANGE_DESK", {
        level: GameManager.level,
        roomId: GameManager.roomId
      });
    });
    this.btnShowBall.on(cc.Node.EventType.TOUCH_END, e => {
      SocketManager.sendMessage("SHOW_BALLS", {});
    });
    this.btnBack.on(cc.Node.EventType.TOUCH_END, e => {
      PopupManager.show('modal/modalExit', {
        call() {
          SocketManager.sendMessage("MATCH", { flag: false });
        }
      })
    });
    this.btnRule.on(cc.Node.EventType.TOUCH_END, e => {
      PopupManager.show("modal/modalRule");
    });
    this.btnGiveup.on(cc.Node.EventType.TOUCH_END, e => {
      SocketManager.sendMessage("ACTION", {
        type: 4
      });
    });
    this.btnPass.on(cc.Node.EventType.TOUCH_END, e => {
      let round = GameManager.gameInfo.round;
      if (round <= 2) {
        return;
      }
      SocketManager.sendMessage("ACTION", {
        type: 3,
        extraData: {
          chip: GameManager.selectedChip
        }
      });
    });
    this.btnCall.on(cc.Node.EventType.TOUCH_END, e => {
      let btn = this.btnCall.getComponent(cc.Button)
      if (!btn.interactable) {
        return
      }
      SocketManager.sendMessage("ACTION", {
        type: 2,
        extraData: {
          chip: GameManager.selectedChip
        }
      });
    });
    this.shapeUnlinkBtn.on(cc.Node.EventType.TOUCH_END, e => {
      location.href = 'uniwebview://close';
    })
    EventManager.on("game/updateShapeUnlink", this.updateShapeUnlink, this);
    EventManager.on("game/updateUserList", this.updateUserList, this);
    EventManager.on("game/updateAll", this.setRoomInfo, this);
    EventManager.on("game/start", this.onStartGame, this);
    EventManager.on("game/throwMoney", this.doThrowMoney, this);
    EventManager.on("game/getBall", this.getBall, this);
    EventManager.on("game/finish", this.onFinish, this);
    EventManager.on("game/onShowBalls", this.onShowBalls, this);
    EventManager.on("game/showAction", this.onShowAction, this);
    EventManager.on("game/showActionSound", this.showActionSound, this);
    EventManager.on("game/showCurrent", this.showCurrent, this);
    EventManager.on("game/updateSelChip", this.updateSelChip, this);
    EventManager.on("game/giveup", this.showGiveup, this);
    EventManager.on("game/showBeforeStart", this.showBeforeStart, this);
    EventManager.on("game/showChat", this.showChat, this);
    EventManager.on('game/showUnlink', this.showUnlink, this)

    EventManager.on('game/hideFinishAni', this.hideFinishAni, this)


  }
  async hideFinishAni({ isContinue, msg }) {
    if (isContinue) {
      PopupManager.clearAllModal();
      SceneNavigator.go("scene/game", { reconnect: true });
    } else {
      await SceneNavigator.go("scene/room");
      PromiseUtil.wait(0.5).then(e => {
        Utils.showToast(msg);
      });
    }
  }
  @property(cc.Node)
  shapeUnlink: cc.Node = null;
  @property(cc.Node)
  shapeUnlinkBtn: cc.Node = null;
  showUnlink() {
    this.updateShapeUnlink(false)
    this.shapeUnlink.active = true;
  }
  updateShapeUnlink(flag) {
    this.shapeUnlinked.active = flag;
  }
  showChat({ uid, conf }) {
    let seat = this.listUser.find((e: Seat) => e.info.uid == uid);
    seat.showChat(conf);
  }
  showGiveup({ uid }) {
    let seat = this.listUser.find((e: Seat) => e.info.uid == uid);
    seat.info.isLose = true;
    seat.updateTag();
  }
  showActionSound({ uid, type, data, chipBefore }) {
    let seat = this.listUser.find((e: Seat) => e.info.uid == uid);
    if (type == 2 || type == 3) {
      if (seat.info.coin <= data.chip) {
        // allin
        AudioPlayer.playEffectByUrl("音效/全下了");
      } else if (data.chip > chipBefore) {
        // 加注
        if (data.chip == Math.max(...GameManager.config.chipList)) {
          AudioPlayer.playEffectByUrl("音效/jiadaoding");
          AudioPlayer.playEffectByUrl("音效/着火特效音效");
          this.aniFire.active = true;
          seat.toggleFire(true);
          PromiseUtil.wait(2).then(e => {
            this.aniFire.active = false;
            seat.toggleFire(false);
          });
        } else {
          if (type == 2) {
            // 要球
            AudioPlayer.playEffectByUrl("音效/jiazhuyaoqiu");
          } else if (type == 3) {
            // 不要球
            AudioPlayer.playEffectByUrl("音效/jiazhu");
          }
        }
      } else {
        if (type == 2) {
          // 要球
          AudioPlayer.playEffectByUrl(`音效/${GameManager.gameInfo.count == 0 && GameManager.gameInfo.round == 2 ? 'yaoqiu' : 'genzhuyaoqiu'}`);
        } else if (type == 3) {
          // 不要球
          AudioPlayer.playEffectByUrl(`音效/${GameManager.gameInfo.count == 0 && GameManager.gameInfo.round == 2 ? 'buyaoqiu' : 'genzhu'}`);
        }
      }
    } else if (type == 4) {
      // 放弃
      AudioPlayer.playEffectByUrl("音效/fangqi");
    }
  }
  onShowAction({ uid, type, data, chipBefore }) {
    let seat = this.listUser.find((e: Seat) => e.info.uid == uid);
    if (seat) {
      if (data && data.chip > chipBefore) {
        type = 1
      }
      seat.showAction(type);
    }
    this.checkBtnHide();
  }
  checkBtnHide() {
    if (
      GameManager.gameInfo.chip >= Math.max(...GameManager.config.chipList) ||
      GameManager.selfInfo.coin <= Math.min(...GameManager.config.chipList)
    ) {
      this.btnAdd.node.active = false;
      this.btnAdd.wrap.active = false;
    }
  }
  showCurrent({ currentSeat, timeEnd, chip }) {
    let seatCurrent = this.listUser.find(
      (e: Seat) => e.info.seat == currentSeat
    );
    if (seatCurrent) {
      if (seatCurrent.isSelf) {
        this.btnAdd.node.active = true;
        this.btnGiveup.active = true;
        this.btnPass.active = true;
        this.btnCall.active = true;
        seatCurrent.showClock(timeEnd);
        GameManager.selectedChip = chip;

        let currentNumAll = GameManager.sum(GameManager.selfInfo.ballList);
        Utils.setGrey(currentNumAll == 28, this.btnCall.getComponent(cc.Sprite));
        let btn = this.btnCall.getComponent(cc.Button);
        btn.interactable = currentNumAll != 28

        let round = GameManager.gameInfo.round;
        console.log(round, "round");
        Utils.setGrey(round <= 2, this.btnPass.getComponent(cc.Sprite));
        this.checkBtnHide();

        let txt1 = this.btnPass.getChildByName("txt").getComponent(cc.Label);
        let txt2 = this.btnCall.getChildByName("txt").getComponent(cc.Label);

        if (GameManager.selfInfo.coin == 0) {
          txt1.string = "";
          txt2.string = "";
        } else if (chip >= GameManager.selfInfo.coin) {
          txt1.string = "all in";
          txt2.string = "all in";
        } else {
          txt1.string = Utils.numberFormat(chip);
          txt2.string = Utils.numberFormat(chip);
        }
      } else {
        this.btnAdd.node.active = false;
        this.btnGiveup.active = false;
        this.btnPass.active = false;
        this.btnCall.active = false;
      }
    } else {
      // 不在这局游戏里,不操作自己的按钮
    }
  }
  updateSelChip() {
    let chip = GameManager.selectedChip;
    let txt1 = this.btnPass.getChildByName("txt").getComponent(cc.Label);
    let txt2 = this.btnCall.getChildByName("txt").getComponent(cc.Label);

    if (GameManager.selfInfo.coin == 0) {
      txt1.string = "";
      txt2.string = "";
    } else if (chip >= GameManager.selfInfo.coin) {
      txt1.string = "all in";
      txt2.string = "all in";
    } else {
      txt1.string = Utils.numberFormat(chip);
      txt2.string = Utils.numberFormat(chip);
    }
  }
  showMoneyToSeat(uid, sp) {
    let t = 0.35;
    let seat = this.listUser.find((e: Seat) => e.info.uid == uid);
    if (seat) {
      AudioPlayer.playEffectByUrl("sound/金币到账");
      let posEnd = seat.node.convertToWorldSpaceAR(cc.v2(0, 0));
      this.areaMoney.convertToNodeSpaceAR(posEnd, posEnd);
      cc.tween(sp)
        .to(t, {
          x: posEnd.x,
          y: posEnd.y,
          scale: 0.3
        })
        .call(e => {
          sp.destroy();
        })
        .start();
    }
  }
  async onShowBalls({ winner, uidListShowBall }) {
    let { total, balls, uid } = winner;
    this.flagBallShown = true;
    let uidListSameMax = []
    this.listUser.forEach((s: Seat) => {
      let numTotal = MathUtil.sum(s.list)
      if (numTotal == total) {
        uidListSameMax.push(s.info.uid)
      }
    })
    this.listUser.forEach((s: Seat) => {
      s.clock.node.active = false;
      if (uidListShowBall.indexOf(s.info.uid) > -1) {
        let showExtra = false;
        if (uidListSameMax.length > 1 && uidListSameMax.indexOf(s.info.uid) > -1) {
          showExtra = true
        }
        s.showNum(showExtra);
      }
    });
    this.scheduleOnce(async e => {
      if (GameManager.selfInfo.uid != uid) {
        await PopupManager.show("modal/modalLoser", { list: balls, total });
      }
    }, 1);
  }
  flagBallShown = false;
  async onFinish({ total, balls, uid, mapGain }) {
    let selfWin = GameManager.selfInfo.uid == uid;
    this.hideBtns();


    // 筹码变成金币飞到对应的头像
    let listGain = [];
    for (let uu in mapGain) {
      listGain.push({ uid: uu, gain: mapGain[uu] });
    }
    this.areaMoney.children.forEach((sp, idx) => {
      let i = idx % listGain.length;
      if (i == 0) {
        listGain = listGain.filter(e => e.gain > 0);
      }
      i = idx % listGain.length;
      let chip = sp.getComponent(Chip) as Chip;
      let confGain = listGain[i];
      if (confGain) {
        confGain.gain -= chip.num;
        this.showMoneyToSeat(confGain.uid, sp);
      }
    });
    await PromiseUtil.wait(0.5);
    if (selfWin) {
      this.playAniWin()
      AudioPlayer.pauseAllMusic();
      AudioPlayer.playEffectByUrl("音效/胜利");
      this.btnShowBall.active = !this.flagBallShown;
    }
    for (let uu in mapGain) {
      let ss = this.listUser.find((e: Seat) => e.info.uid == uu);
      ss.showWin(mapGain[uu], uu == uid);
    }
  }
  @property(cc.Node)
  btnShowBall: cc.Node = null;
  @property(sp.Skeleton)
  aniWin: sp.Skeleton = null;
  playAniWin() {
    this.aniWin.node.active = true;
    let track = this.aniWin.setAnimation(1, 'chuxian', false);
    this.aniWin.setTrackCompleteListener(track, e => {
      this.aniWin.clearTracks()
      this.aniWin.setAnimation(2, 'xunhuan', true);
    })
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
            x: posStart.x,
            y: posStart.y
          })
          .to(0.45, {
            x: posEnd.x,
            y: posEnd.y,
            scale: ballLast.node.scale
          })
          .call(e => {
            sp.destroy();
            ctrSeat.renderNum(listNew);
            this.ballTop.initBall(ballLeft);
          })
          .start();
      }
    }
  }
  doThrowMoney({ uid, num }) {
    let seat = this.listUser.find((e: Seat) => e.info.uid == uid);
    if (seat) {
      let pos = seat.node.convertToWorldSpaceAR(cc.v2(0, 0));
      this.throwMoney(num, true, pos);
    }
  }
  async onStartGame(data) {
    this.btnChangeDesk.active = false;
    this.topQues.active = true;
    this.ballTop.node.active = false;
    // 第一轮发三个私有球
    let ballQues = this.topQues.getChildByName("ball");
    let posStart = ballQues.convertToWorldSpaceAR(cc.v2(0, 0));
    this.node.convertToNodeSpaceAR(posStart, posStart);
    let timeAni = 0.35;
    GameManager.listUser.forEach((info, i) => {
      let ctr = this.listUser.find((e: Seat) => e.info.uid == info.uid);
      if (ctr) {
        let endBall = ctr.listBall[0].node;
        let posEnd = endBall.convertToWorldSpaceAR(cc.v2(0, 0));
        this.node.convertToNodeSpaceAR(posEnd, posEnd);
        let ball = cc.instantiate(this.prefabBall);
        let ctrBall = ball.getComponent(Ball);
        ctrBall.num = 99;
        this.node.addChild(ball);
        ctr.renderNum([]);

        ctr.iconStatus.node.active = false;
        cc.tween(ball)
          .set({
            x: posStart.x,
            y: posStart.y
          })
          .delay(timeAni * i)
          .to(timeAni, {
            x: posEnd.x,
            y: posEnd.y,
            scale: ctr.isSelf ? 1 : 0.8
          })
          .call(e => {
            ctr.renderNum(info.ballList);
            ball.destroy();
          })
          .start();
      }
    });
    await PromiseUtil.wait(timeAni * 3);
    this.topQues.active = false;
    this.ballTop.node.active = true;
    this.ballTop.playAnimate();
  }
  onDisable(): void { }
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
  @property([Seat])
  listUser: Seat[] = [];

  @property(cc.Node)
  topQues: cc.Node = null;

  @property(AreaBallTop)
  ballTop: AreaBallTop = null;
  setRoomInfo(initAll?) {
    let gameInfo = GameManager.gameInfo;
    let config = GameManager.config;
    this.txtRoom.string = `${config.name}  底分:${config.basicChip / 100}`;
    this.txtTotal.string = "" + MathUtil.sum(gameInfo.deskList);
    let round = GameManager.gameInfo.round;
    if (round > 15) {
      round = 15;
    }
    this.txtRound.string = `第${round}/15轮`;
    this.btnAdd.initChipList(config.chipList);

    if (initAll) {
      this.updateUserList();
      this.listUser.forEach((seat: Seat) => {
        seat.renderNum(seat.info.ballList || []);
      });
      gameInfo.deskList.forEach(num => {
        this.throwMoney(num, false);
      });
      this.ballTop.node.active = true;
      this.ballTop.initBall(gameInfo.ballLeft);
    }

    if (GameManager.step == 0) {
      // 匹配阶段
      this.wrapGame.active = false;
      this.wrapReady.active = true;
    } else if (GameManager.step == 2) {
      // 准备开始阶段
      this.txtWaiting2.node.active = true;
      this.txtWaiting2.setStartTime(GameManager.gameInfo.timeStart);
    } else {
      this.listUser.forEach((user: Seat) => {
        user.wrapBalls.active = user.info.inGame;
        user.wrapLine.active = user.info.inGame;
      });

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
          });
        }
      }
    }
  }
  updateUserList() {
    this.updateShapeUnlink(!!GameManager.selfInfo.isDisConnected)
    for (let i = 0; i < 3; i++) {
      let seatS = GameManager.getSeatCS(i);
      let info = GameManager.listUser.find(e => e.seat == seatS);
      let seat = this.listUser[i];
      if (info) {
        seat.node.active = true;
        seat.setInfo(info);
      } else {
        seat.node.active = false;
      }
    }
  }

  showBeforeStart({ timeStart }) {
    this.txtWaiting2.node.active = true;
    this.txtWaiting2.setStartTime(timeStart);
  }

  @property(cc.Node)
  wrapReady: cc.Node = null;

  @property(WaitingStart)
  txtWaiting2: WaitingStart = null;

  @property(cc.Node)
  wrapGame: cc.Node = null;
  @property(cc.Node)
  areaMoney: cc.Node = null;

  @property(cc.Prefab)
  prefabChip: cc.Prefab = null;

  // 动画-扔筹码
  throwMoney(num, withAni = true, posStart = cc.v2(0, 0)) {
    let pos = this.areaMoney.convertToNodeSpaceAR(posStart);
    let sp = cc.instantiate(this.prefabChip);
    let ctr = sp.getComponent(Chip);
    ctr.setData(num);

    let w = this.areaMoney.width;
    let h = this.areaMoney.height;
    cc.tween(sp)
      .set({ x: pos.x, y: pos.y })
      .to(withAni ? 0.4 : 0, {
        x: MathUtil.getRandomInt(-w / 2, w / 2),
        y: MathUtil.getRandomInt(-h / 2, h / 2)
      })
      .start();
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
