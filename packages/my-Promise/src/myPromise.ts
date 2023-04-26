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
  return new PromiseCore((resolve, reject) => {
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

PromiseCore.allSettled = (promiseList: any[]) => {
  const result = [] as any[];
  let resovleCount = 0;
  return new PromiseCore((resolve) => {
    if (promiseList.length === 0) {
      resolve([]);
    }
    promiseList.forEach((p, i) => {
      PromiseCore.resolve(p).then(
        (res) => {
          resovleCount++;
          result[i] = {
            status: "fulfilled",
            value: res,
          };
          if (resovleCount === promiseList.length) {
            return resolve(result);
          }
        },
        (reason) => {
          resovleCount++;
          result[i] = {
            status: "rejected",
            reason: reason,
          };
          if (resovleCount === promiseList.length) {
            return resolve(result);
          }
        },
      );
    });
  });
};

PromiseCore.race = (promiseList: any[]) => {
  return new PromiseCore((resolve, reject) => {
    if (promiseList.length === 0) {
      resolve([]);
    }
    promiseList.forEach((p) => {
      PromiseCore.resolve(p).then(
        (res) => resolve(res),
        (reason) => reject(reason),
      );
    });
  });
};

PromiseCore.any = (promiseList: any[]) => {
  let rejectCount = 0;
  return new PromiseCore((resolve, reject) => {
    if (promiseList.length === 0) {
      resolve([]);
    }
    promiseList.forEach((p) => {
      PromiseCore.resolve(p).then(
        (res) => resolve(res),
        (reason) => {
          rejectCount++;
          if (rejectCount === promiseList.length) {
            reject("All Promise task failed");
          }
        },
      );
    });
  });
};

export default PromiseCore;
