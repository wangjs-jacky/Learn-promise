/* 核心目的：获取中间状态 */
class ConcurrencyTask {
  /* 扩展：成功回调 */
  callBack: Function = () => {};
  /* 异步任务 */
  task: Function = () => {};
  /* 包裹 task 的 promise */
  promise: Promise<any> | null = null;

  constructor(task: Function, callBack: Function) {
    this.task = task;
    this.callBack = callBack;
  }

  /* 开始进行任务 */
  beginExecuteTask() {
    this.promise = new Promise((resolve, reject) => {
      this.task(resolve, reject);
    });
    return this.promise;
  }

  /* 构造一个虚拟的状态 */
  static SimulationTask(time: number, start?: () => void, end?: () => void) {
    return new ConcurrencyTask(
      (resolve: Function, reject: Function) => {
        console.log("开始执行延时任务" + time / 1000 + "秒！");
        if (start) {
          start();
        }
        setTimeout(() => {
          resolve("延时任务完成：" + time / 1000 + "秒！");
        }, time);
      },
      () => {
        if (end) {
          end();
        }
      },
    );
  }
}

class ConcurrencyQueue {
  /* 最大并发数 */
  maxConcurrencyNum = 1;
  /* 并发任务集合 */
  concurrencyTasks = [] as any[];
  /* 正在进行的任务 */
  executionTasks = [] as any[];
  // 全部任务完成回调
  allTaskFinishedCallBack: Function | undefined;
  /* 是否全部执行完毕 */
  isTaskDoing: boolean = false;

  /* 初始化
     1.接受最大并发数
     2.初始化数组
  */
  constructor(
    maxConcurrencyNum: number,
    concurrencyTasks: any[],
    allTaskFinishedCallBack?: Function,
  ) {
    this.maxConcurrencyNum = maxConcurrencyNum;
    this.concurrencyTasks = [...concurrencyTasks];
    this.allTaskFinishedCallBack = allTaskFinishedCallBack;
  }

  /* 开始执行 */
  async beginExecuteTasks() {
    /* 当前执行任务 */
    this.executionTasks = [];

    /* 全部任务 */
    let allExecutionTasks = [];

    this.isTaskDoing = true;

    for (let i = 0; i < this.concurrencyTasks.length; i++) {
      /* 取出第 i 个任务 */
      let task = this.concurrencyTasks[i];

      task.beginExecuteTask().then((res: any) => {
        console.log("this.allTaskFinishedCallBack", this.executionTasks);

        /* 支持提前中断 */
        if (!this.isTaskDoing) return;

        /* 执行成功后，新增到 */
        this.executionTasks.splice(this.executionTasks.indexOf(task), 1);
        if (task.callBack) {
          task.callBack(res);
        }
      });

      /* 小于并发数 */
      if (this.executionTasks.length < this.maxConcurrencyNum) {
        /* 空间1：待执行任务集合添加 */
        this.executionTasks.push(task);
        /* 空间2：全部任务执行集合添加 */
        allExecutionTasks.push(task);
        if (
          /* 当前 i 为 最后一个 */
          this.concurrencyTasks.length - 1 == i ||
          /* 已达到最大的并发数 */
          this.executionTasks.length >= this.maxConcurrencyNum
        ) {
          // 满足直接运行
          await Promise.race(
            /* 只要有一个执行完就结束 */
            this.executionTasks.map((task) => {
              return task.promise;
            }),
          );
        }
      }
    }

    if (!this.isTaskDoing) return;

    //全部任务完成
    await Promise.all(
      allExecutionTasks.map((task) => {
        return task.promise;
      }),
    );

    this.isTaskDoing = false;

    if (this.allTaskFinishedCallBack) {
      this.allTaskFinishedCallBack();
    }
  }

  /* 中断逻辑 */
  close() {
    /* 并发任务集合 */
    this.concurrencyTasks = [];
    /* 正在进行的任务 */
    this.executionTasks = [];
    /* 是否正在执行 */
    this.isTaskDoing = false;
    console.log("this.isTaskDoing-2", this.isTaskDoing);
  }
}

export { ConcurrencyTask, ConcurrencyQueue };
