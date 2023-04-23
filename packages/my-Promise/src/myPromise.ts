class myPromise {
  state: "pending" | "fulfilled" | "rejected" = "pending";

  resolve = (result) => {
    /* @todo: 理论上 resolve 应由 微任务 处理，这里仅使用宏任务模拟 */
    if (this.state !== "pending") return;
    this.state = "fulfilled";
    setTimeout(() => {
      this.succeed && this.succeed(result);
    });
  };

  reject = (reason) => {
    if (this.state !== "pending") return;
    this.state = "rejected";
    setTimeout(() => {
      this.fail && this.fail(reason);
    });
  };

  constructor(fn: Function) {
    if (typeof fn !== "function") {
      throw new Error("请输入函数");
    }
    fn(this.resolve, this.reject);
  }

  succeed: Function | null | undefined | false = null;
  fail: Function | null | undefined | false = null;

  then(succeed?: Function | null | false, fail?: Function | null | false) {
    this.succeed = succeed;
    this.fail = fail;
  }
}

export { myPromise };
