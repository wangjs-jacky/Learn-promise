import { describe, expect, it, vi } from "vitest";
import { to } from "./await-to-ts";

async function asyncErrA() {
  return await new Promise(() => {
    throw new Error("ErrorA 出错了");
  });
}
async function asyncErrB() {
  return await new Promise(() => {
    throw new Error("ErrorB 出错了");
  });
}
async function asyncErrC() {
  return await new Promise(() => {
    throw new Error("ErrorC 出错了");
  });
}

describe("整理 异步任务中的写法", () => {
  it("常规：对异步代码跟 .catch 处理", () =>
    new Promise<void>((done) => {
      const fn = vi.fn();
      async function main() {
        const resA = await asyncErrA();
        /* await 存在的问题：无法执行后续操作 */
        const resB = await asyncErrB();
        const resC = await asyncErrC();
        fn();
      }
      main()
        .then((v) => console.log(v))
        .catch((e) => {
          expect(e).toMatchInlineSnapshot("[Error: ErrorA 出错了]");
          /* 测试函数没有被调用 */
          expect(fn).not.toHaveBeenCalled();
          done();
        });
    }));

  it("await 后面跟上 catch 处理单独回调", () =>
    new Promise<void>((done) => {
      async function f() {
        try {
          const asyncFuncARes = await asyncErrA().catch((err) =>
            expect(err).toMatchInlineSnapshot("[Error: ErrorA 出错了]"),
          );
          const asyncFuncBRes = await asyncErrB().catch((err) =>
            expect(err).toMatchInlineSnapshot("[Error: ErrorB 出错了]"),
          );
          const asyncFuncCRes = await asyncErrC().catch((err) =>
            expect(err).toMatchInlineSnapshot("[Error: ErrorC 出错了]"),
          );
        } catch (error) {
          /* 此时拦截冗余 */
          expect(error).toMatchInlineSnapshot();
        }
        done();
      }
      f();
    }));

  it("对每个 await 添加 try...catch 处理", () =>
    new Promise<void>((done) => {
      async function f() {
        try {
          const asyncFuncARes = await asyncErrA();
        } catch (error) {
          expect(error).toMatchInlineSnapshot("[Error: ErrorA 出错了]");
        }
        try {
          const asyncFuncBRes = await asyncErrB();
        } catch (error) {
          expect(error).toMatchInlineSnapshot("[Error: ErrorB 出错了]");
        }
        try {
          const asyncFuncCRes = await asyncErrC();
        } catch (error) {
          expect(error).toMatchInlineSnapshot("[Error: ErrorC 出错了]");
        }

        done();
      }
      f();
    }));

  /* pros: 添加统一错误拦截
     cons: 与常规处理无区别。
  */
  it("对所有 await 添加统一的 try...catch 处理", () =>
    new Promise<void>((done) => {
      async function main() {
        try {
          const asyncFuncARes = await asyncErrA();
          const asyncFuncBRes = await asyncErrB();
          const asyncFuncCRes = await asyncErrC();
        } catch (error) {
          expect(error).toMatchInlineSnapshot("[Error: ErrorA 出错了]");
        }
        done();
      }
      main();
    }));

  /* 
    pros: 使用 await-to-js 保证异步函数返回的一定是一个 fulfilled 函数
    cons: 
  */
  it("使用 await-to-js 处理", () =>
    new Promise<void>((done) => {
      async function f() {
        const [errA, asyncFuncARes] = await to(asyncErrA());
        const [errB, asyncFuncBRes] = await to(asyncErrB());
        const [errC, asyncFuncCRes] = await to(asyncErrC());
        expect(errA).toMatchInlineSnapshot("[Error: ErrorA 出错了]");
        expect(errB).toMatchInlineSnapshot("[Error: ErrorB 出错了]");
        expect(errC).toMatchInlineSnapshot("[Error: ErrorC 出错了]");
        done();
      }
      f();
    }));

  it("使用函数表达式优化 try...catch", () =>
    new Promise<void>(async (done) => {
      async function main() {
        const asyncFuncARes = await asyncErrA();
        const asyncFuncBRes = await asyncErrB();
        const asyncFuncCRes = await asyncErrC();
      }
      try {
        await main();
      } catch (error) {
        switch (error) {
          case "[Error: ErrorA 出错了]":
            /* todo: 处理 A 出错逻辑 */
            expect(error).toMatchInlineSnapshot("[Error: ErrorA 出错了]");
            break;
          case "[Error: ErrorB 出错了]":
            /* todo: 处理 B 出错逻辑 */
            expect(error).toMatchInlineSnapshot();
            break;
          case "[Error: ErrorC 出错了]":
            /* todo: 处理 C 出错逻辑 */
            expect(error).toMatchInlineSnapshot();
            break;
          default:
            break;
        }
        done();
      }
    }));
});
