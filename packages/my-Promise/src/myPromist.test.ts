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

  it("promise.then(success) 中的 success 会在 resolve 被调用的时候执行", () => {
    /* vitest 中的 done 写法：https://cn.vitest.dev/guide/migration.html */
    const success = vi.fn();
    const promise = new Promise((resolve, reject) => {
      expect(success).not.toHaveBeenCalled();
      resolve();
      setTimeout(() => {
        expect(success).toHaveBeenCalled();
      });
    });
    promise.then(success);
  });

  it("promise.then(null,fail) 中的 fail 会在 reject 被调用的时候执行", () => {
    const fail = vi.fn();
    const promise = new Promise((resolve, reject) => {
      expect(fail).not.toHaveBeenCalled();
      reject();
      setTimeout(() => {
        expect(fail).toHaveBeenCalled();
      });
    });
    promise.then(null, fail);
  });
});
