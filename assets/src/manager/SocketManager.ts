import Utils from "../../commonScripts/utils/Utils";
import SceneNavigator from "../../commonScripts/core/SceneNavigator";
import PopupManager from "../../commonScripts/core/PopupManager";
import GameManager from "./GameManager";
import EventManager from "../../commonScripts/core/EventManager";
import PromiseUtil from "../../commonScripts/utils/PromiseUtil";
import AudioPlayer from "../../commonScripts/core/AudioPlayer";
var protobuf = require("protobufjs");
window['protobuf'] = protobuf;

export default class SocketManager {
  static get io() {
    return window["io"];
  }
  static socket;
  static listen() {
    this.socket.on("connect", this.onConnect.bind(this));
    this.socket.on("disconnect", this.onDisconnected.bind(this));
    this.socket.on("message", this.onMessage.bind(this));

  }
  static Uint16ArrayToString(fileData: DataView) {
    var dataString = "";
    for (var i = 0; i < fileData.byteLength; i++) {
      dataString += String.fromCharCode(fileData.getUint16(i));
    }
    return dataString
  }
  static Uint8ArrayToString(fileData: DataView) {
    var dataString = "";
    for (var i = 0; i < fileData.byteLength; i++) {
      dataString += String.fromCharCode(fileData.getUint8(i));
    }
    return dataString
  }
  static str2ab2(str) {
    var buf = new ArrayBuffer(str.length * 2);
    var bufView = new DataView(buf);
    for (var i = 0; i < str.length; i++) {
      bufView.setUint16(i, str.charCodeAt(i))
    }
    return buf;
  }
  // ArrayBuffer转为字符串，参数为ArrayBuffer对象
  static ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  }

  static str2ab(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new DataView(buf);
    for (var i = 0; i < str.length; i++) {
      bufView.setUint8(i, str.charCodeAt(i))
    }
    return buf;
  }
  static decode2(strIn: string) {
    // 得到两个byte数组
    let bufferSecret = this.str2ab2(this.strSecret);
    let bufferData = this.str2ab2(strIn)
    console.log(bufferSecret, bufferData)
    // 俩数组去异或

    let viewData = new DataView(bufferData)
    let viewSecret = new DataView(bufferSecret)
    for (let i = 0; i < bufferData.byteLength; i++) {
      let r = viewData.getUint8(i) ^ viewSecret.getUint8(i % bufferSecret.byteLength)
      viewData.setUint8(i, r)
    }
    console.log(viewData, 'ddd')
    let str = this.ab2str(viewData)
    return str
  }
  static strSecret = "billiards";
  static decode(strIn: string) {
    // 得到两个byte数组
    let bufferSecret = this.str2ab(this.strSecret);
    let bufferData = this.str2ab(strIn)
    // 俩数组去异或

    let viewData = new DataView(bufferData)
    let viewSecret = new DataView(bufferSecret)
    for (let i = 0; i < bufferData.byteLength; i++) {
      let r = viewData.getUint8(i) ^ viewSecret.getUint8(i % bufferSecret.byteLength)
      viewData.setUint8(i, r)
    }
    let str = this.Uint8ArrayToString(viewData)
    return str
  }
  static decodeWithBuffer(bufferData) {
    // window['protobuf'] = protobuf;
    // console.log(protobuf)
    // 得到两个byte数组
    let bufferSecret = this.str2ab(this.strSecret);
    // 俩数组去异或
    let viewData = new DataView(bufferData)
    let viewSecret = new DataView(bufferSecret)
    for (let i = 0; i < bufferData.byteLength; i++) {
      let r = viewData.getUint8(i) ^ viewSecret.getUint8(i % bufferSecret.byteLength)
      viewData.setUint8(i, r)
    }
    let str = this.Uint8ArrayToString(viewData)
    return str
  }
  static encode(strJson = '') {
    let strSecret = "billiards";
    // 得到两个byte数组
    let buffer = this.str2ab(strJson);
    let bufferSecret = this.str2ab(strSecret)
    let viewData = new DataView(buffer)
    let viewSecret = new DataView(bufferSecret)
    // 俩数组去异或
    for (let i = 0; i < buffer.byteLength; i++) {
      let r = viewData.getUint8(i) ^ viewSecret.getUint8(i % bufferSecret.byteLength)
      viewData.setUint8(i, r)
    }
    console.log(this.Uint8ArrayToString(viewData))
    return buffer;
  }
  static decodeBase64(base64) {
    // 对base64转编码
    var decode = atob(base64);
    // 编码转字符串
    var str = decodeURI(decode);
    return str;
  }
  static lastRankInfo: any = {};
  static async onMessage(res1) {
    let resStr: any = this.decodeBase64(res1);
    let res = JSON.parse(resStr)
    let type = res.type;
    let data = res.data;
    if (type != 'PING') {
      console.log("收到协议", type, data);
    }
    switch (type) {
      case "RECONNECT": {
        console.log(data);
        let dataGame = data.dataGame;
        if (dataGame.isInRoom) {
          this.setGameData(dataGame.gameInfo);
          SceneNavigator.go("scene/game", { reconnect: true });
        } else {
          SceneNavigator.go("scene/room");
        }
        break;
      }
      case "ROOM_USER_UPDATE": {
        GameManager.listUser = data.userList;
        EventManager.emit("game/updateUserList");
        break;
      }
      case "GO_HALL": {
        SceneNavigator.go("scene/room");
        break;
      }
      case "GO_GAME": {
        this.setGameData(data.dataGame.gameInfo);
        SceneNavigator.go("scene/game");
        break;
      }
      case "BEFORE_START": {
        EventManager.emit("game/showBeforeStart", data);
        break;
      }
      case "START_GAME": {
        this.setGameData(data.dataGame.gameInfo);
        EventManager.emit("game/updateAll");
        EventManager.emit("game/start", data);
        break;
      }
      case "ACTION": {
        this.setGameData(data.dataGame.gameInfo);
        EventManager.emit("game/updateAll");
        if (data.uid && data.type) {
          EventManager.emit("game/showAction", data);
        }
        break;
      }
      case "ACTION_SOUND": {
        if (data.uid && data.type) {
          EventManager.emit("game/showActionSound", data);
        }
        break;
      }
      case "POWER": {
        EventManager.emit("game/showCurrent", data);
        break;
      }
      case "THROW_MONEY": {
        EventManager.emit("game/throwMoney", data);
        break;
      }
      case "GET_BALL": {
        let { uid, listNew } = data;
        let user = GameManager.listUser.find(e => e.uid == uid);
        user.ballList = listNew;
        EventManager.emit("game/getBall", data);
        break;
      }
      case "FINISH": {
        EventManager.emit("game/finish", data.winner);
        break;
      }
      case "FINISH_OVER": {
        this.setGameData(data.dataGame.gameInfo);
        EventManager.emit("game/hideFinishAni", data);
        break;
      }
      case "SHOW_BALLS": {
        EventManager.emit("game/onShowBalls", data);
        break;
      }
      case "GIVEUP": {
        EventManager.emit("game/giveup", data);
        break;
      }
      case "UPDATE_MONEY": {
        EventManager.emit("game/updateMoney", data);
        break;
      }
      case "ERROR": {
        console.log(data);
        Utils.showToast(data.data.msg);
        break;
      }
      case 'CHAT': {
        EventManager.emit('game/showChat', { uid: data.uid, conf: data.conf })
        break;
      }
      case 'PING': {
        this.lastTime = data.timestamp;
        break;
      }
    }
  }
  static countRetry = 0;
  static timerRetry;
  static tickerHeart() {
    let timeNow = new Date().getTime();
    let delay = timeNow - this.lastTime
    if (this.lastTime && delay > 3000) {
      console.log('ddd')
      this.disconnect();
      return
    }
    SocketManager.sendMessage("PING", {
      timestamp: new Date().getTime()
    });
  }
  static doRetryConnect() {
    // 每5s重连一次，尝试3次还连不上就跳出alert提示检查网络
    clearInterval(this.timerRetry)
    this.timerRetry = setInterval(e => {
      if (this.countRetry > 3) {
        clearInterval(this.timerRetry)
        EventManager.emit('game/showUnlink')
        return
      } else {
        this.reconnect();
        this.countRetry++;
      }
    }, 5000)
  }
  static setGameData(gameInfo) {
    GameManager.roomId = gameInfo.roomId
    GameManager.gameInfo = gameInfo.gameInfo;
    GameManager.step = gameInfo.step;
    GameManager.listUser = gameInfo.listUser;
    GameManager.level = +gameInfo.level;
    GameManager.config = gameInfo.config;
  }
  static lastTime = 0;
  static ticker;
  static async onConnect() {
    clearInterval(this.timerRetry)
    this.countRetry = 0;
    clearInterval(this.ticker);
    EventManager.emit('game/updateShapeUnlink', false)
    this.ticker = setInterval(e => {
      this.tickerHeart();
    }, 1000)
    this.sendMessage("RECONNECT", {
      session_key: Utils.getQueryVariable('session_key'),
      client_id: Utils.getQueryVariable('client_id'),
      uid: Utils.getQueryVariable('uid')
    });
  }

  static sendMessage(type, data: any = {}) {
    let rr = {
      type,
      data,
      uid: GameManager.uid
    }
    // let res = this.encode(JSON.stringify(rr))
    this.socket.emit("message", rr);
  }

  static onDisconnected() {
    console.log('disconnect')
    EventManager.emit('game/updateShapeUnlink', true)
    this.lastTime = 0;
    clearInterval(this.ticker);
    this.doRetryConnect()
  }
  static disconnect() {
    this.socket.disconnect();
    this.onDisconnected()
  }
  static reconnect() {
    this.socket.connect();
  }
  // 1普通2比赛
  static init() {
    if (this.socket) {
      return;
    }
    let url = GameManager.hostWS;
    this.socket = this.io(url);
    this.listen();
  }
}

window["SocketManager"] = SocketManager;
