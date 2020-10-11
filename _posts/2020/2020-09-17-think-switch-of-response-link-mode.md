---
layout: post
title: "案例思考-Switch语句实现职责链模式"
description: "【2020-09-17】案例思考-Switch语句实现职责链模式"
categories: [整理,Switch]
tags: [面向函数编程,职责链模式]
redirect_from:
  - /2020/09/17/
---

# 案例介绍

撇去之前 [Stream深入分析到Lambada扩展使用](/blog/2020/08/09/stream-design-and-lambda-extension/) 介绍的 switch 语句是 Java 的语法糖，底层编译是通过 hashcode、equal 实现多类型遍历 case。

我们来看下近期编程时在代码中看到 Switch 被误用的情况：

1. Part Code Ⅰ
    ```java
    public Result run(RunTypeEnum runType)
        switch(runType) {
            case A:
                return runA();
            case B:
                if (configService.isCanRunB()) {
                    return runB();
                }
                startDoNotB();
            case C:
                if (configService.isCanRunC()) {
                    return runC();
                }
                startDoNotC();
            default:
                startDoDefault(runType);
                return runDefault();
        }
    }
    ```
2. Part Code Ⅱ
    ```java
    public Result run(RunTypeEnum runType)
        switch(runType) {
            case A:
                return runA();
            case B:
                if (configService.isCanRunB()) {
                    return runB();
                }
                startDoNotB();
                break;
            case C:
                if (configService.isCanRunC()) {
                    return runC(C);
                }
                startDoNotC();
                break;
            default:
                startDoDefault(runType);
                break;
        }
        return runDefault();
    }
    ```

以上两段代码翻译成 if else 如下：

1. Part Code Ⅰ Result
    ```java
    public Result run(RunTypeEnum runType)
        if (runType == A) {
            return runA();
        }
        if (runType == B) {
            if (configService.isCanRunB()) {
                return runB();
            }
            startDoNotB();
            // 虽然不等于 C，但是还是会跑 C 块的代码
            if (configService.isCanRunC()) {
                return runC();
            }
            startDoNotC();
        }
        if (runType == C) {
            if (configService.isCanRunC()) {
                return runC();
            }
            startDoNotC();
        }
        startDoDefault(runType);
        return runDefault();
    }
    ```
2. Part Code Ⅱ Result
    ```java
    public Result run(RunTypeEnum runType)
        if (runType == A) {
            return runA();
        } else if (runType == B) {
            if (configService.isCanRunB()) {
                return runB();
            }
            startDoNotB();
        } else if (runType == C) {
            if (configService.isCanRunC()) {
                return runC();
            }
            startDoNotC();
        }
        startDoDefault(runType);
        return runDefault();
    }
    ```

# 总结分析

1. 使用 switch 的时候一定要注意使用 return 或 break 中断，否则一旦匹配上，会顺延执行每个 case 块里面的代码
2. 正常情况下我们需要使用多 case 匹配一个代码块，则需要用到这个顺延执行的特效，而不是使用 if (exp1 || exp2 || exp3 ...) {do...}。
    ```java
    switch (type) {
        case A:
            return doA();
        case B1:
        case B2:
        case B3:
            return doB();
        case C:
        case D:
            return doNotAB();
        default:
            return doNothiong();
    }
    ```
3. 深入思考：是否可以更加深入使用这个顺延模式

# 面向函数编程 of 职责链模式

我们先来看看面向对象的职责链模式（伪代码）：

```java
某个审批流程 A，当申请员工等级为 Lvx 时候，需要 Lvx-1 的所有人审批，最后由系统自动审批.
已知共有 5 个级别，每个级别审批需要做不同的事。

class SpSystemOfA {
    public void doSp() {
        sout("system auto done ：{}!", sys?.do());
    }
}
class SpLv1OfA extends SpSystemOfA {
    public void doSp() {
        sout("lv1 done ：{}!", lv1?.do());
        super.doSp();
    }
}
class SpLv2OfA extends SpLv1OfA {
    public void doSp() {
        sout("lv2 done ：{}!", lv2?.do());
        super.doSp();
    }
}
class SpLv3OfA extends SpLv2OfA {
    public void doSp() {
        sout("lv3 done ：{}!", lv3?.do());
        super.doSp();
    }
}
class SpLv4OfA extends SpLv3OfA {
    public void doSp() {
        sout("lv4 done ：{}!", lv4?.do());
        super.doSp();
    }
}

psvm(args[]) {
    SpSystemOfA spLvxOfA = getSpOfAByLv(staff.Lv);
    spLvxOfA.doSp();
}

```

1. 职责链模式会顺延执行父类的代码块，通常用于流程类业务，只要定义好流，就能形成很多复杂的审批模板或执行流模板。
    PS：比如 工单审批/CI/DevOps
2. 再通过 List、Map 集合去一对多封装，发散匹配形成更复杂的并行流、树形流、图形流等等。
    PS：比如 脑图/路径分析/预测模拟

下面我们使用 switch 来模拟上面的设计模式（伪代码）：

```java
public static void doSp(lvx) {
    case(lvx - 1) {
        case Lv4:
            sout("lv4 done ：{}!", lv4?.do());
        case Lv3:
            sout("lv3 done ：{}!", lv3?.do());
        case Lv2:
            sout("lv2 done ：{}!", lv2?.do());
        case Lv1:
            sout("lv1 done ：{}!", lv1?.do());
        default:
            sout("system auto done ：{}!", sys?.do());
    }
}

psvm(args[]) {
    doSp(staff.Lv);
}
```

1. 线性流 = switch 顺延 + 单线程
2. 并行流/图形流 = switch 顺延 + 多线程控制 + 函数式接口传参