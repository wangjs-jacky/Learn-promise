type CallBackType = Function | null | false;

class PromiseCore {
  state: "pending" | "fulfilled" | "rejected" = "pending";
  static resolve: (parameter: any) => PromiseCore;
  static reject: (parameter: any) => PromiseCore;
  static resolve1: (parameter: any) => PromiseCore;
  static allSettled: (promiseList: any[]) => PromiseCore;
  static all: (promiseList: any[]) => PromiseCore;

  resolve(result) {
    /* @todo: 理论上 resolve 应由 微任务 处理，这里仅使用宏任务模拟 */
    console.log("this.state", this.state);

    if (this.state !== "pending") return;
    this.state = "fulfilled";
    nextTick(() => {
      this.callbacks.forEach((handle) => {
        const success = handle[0];
        if (typeof success === "function") {
          const x = success.call(undefined, result);
          handle[2].resolveWith(x);
        }
      });
    });
  }

  reject(reason) {
    if (this.state !== "pending") return;
    this.state = "rejected";
    nextTick(() => {
      this.callbacks.forEach((handle) => {
        const fail = handle[1];
        if (typeof fail === "function") {
          fail.call(undefined, reason);
        }
      });
    });
  }

  constructor(fn: Function) {
    if (typeof fn !== "function") {
      throw new Error("请输入函数");
    }
    fn(this.resolve.bind(this), this.reject.bind(this));
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
    handle[2] = new PromiseCore(() => {});
    this.callbacks.push(handle);
    return handle[2];
  }

  /* 此时为 Promise2 环境 */
  resolveWith(x) {
    /* 如果 then 返回的是引用自身，则报错 */
    if (this === x) {
      this.reject(new TypeError("不允许返回自身引用"));
    } else if (x instanceof PromiseCore) {
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

/* 添加 polyfill */
function nextTick(fn) {
  /* Node 环境下使用 process.nextTick 模拟 */
  /* @ts-ignore */
  if (process !== undefined && typeof process.nextTick === "function") {
    /* @ts-ignore */
    return process.nextTick(fn);
  }

  /* Vue源码：浏览器环境使用 MutationObserver */
  let counter = 1;
  const observer = new MutationObserver(fn);
  /* 1. 创建一个虚拟的文本节点 */
  const textNode = document.createTextNode(counter + "");

  /* 2. 开启 Mutation 去监听 TextNode 这个 DOM 元素 */
  observer.observe(textNode, {
    characterData: true,
  });

  /* 3. 触发 TextNode 数据属性的改变 */
  counter += 1;
  textNode.data = counter + "";
}

/* PromiseCore.resolve = (a) => console.log("a", a); */

export { PromiseCore };
