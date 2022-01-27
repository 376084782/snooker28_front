import Utils from "../../commonScripts/utils/Utils";
import SceneNavigator from "../../commonScripts/core/SceneNavigator";
import PopupManager from "../../commonScripts/core/PopupManager";
import GameManager from "./GameManager";
import EventManager from "../../commonScripts/core/EventManager";
import PromiseUtil from "../../commonScripts/utils/PromiseUtil";
import AudioPlayer from "../../commonScripts/core/AudioPlayer";

export default class SocketManager {

  static get io() {
    return window["io"];
  }
  static socket;
  static listen() {
    this.socket.on("connect", this.onConnect.bind(this));
    this.socket.on("message", this.onMessage.bind(this));
  }
  static lastRankInfo: any = {};
  static async onMessage(res) {
    let type = res.type;
    let data = res.data;
    console.log('收到协议', type, data);
    switch (type) {
      case "RECONNECT": {
        console.log(data)
        let dataGame = data.dataGame;
        if (dataGame.isInRoom) {
          this.setGameData(dataGame.gameInfo);
          SceneNavigator.go('scene/game', { reconnect: true });
        } else {
          SceneNavigator.go('scene/room');
        }
        break;
      }
      case 'ROOM_USER_UPDATE': {
        GameManager.listUser = data.userList;
        EventManager.emit('game/updateUserList')
        break
      }
      case 'GO_HALL': {
        SceneNavigator.go('scene/room');
        break
      }
      case 'GO_GAME': {
        this.setGameData(data.dataGame.gameInfo);
        SceneNavigator.go('scene/game');
        break
      }
      case 'BEFORE_START': {
        EventManager.emit('game/showBeforeStart', data)
        break
      }
      case 'START_GAME': {
        this.setGameData(data.dataGame.gameInfo);
        EventManager.emit('game/updateAll')
        EventManager.emit('game/start', data);
        break
      }
      case 'ACTION': {
        this.setGameData(data.dataGame.gameInfo);
        EventManager.emit('game/updateAll')
        if (data.uid && data.type) {
          EventManager.emit('game/showAction', data)
        }
        break
      }
      case 'POWER': {
        EventManager.emit('game/showCurrent', data)
        break
      }
      case 'THROW_MONEY': {
        EventManager.emit('game/throwMoney', data)
        break
      }
      case 'GET_BALL': {
        let { uid, listNew } = data;
        let user = GameManager.listUser.find(e => e.uid == uid);
        user.ballList = listNew;
        EventManager.emit('game/getBall', data)
        break
      }
      case 'FINISH': {
        this.setGameData(data.dataGame.gameInfo);
        EventManager.emit('game/finish', data.winner)
        break
      }
      case 'SHOW_BALLS': {
        EventManager.emit('game/onShowBalls', data.winner)
        break
      }
      case 'GIVEUP': {
        EventManager.emit('game/giveup', data)
        break
      }
      case 'UPDATE_MONEY': {
        EventManager.emit('game/updateMoney', data)
        break
      }
      case 'ERROR': {
        console.log(data)
        Utils.showToast(data.data.msg)
        break
      }
    }
  }
  static setGameData(gameInfo) {
    GameManager.gameInfo = gameInfo.gameInfo
    GameManager.step = gameInfo.step;
    GameManager.listUser = gameInfo.listUser;
    GameManager.level = +gameInfo.level;
    GameManager.config = gameInfo.config;
  }
  static async onConnect() {
    console.log('ccc')
    this.sendMessage("RECONNECT", {
    });
  }

  static sendMessage(type, data: any = {}) {
    this.socket.emit("message", {
      type,
      data,
      uid: GameManager.uid,
    });
  }

  static disconnect() {
    this.socket.disconnect();
  }
  // 1普通2比赛
  static init() {
    if (this.socket) {
      return;
    }
    let url = `ws://${GameManager.ip}:9021`;
    this.socket = this.io(url);
    this.listen();
  }
}

window["SocketManager"] = SocketManager;
