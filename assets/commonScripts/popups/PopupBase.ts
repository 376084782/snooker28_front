import PopupManager from "../core/PopupManager";
import AudioPlayer from "../core/AudioPlayer";

export interface ModalBase {
  /**
   * 弹窗已完全展示（子类请重写此函数以实现自定义逻辑）
   */
  onShow?();

  /**
   * 弹窗已完全隐藏（子类请重写此函数以实现自定义逻辑）
   */
  onHide?();
  /**
   * 初始化（子类请重写此函数以实现自定义逻辑）
   */
  init?(options);

  /**
   * 更新样式（子类请重写此函数以实现自定义样式）
   * @param options 弹窗选项
   */
  updateDisplay?(options);
}

const { ccclass, property } = cc._decorator;

/**
 * 弹窗基类
 * @see PopupBase.ts https://gitee.com/ifaswind/eazax-ccc/blob/master/components/popups/PopupBase.ts
 */
@ccclass
export class PopupBase<Options = any> extends cc.Component
  implements ModalBase {
  @property({ type: cc.Node, tooltip: CC_DEV && "背景遮罩" })
  public background: cc.Node = null;

  @property({ type: cc.Node, tooltip: CC_DEV && "弹窗主体" })
  public main: cc.Node = null;

  @property({ type: cc.Node, tooltip: CC_DEV && "弹窗关闭按钮" })
  public closer: cc.Node = null;

  /** 用于拦截点击的节点 */
  private blocker: cc.Node = null;

  /** 展示和隐藏动画的时长 */
  public animTime: number = 0.3;

  /** 弹窗选项 */
  options: Options = null;

  /** 弹窗流程结束回调（注意：该回调为 PopupManager 专用，重写 hide 函数时记得调用该回调） */
  finishCallback: Function = null;

  /**
   * 弹窗已完全展示（子类请重写此函数以实现自定义逻辑）
   */
  onShow(): void { }

  /**
   * 弹窗已完全隐藏（子类请重写此函数以实现自定义逻辑）
   */
  onHide(): void { }

  /**
   * 展示弹窗
   * @param options 弹窗选项
   */
  public show(options?: Options): void {
    // 储存选项
    this.options = options;
    // 重置节点
    if (this.background) {
      this.background.opacity = 0;
      this.background.active = true;
    }
    if (this.main) {
      this.main.scale = 0;
      this.main.active = true;
    }
    this.node.active = true;
    // 绑定关闭按钮
    if (this.closer) {
      this.closer.on(
        cc.Node.EventType.TOUCH_START,
        e => {
          PopupManager.hideCurrent();
        },
        this
      );
    }
    // 初始化
    this.init(this.options);
    // 更新样式
    this.updateDisplay(this.options);
    // 播放背景动画
    if (this.background) {
      cc.tween(this.background)
        .to(this.animTime * 0.8, { opacity: Math.floor(255 * 0.8) })
        .start();
    }
    // 播放主体动画
    if (this.main) {
      cc.tween(this.main)
        .to(this.animTime, { scale: 1 }, { easing: "backOut" })
        .call(() => {
          // 弹窗已完全展示（动画完毕）
          this.onShow && this.onShow();
        })
        .start();
    } else {
      this.onShow && this.onShow();
    }
  }

  /**
   * 隐藏弹窗
   */
  public hide(): void {
    console.log(2)
    if (!this.node) {
      console.log(1)
      this.finishCallback && this.finishCallback();
      return;
    }
    // 拦截点击事件
    if (!this.blocker) {
      this.blocker = new cc.Node("blocker");
      this.blocker.addComponent(cc.BlockInputEvents);
      this.blocker.setParent(this.node);
      this.blocker.setContentSize(this.node.getContentSize());
    }
    this.blocker.active = true;
    AudioPlayer.playEffectByUrl("sound/modal");
    // 播放背景动画
    if (this.background) {
      cc.tween(this.background)
        .delay(this.animTime * 0.2)
        .to(this.animTime * 0.8, { opacity: 0 })
        .call(() => {
          this.background.active = false;
        })
        .start();
    }
    // 播放主体动画
    if (this.main) {
      cc.tween(this.main)
        .to(this.animTime, { scale: 0 }, { easing: "backIn" })
        .call(() => {
          // 取消拦截
          this.blocker.active = false;
          // 关闭节点
          this.main.active = false;
          this.node.active = false;
          // 弹窗已完全隐藏（动画完毕）
          this.onHide && this.onHide();
          // 弹窗完成回调（该回调为 PopupManager 专用）
          // 注意：重写 hide 函数时记得调用该回调
          this.finishCallback && this.finishCallback();
        })
        .start();
    } else {
      // 取消拦截
      this.blocker.active = false;
      // 弹窗已完全隐藏（动画完毕）
      this.onHide && this.onHide();
      // 弹窗完成回调（该回调为 PopupManager 专用）
      // 注意：重写 hide 函数时记得调用该回调
      this.finishCallback && this.finishCallback();
    }
  }

  /**
   * 初始化（子类请重写此函数以实现自定义逻辑）
   */
  init(options: Options): void { }

  /**
   * 更新样式（子类请重写此函数以实现自定义样式）
   * @param options 弹窗选项
   */
  updateDisplay(options: Options): void { }

  /**
   * 设置弹窗完成回调（该回调为 PopupManager 专用）
   * @param callback 回调
   */
  public setFinishCallback(callback: Function): void {
    this.finishCallback = callback;
  }
}
