const { ccclass, property } = cc._decorator;
/**
 * 图片适配组件
 */
@ccclass
export default class ImageAdapter extends cc.Component {
  @property
  width: number = 100;

  @property
  height: number = 100;

  @property
  isCover = false;

  @property
  isContain = false;
  protected onLoad() {}

  protected start() {
    // 主动调用一次
    this.adapt();
    this.node.on(cc.Node.EventType.SIZE_CHANGED, this.adapt, this);
  }

  /**
   * 适配
   */
  adapt() {
    let size = this.node.getContentSize();
    let ratioW = this.width / size.width;
    let ratioH = this.height / size.height;


    let ratio = 1;
    if (this.isCover) {
      ratio = Math.max(ratioW, ratioH);
    }
    if (this.isContain) {
      ratio = Math.min(ratioW, ratioH);
    }
    this.node.scale = ratio;
  }
}
