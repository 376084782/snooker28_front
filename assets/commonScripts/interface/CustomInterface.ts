import SceneNavigator from "../core/SceneNavigator";

export class SceneBase extends cc.Component {
  params: any;
  onLaunched() {
    this.params = SceneNavigator.param;
  }
}
