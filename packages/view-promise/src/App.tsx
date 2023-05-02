import React, { useCallback, useRef, useState } from "react";
import { ConcurrencyTask, ConcurrencyQueue } from "./concurrency";
import classNames from "classnames";

type promiseTask = "no-start" | "handling" | "done";

function transferPromiseTask(
  arr: number[],
  setPromiseStatus: React.Dispatch<
    React.SetStateAction<
      {
        promiseStatus: promiseTask;
        label: string;
      }[]
    >
  >,
) {
  return arr.map((delaytime, index) => {
    return ConcurrencyTask.SimulationTask(
      delaytime,
      () => {
        setPromiseStatus((arr) => {
          arr[index]["promiseStatus"] = "handling";
          return [...arr];
        });
      },
      () => {
        setPromiseStatus((arr) => {
          arr[index]["promiseStatus"] = "done";
          return [...arr];
        });
      },
    );
  });
}

function App() {
  const [btnStatus, setBtnStatus] = useState<
    "开始" | "正在执行中" | "全部执行完毕"
  >("开始");

  /* 设置并发数 */
  const [concurrencyNumber, setConcurrencyNumber] = useState(1);

  const concurrencyQueue = useRef<ConcurrencyQueue | undefined>();

  /* 设置虚拟的触发时机 */
  const promiseTask = [1000, 2000, 3000, 4000, 2000, 3000, 7000, 3000, 4000];

  const [promiseStatus, setPromiseStatus] = useState<
    {
      label: string;
      promiseStatus: promiseTask;
    }[]
  >(
    promiseTask.map((num) => ({
      label: `延时 ${num / 1000} 秒`,
      promiseStatus: `no-start`,
    })),
  );

  /* 构造虚拟的 task 列表 */
  const tasks = transferPromiseTask(promiseTask, setPromiseStatus);

  /* ！！会存在一个陈旧闭包的问题 */
  const onClick = () => {
    if (!concurrencyQueue.current) {
      //添加任务
      concurrencyQueue.current = new ConcurrencyQueue(
        concurrencyNumber,
        tasks,
        () => {
          setBtnStatus("全部执行完毕");
        },
      );
      //开始执行任务
      concurrencyQueue.current.beginExecuteTasks();
      setBtnStatus("正在执行中");
    }
  };

  /* 重置 */
  const reset = () => {
    setPromiseStatus(
      promiseTask.map((num) => ({
        label: `延时 ${num / 1000} 秒`,
        promiseStatus: `no-start`,
      })),
    );

    concurrencyQueue.current?.close();
    concurrencyQueue.current = undefined;
    setBtnStatus("开始");
  };

  return (
    <div className="flex flex-col items-center">
      <h1> 可视化 Promise 流程</h1>
      <div className="flex justify-around border-rounded border-solid w-180">
        <div className="flex m-10">
          <div className="flex flex-wrap w-110 gap-10 ">
            {promiseStatus.map((task, i) => {
              const classname = classNames({
                "bg-red-400": !["handling", "done"].includes(
                  task.promiseStatus,
                ),
                "bg-yellow-400": task.promiseStatus === "handling",
                "bg-green-400": task.promiseStatus === "done",
              });
              return (
                <>
                  <div
                    className={`flex w-30 h-30 justify-center  items-center border-rounded ${classname}`}
                    id={`${i}`}
                    key={i}
                  >
                    <div>
                      <div>{task.label}</div>
                      <div>{`(${task.promiseStatus})`}</div>
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col grow-1 p-5">
          <div>
            <span className="pr-2">输入并发数</span>
            <input
              type="number"
              value={concurrencyNumber}
              placeholder="请输入并发数量"
              onChange={(e) => {
                setConcurrencyNumber(e.target.value as unknown as number);
              }}
            />
          </div>

          <button className="h-10 bg-yellow-300 mt-5" onClick={onClick}>
            {btnStatus}
          </button>
          <button className="h-10 bg-yellow-300 mt-5" onClick={reset}>
            重置
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
