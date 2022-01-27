import AudioPlayer from "./core/AudioPlayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Button extends cc.Component {
  protected start(): void {
    this.node.on(cc.Node.EventType.TOUCH_END, e => {
      let ctr = this.getComponent(cc.Button);
      if (!ctr || ctr.interactable) {
        AudioPlayer.playEffectByUrl('音效/按钮音效')
      }
    })
  }
  // update (dt) {}
}
