/**
 * 数学工具
 */
export default class MathUtil {
  static segmentsIntr(a, b, c, d) {
    /** 1 解线性方程组, 求线段交点. **/

    // 如果分母为0 则平行或共线, 不相交
    var denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
    if (denominator == 0) {
      return false;
    }

    // 线段所在直线的交点坐标 (x , y)
    var x =
      ((b.x - a.x) * (d.x - c.x) * (c.y - a.y) +
        (b.y - a.y) * (d.x - c.x) * a.x -
        (d.y - c.y) * (b.x - a.x) * c.x) /
      denominator;
    var y =
      -(
        (b.y - a.y) * (d.y - c.y) * (c.x - a.x) +
        (b.x - a.x) * (d.y - c.y) * a.y -
        (d.x - c.x) * (b.y - a.y) * c.y
      ) / denominator;

    /** 2 判断交点是否在两条线段上 **/

    if (
      // 交点在线段1上
      (x - a.x) * (x - b.x) <= 0 &&
      (y - a.y) * (y - b.y) <= 0 &&
      // 且交点也在线段2上
      (x - c.x) * (x - d.x) <= 0 &&
      (y - c.y) * (y - d.y) <= 0
    ) {
      // 返回交点p
      return {
        x: x,
        y: y
      };
    }
    //否则不相交
    return false;
  }
  /**
   * 获取一条直线一般式的参数,返回{x:A,y:B,z:C}
   * @param x 直线上一点x
   * @param y 直线上一点y
   * @param rotate 旋转角度
   */
  static getLineKeyParams(x: number, y: number, rotate: number): cc.Vec3 {
    let angle = (Math.PI * rotate) / 180;
    //直线一般式：Ax+By+c=0
    let A = rotate == 90 || rotate == -90 ? 0 : Math.tan(angle);
    let B = -1;
    let C = y - A * x;
    let v3 = new cc.Vec3(A, B, C);
    return v3;
  }
  /**
   * 传入两点，获取一条直线一般式的参数,返回{x:A,y:B,z:C}
   * @param x 直线上一点x
   * @param y 直线上一点y
   * @param rotate 旋转角度
   */
  static getLineKeyParams2(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): cc.Vec3 {
    //直线一般式：Ax+By+c=0
    let A = -1;
    let B = (x1 - x2) / (y1 - y2);
    let C = -(x1 + B * y1);
    return new cc.Vec3(A, B, C);
  }

  /**
   * 判断两数一样大
   */
  public static checkEqualNum(num1: number, num2: number): boolean {
    return Math.abs(num1 - num2) < 1;
  }

  /**
   * 获取一个 min 到 max 范围内的随机整数
   * @param min 最小值
   * @param max 最大值
   */
  public static getRandomInt(min: number = 0, max: number = 1): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  /**
   * 获取一个伪随机整数
   * @param seed 随机种子
   * @param key key
   */
  public static getPseudoRandomInt(seed: number, key: number): number {
    return Math.ceil((((seed * 9301 + 49297) % 233280) / 233280) * key);
  }

  /**
   * 获取两点间的角度
   * @param p1 点1
   * @param p2 点2
   */
  public static getAngle(p1: cc.Vec2, p2: cc.Vec2): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  /**
   * 获取两点间的距离
   * @param p1 点1
   * @param p2 点2
   */
  public static getDistance(p1: cc.Vec2, p2: cc.Vec2): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * 将角度转为弧度
   * @param angle 角度
   */
  public static angleToRadian(angle: number): number {
    return (angle * Math.PI) / 180;
  }

  /**
   *乱序数组
   *
   * @static
   * @param {*} arr
   * @returns
   * @memberof MathUtil
   */
  static shuffle(arr): any[] {
    return arr.sort(() => Math.random() - 0.5);
  }
  static sum(list) {
    let s = 0
    list.forEach(n => {
      s += n
    });
    return s
  }
}

window['MathUtil'] = MathUtil;