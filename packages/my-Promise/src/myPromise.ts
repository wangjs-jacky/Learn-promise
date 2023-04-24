type CallBackType = Function | null | false;

class myPromise {
  state: "pending" | "fulfilled" | "rejected" = "pending";

  resolve = (result) => {
    /* @todo: 理论上 resolve 应由 微任务 处理，这里仅使用宏任务模拟 */
    if (this.state !== "pending") return;
    this.state = "fulfilled";
    setTimeout(() => {
      this.callbacks.forEach((handle) => {
        const success = handle[0];
        if (typeof success === "function") {
          success.call(undefined, result);
        }
      });
    });
  };

  reject = (reason) => {
    if (this.state !== "pending") return;
    this.state = "rejected";
    setTimeout(() => {
      this.callbacks.forEach((handle) => {
        const fail = handle[1];
        if (typeof fail === "function") {
          fail.call(undefined, reason);
        }
      });
    });
  };

  constructor(fn: Function) {
    if (typeof fn !== "function") {
      throw new Error("请输入函数");
    }
    fn(this.resolve, this.reject);
  }

  callbacks: [CallBackType, CallBackType][] = [];

  succeed: Function | null | undefined | false = null;
  fail: Function | null | undefined | false = null;

  then(succeed?: CallBackType, fail?: CallBackType) {
    const handle = [] as unknown as [CallBackType, CallBackType];
    if (typeof succeed === "function") {
      handle[0] = succeed;
    }
    if (typeof fail === "function") {
      handle[1] = fail;
    }
    this.callbacks.push(handle);
    return new myPromise(() => {});
  }
}

export { myPromise };
