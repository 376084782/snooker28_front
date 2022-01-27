import AudioPlayer from "../../commonScripts/core/AudioPlayer";
import SceneNavigator from "../../commonScripts/core/SceneNavigator";
import Progress from "../../commonScripts/Progress";
import SocketManager from "../manager/SocketManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneLoading extends cc.Component {
  @property(Progress)
  prg: Progress = null;
  start() {
    cc.assetManager.getBundle("resources").loadDir(
      "/",
      (finish, total) => {
        let prg = finish / total;
        this.prg.progress=prg;
        this.prg.setTxt(`游戏加载中...${Math.floor(prg * 100)}%`)
      },
      async e => {
        AudioPlayer.playMusicByUrl('音效/bgm')
        SocketManager.init();
      }
    );
  }

}
