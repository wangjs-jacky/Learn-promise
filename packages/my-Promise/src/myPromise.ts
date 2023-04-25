type CallBackType = Function | null | false;

class myPromise {
  state: "pending" | "fulfilled" | "rejected" = "pending";

  resolve = (result) => {
    /* @todo: 理论上 resolve 应由 微任务 处理，这里仅使用宏任务模拟 */
    if (this.state !== "pending") return;
    this.state = "fulfilled";
    process.nextTick(() => {
      this.callbacks.forEach((handle) => {
        const success = handle[0];
        if (typeof success === "function") {
          const x = success.call(undefined, result);
          handle[2].resolveWith(x);
        }
      });
    });
  };

  reject = (reason) => {
    if (this.state !== "pending") return;
    this.state = "rejected";
    process.nextTick(() => {
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

  callbacks: [CallBackType, CallBackType, any][] = [];

  succeed: Function | null | undefined | false = null;
  fail: Function | null | undefined | false = null;

  then(succeed?: CallBackType, fail?: CallBackType) {
    const handle = [] as unknown as [CallBackType, CallBackType, any];
    if (typeof succeed === "function") {
      handle[0] = succeed;
    }
    if (typeof fail === "function") {
      handle[1] = fail;
    }
    handle[2] = new myPromise(() => {});
    this.callbacks.push(handle);
    return handle[2];
  }

  /* 此时为 Promise2 环境 */
  resolveWith(x) {
    /* 如果 then 返回的是引用自身，则报错 */
    if (this === x) {
      this.reject(new TypeError("不允许返回自身引用"));
    } else if (x instanceof myPromise) {
      /* 如果是一个 Promise, 需要通过 then 获取值 */
      x.then(
        (result) => {
          this.resolve(result);
        },
        (reason) => {
          this.reject(reason);
        },
      );
    } else if (x instanceof Object) {
      /* 如果 x 是 thenable */
      let then;
      try {
        then = x.then;
      } catch (error) {
        this.reject(error);
      }
      if (then instanceof Function) {
        try {
          then(
            (y) => {
              /* 特别注意：x 是 thenable 和 promise 最大的不同是，x.then 的回调结果
                前者执行后还有可能是 自身引用/promise/thenable/普通类型; 而后者只有可能是普通类型。
                因此这里千万注意要使用  this.resolveWith(y)
              */
              this.resolveWith(y);
            },
            (r) => {
              this.reject(r);
            },
          );
        } catch (error) {
          this.reject(error);
        }
      }
    } else {
      /* 如果 x 是一个普通类型 */
      /* 通过 this.resolve 将结果传递给 then 后的回调结果 */
      this.resolve(x);
    }
  }
}

export { myPromise };
