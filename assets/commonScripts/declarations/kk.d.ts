declare class kk {
  static joinGameCallBack(user_id);
  static H5LoadingSuccess();
  static saveImageToLocal(imgData);
  static H5AskQuit();
  static shareFriends(image, name, url);
  static pay();
  static share(img, title, desc, url);
  static post(url, data, callback);
  static get(url, data, callback);
  static parseBase64(str);
  static getToken(caall);
  static openRoom(roomId);
  static closeH5();
  static onFinish();
  static isIos: boolean;
  static isAndroid:boolean;
}
