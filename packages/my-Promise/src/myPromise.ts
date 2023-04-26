import { PromiseCore } from "./promiseCore";

PromiseCore.resolve = (parameter) => {
  /* 注：resolve 支持接受 promise */
  if (parameter instanceof PromiseCore) {
    return parameter;
  }
  /* 否则构造一个 new Promise 返回 
     由 PromiseCore 处理 自引用|thenable|普通类型等返回值类型
  */
  return new PromiseCore((resolve) => resolve(parameter));
};

PromiseCore.reject = (parameter) => {
  /* 构造一个新的 Promise 并返回 */
  return new PromiseCore((resolve, reject) => reject(parameter));
};

PromiseCore.all = (promiseList: any[]) => {
  /* 记录结果数组 */
  const result = [] as any[];
  let resCount = 0;
  return new Promise((resolve, reject) => {
    if (promiseList.length === 0) {
      resolve([]);
    }
    promiseList.forEach((p, i) => {
      PromiseCore.resolve(p).then(
        (res) => {
          result[i] = res;
          resCount++;
          if (resCount === promiseList.length) {
            resolve(result);
          }
        },
        (reason) => {
          reject(reason);
        },
      );
    });
  });
};

export default PromiseCore;
