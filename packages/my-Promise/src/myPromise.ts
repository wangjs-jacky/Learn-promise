class myPromise {
  resolve() {
    /* @todo: 理论上 resolve 应由 微任务 处理，这里仅使用宏任务模拟 */
    setTimeout(() => {
      this.succeed && this.succeed();
    });
  }
  reject() {
    setTimeout(() => {
      this.fail && this.fail();
    });
  }

  constructor(fn: Function) {
    if (typeof fn !== "function") {
      throw new Error("请输入函数");
    }
    fn(
      () => {
        this.resolve();
      },
      () => {
        this.reject();
      },
    );
  }

  succeed: Function | null | undefined = null;
  fail: Function | null | undefined = null;

  then(succeed?: Function | null, fail?: Function | null) {
    this.succeed = succeed;
    this.fail = fail;
  }
}

export { myPromise };
