import { describe, expect, it, vi } from "vitest";
import { myPromise as Promise } from "./myPromise";

/* 如果所有用例都并发执行的话，可以使用 describe.concurrent */
describe("Promise", () => {
  it("是一个类", () => {
    expect(Promise).toBeTypeOf("function");
  });

  it("new Promise() 如果接受的不是一个函数就报错", () => {
    /* @ts-ignore */
    expect(() => new Promise()).toThrowError("请输入函数");
    /* @ts-ignore */
    expect(() => new Promise(1)).toThrowError("请输入函数");
    /* @ts-ignore */
    expect(() => new Promise(true)).toThrowError("请输入函数");
    /* https://cn.vitest.dev/api/expect.html#tothrowerror */
  });

  it("new Promise(fn) 中的 fn 立即执行", () => {
    const fn = vi.fn();
    new Promise(fn);
    expect(fn).toHaveBeenCalled();
  });

  it("new Promise(fn) 中的 fn 执行的时候接受 resolve 和 reject 两个函数", () => {
    new Promise((resolve, reject) => {
      expect(resolve).toBeTypeOf("function");
      expect(reject).toBeTypeOf("function");
    });
  });

  it("promise.then(success) 中的 success 会在 resolve 被调用的时候执行", () =>
    new Promise((done) => {
      /* vitest 中的 done 写法：https://cn.vitest.dev/guide/migration.html */
      const success = vi.fn();
      const promise = new Promise((resolve, reject) => {
        expect(success).not.toHaveBeenCalled();
        resolve();
        setTimeout(() => {
          expect(success).toHaveBeenCalled();
          done();
        }, 20);
      });
      promise.then(success);
    }));

  it("promise.then(null,fail) 中的 fail 会在 reject 被调用的时候执行", () =>
    new Promise((done) => {
      const fail = vi.fn();
      const promise = new Promise((resolve, reject) => {
        expect(fail).not.toHaveBeenCalled();
        reject();
        setTimeout(() => {
          expect(fail).toHaveBeenCalled();
          done();
        });
      });
      promise.then(null, fail);
    }));

  it("2.2.1 onFullfilled 和 onRejected 都是可选的参数", () => {
    expect(() => {
      const promise = new Promise((resolve) => {
        resolve();
      });
      promise.then(false, null);
    }).not.toThrowError();
  });

  it("2.2.2 如果 onFulfilled 是函数,需满足多次 resolve 只触发一次，且支持成功信息的传递", () =>
    new Promise((done) => {
      const success = vi.fn();
      const promise = new Promise((resolve) => {
        expect(success).not.toHaveBeenCalled();
        /* 连续掉两次，success 只会执行一次 */
        resolve(233);
        resolve(233);
        setTimeout(() => {
          expect(promise.state === "fulfilled");
          expect(success).toHaveBeenCalledOnce();
          /* success 接受 resolve 传递的参数 */
          expect(success).toHaveBeenCalledWith(233);
          done();
        });
      });
      promise.then(success);
    }));

  it("2.2.3 如果 onRejected 是函数,需满足多次 reject 只触发一次，且支持错误信息的传递", () => {
    const fail = vi.fn();
    const promise = new Promise((resolve, reject) => {
      expect(fail).not.toHaveBeenCalled();
      /* 连续掉两次，success 只会执行一次 */
      reject(233);
      reject(233);
      setTimeout(() => {
        expect(promise.state === "rejected");
        expect(fail).toHaveBeenCalledOnce();
        /* success 接受 resolve 传递的参数 */
        expect(fail).toHaveBeenCalledWith(233);
      });
    });

    promise.then(null, fail);
  });

  /* @todo: 此时此代码实现并非为微任务，因为不能保证 success 函数执行优于所有的宏任务时间 */
  it("【难】2.2.4 在代码执行完之前，不得调用 then 后面函数，即 resolve 呈现异步状态", () =>
    new Promise((done) => {
      const success = vi.fn();
      const promise = new Promise((resolve) => {
        resolve();
      });
      promise.then(success);
      /* 此时同步片段中，success 函数仍未被调用 */
      expect(success).not.toHaveBeenCalled();
      setTimeout(() => {
        /* 异步执行代码时，success 函数被触发调用 */
        expect(success).toHaveBeenCalled();
        done();
      }, 0);
    }));

  it("【难】2.2.5 onFulfilled和onRejected 被当做函数调用时，this 指向 undefined", () => {
    const promise = new Promise((resolve) => {
      resolve();
    });

    promise.then(function () {
      /* 注意此时应为严格模式 */
      console.log("this", this);
      expect(this).toBeUndefined();
    });
  });

  it("【中】2.2.6 支持链式 then 的写法，要求调用顺序遵循书写顺序", () =>
    new Promise((done) => {
      const promise = new Promise((resolve) => {
        resolve();
      });

      const callbacks = [vi.fn(), vi.fn(), vi.fn()];
      promise.then(callbacks[0]);
      promise.then(callbacks[1]);
      promise.then(callbacks[2]);
      setTimeout(() => {
        expect(callbacks[0]).toHaveBeenCalled();
        expect(callbacks[1]).toHaveBeenCalled();
        expect(callbacks[2]).toHaveBeenCalled();

        /* ChatGPT 给出的方案：如下结果分别为 [7][8][9] */
        console.log(callbacks[0].mock.invocationCallOrder);
        console.log(callbacks[1].mock.invocationCallOrder);
        console.log(callbacks[2].mock.invocationCallOrder);

        /* 0 < 1  */
        expect(callbacks[0].mock.invocationCallOrder[0]).toBeLessThan(
          callbacks[1].mock.invocationCallOrder[0],
        );

        /* 1 < 2  */
        expect(callbacks[1].mock.invocationCallOrder[0]).toBeLessThan(
          callbacks[2].mock.invocationCallOrder[0],
        );
        done();
      });
    }));

  it("2.2.7 then 必须返回一个 promise", () => {
    const promsie = new Promise((resolve) => {
      resolve();
    });
    const promise2 = promsie.then(
      () => {},
      () => {},
    );
    /* .then 的返回值是 Promise 的一个实例 */
    expect(promise2).toBeInstanceOf(Promise);
  });
  it("【难】2.2.7.1 .then(success,fail) 同样支持两个函数，且支持接受返回结果", () =>
    new Promise((done) => {
      const promise1 = new Promise((resolve) => {
        resolve();
      });
      promise1
        .then(
          () => "成功",
          () => {},
        )
        .then((result) => {
          /* https://cn.vitest.dev/guide/migration.html 
             由于检测异步中的某个结果，因此需要使用 done 结束。*/
          expect(result).toMatchInlineSnapshot('"成功"');
          done();
        });
    }));

  it("2.2.7.1.2 success 的返回值是一个 Promise 实例", () => {
    const promise1 = new Promise((resolve) => resolve());

    /* .then 中返回的是一个 Promise 类型*/
    const promise2 = promise1.then(
      () => new Promise((resolve) => resolve("成功")),
    );

    /* 此时 x 为 new Promise((resolve) => resolve("成功")
       直接 x.then 后取出结果，并传递给 resolveWith 函数中的 this.resolve() 即可。
    */
    promise2.then((res) => {
      console.log("res", res);
      expect(res).toMatchInlineSnapshot('"成功"');
    });
  });

  it("【需非常注意】2.2.7.1.2 success 的返回值是一个 thenable 对象, 成功调用", () => {
    const promise1 = new Promise((resolve) => resolve());

    /* .then 中返回的是一个 Promise 类型*/
    const promise2 = promise1.then(() => {
      return {
        then: (resolve, reject) => {
          resolve("成功");
        },
      };
    });

    promise2.then((res) => {
      console.log("res", res);
      expect(res).toMatchInlineSnapshot('"成功"');
    });
  });

  it("【需非常注意】2.2.7.1.2 success 的返回值是一个 thenable 对象, 失败调用", () => {
    const promise1 = new Promise((resolve) => resolve());
    /* .then 中返回的是一个 Promise 类型*/
    const promise2 = promise1.then(() => {
      return {
        then: (resolve, reject) => {
          reject("失败");
        },
      };
    });

    promise2.then(null, (reason) => {
      console.log("res", reason);
      expect(reason).toMatchInlineSnapshot('"失败"');
    });
  });

  it("【需非常注意】2.2.7.1.2 success 的返回值不能是 promise 自身索引", () =>
    new Promise((done) => {
      const promise1 = new Promise((resolve) => resolve());
      /* 使用 promise1 的 then 返回一个新引用地址的 promise2 */
      /* 不允许处理自身的引用地址 */
      const promise2 = promise1.then(() => promise2);
      promise2.then(null, (reason) => {
        expect(reason).toMatchInlineSnapshot("[TypeError: 不允许返回自身引用]");
        done();
      });
    }));
});
