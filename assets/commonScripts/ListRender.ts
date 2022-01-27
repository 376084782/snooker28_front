import Utils from "./utils/Utils";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ListRender extends cc.Component {
  @property
  isHorizental: Boolean = false;

  @property
  isVertical: Boolean = false;

  spList = [];
  @property
  spaceX: number = 4;
  @property
  spaceY: number = 4;

  @property(cc.Node)
  cellPrefab: cc.Node = null;

  selectedIdx = -1;

  _listCount: number = 0;

  @property(cc.Integer)
  set listCount(num: number) {
    this._listCount = num;
    this.updateDataLen();
  }
  get listCount(): number {
    return this._listCount;
  }

  updateDataLen() {
    if (this.listCount > this.listData.length) {
      let listAddLength = this.listCount - this.listData.length;

      let listAdd = [];
      for (let i = 0; i < listAddLength; i++) {
        listAdd.push({});
      }
      this.listData = this.listData.concat(listAdd);
    }
  }

  _listData: any[] = [];
  set listData(list) {
    this._listData = list;
    this.updateDataLen();
    this.refresh();
  }
  get listData() {
    return this._listData;
  }
  renderHandler(cell, data, idx) {}

  refresh() {
    let list = this.listData;
    list.forEach((conf, idx) => {
      let targetSp = this.spList[idx] as cc.Node;
      if (!targetSp) {
        this.spList[idx] = cc.instantiate(this.cellPrefab);
        targetSp = this.spList[idx];
        this.node.addChild(targetSp);
      }
      if (this.isVertical) {
        targetSp.y = -(idx * (targetSp.height + this.spaceY));
      }
      if (this.isHorizental) {
        targetSp.x = -(idx * (targetSp.width + this.spaceX));
      }
      targetSp.active = true;
      // 尝试根据字段名直接赋值
      for (let key in conf) {
        let node = targetSp.getChildByName(key);
        if (node) {
          let img = node.getComponent(cc.Sprite);
          if (img) {
            Utils.setSpImg(img, conf[key]);
          }
          let txt = node.getComponent(cc.Label);
          if (txt) {
            txt.string = conf[key];
          }
          if (typeof conf[key] == "boolean") {
            node.isValid = conf[key];
          }
        }
      }
      this.renderHandler(targetSp, conf, idx);
    });
    let targetLast = this.spList[list.length - 1];
    if (targetLast) {
      this.node.height = -targetLast.y + targetLast.height;
    } else {
      this.node.height = 0;
    }

    if (this.spList.length > list.length) {
      for (let i = list.length; i < this.spList.length; i++) {
        let spItem = this.spList[i];
        spItem.active = false;
      }
    }
  }
  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    if (this.cellPrefab.parent) {
      this.node.removeChild(this.cellPrefab);
    }
    this.node.removeAllChildren();
  }

  start() {
    this.updateDataLen();
    this.refresh();
  }

  // update (dt) {}
}
