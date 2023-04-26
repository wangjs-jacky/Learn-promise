import { describe, expect, it, vi } from "vitest";
import myPromise from "./myPromise";

describe("测试 Promise", () => {
  it("测试 Promise.resolve 接受普通类型 ", () =>
    new Promise<void>((done) => {
      myPromise.resolve("成功").then((res) => {
        expect(res).toMatchInlineSnapshot('"成功"');
        done();
      });
    }));

  it("测试 Promise.resolve 接受 Promise ", () =>
    new Promise<void>((done) => {
      const promise = new myPromise((resolve) => resolve("成功"));
      myPromise.resolve(promise).then((res) => {
        expect(res).toMatchInlineSnapshot('"成功"');
        done();
      });
    }));

  it("测试 Promise.reject 接受错误 ", () =>
    new Promise<void>((done) => {
      const promise = new myPromise((resolve, reject) => reject("失败原因"));
      myPromise.resolve(promise).then(null, (reason) => {
        expect(reason).toMatchInlineSnapshot('"失败原因"');
        done();
      });
    }));

  it("测试 Promise.all 功能 -- 成功输入空数组", () =>
    new Promise<void>((done) => {
      myPromise.all([]).then((res) => {
        expect(res).toMatchInlineSnapshot("[]");
        done();
      });
    }));
  it("测试 Promise.all 功能 -- 成功", () =>
    new Promise<void>((done) => {
      const p1 = 1;
      const p2 = new myPromise((resolve) => resolve(2));
      const p3 = myPromise.resolve(3);
      const p4 = myPromise.reject("err4");

      myPromise.all([p1, p2, p3]).then((res) => {
        expect(res).toMatchInlineSnapshot(`
          [
            1,
            2,
            3,
          ]
        `);
        done();
      });
    }));

  it("测试 Promise.all 功能 -- 失败", () =>
    new Promise<void>((done) => {
      const p1 = 1;
      const p2 = new myPromise((resolve) => resolve(2));
      const p3 = myPromise.resolve(3);
      const p4 = myPromise.reject("err4");

      myPromise.all([p1, p2, p4]).then(null, (reason) => {
        expect(reason).toMatchInlineSnapshot('"err4"');
        done();
      });
    }));

  it("测试 Promise.allSellted 功能", () =>
    new Promise<void>((done) => {
      const p1 = 1;
      const p2 = new myPromise((resolve) => resolve(2));
      const p3 = myPromise.resolve(3);
      const p4 = myPromise.reject("err4");

      myPromise.allSettled([p1, p2, p4]).then((res) => {
        expect(res).toMatchInlineSnapshot(`
          [
            {
              "status": "fulfilled",
              "value": 1,
            },
            {
              "status": "fulfilled",
              "value": 2,
            },
            {
              "reason": "err4",
              "status": "rejected",
            },
          ]
        `);
        done();
      });
    }));
});
