import { describe, expect, it, vi } from "vitest";
import { to } from "./await-to-ts";

describe("await-to-js 函数测试", () => {
  it("to 函数的使用：接受成功", async () => {
    const p = Promise.resolve({ test: 123 });

    const [err, data] = await to<{ test: number }>(p);

    expect(data).toMatchInlineSnapshot(`
      {
        "test": 123,
      }
    `);
  });
  it("to 函数的使用：处理错误回调", async () => {
    const p = Promise.reject("错误代码");

    const [err, data] = await to<{ test: number }>(p);

    expect(err).toMatchInlineSnapshot('"错误代码"');
  });
});
