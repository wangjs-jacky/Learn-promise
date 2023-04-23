class myPromise {
  constructor(fn: Function) {
    if (typeof fn !== "function") {
      throw new Error("请输入函数");
    }
    fn(
      () => {
        setTimeout(() => {
          this.succeed && this.succeed();
        });
      },
      () => {
        this.fail && this.fail();
      },
    );
  }

  succeed: Function | null | undefined = null;
  fail: Function | null | undefined = null;

  then(succeed?: Function, fail?: Function) {
    this.succeed = succeed;
    this.fail = fail;
  }
}

export { myPromise };
