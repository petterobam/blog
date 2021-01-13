---
layout: post
title: "【Windows 命令】SCHTASKS 计划任务日常使用技巧"
description: "【Windows 命令】SCHTASKS 计划任务日常使用技巧"
categories: [整理，CMD,SCHTASKS]
tags: [CMD,SCHTASKS]
redirect_from:
  - /2020/09/05/
---

# 普通用户解决权限问题

```
> SCHTASKS /Create ...
拒绝访问。

1. 登录用户没有权限。
2. 组策略设置不得当。
    建议用 administrator 账户登录，并且更改本地组策略：
    WIN+R 运行 gpedit.msc —— 计算机配置 —— Windows 设置 —— 安全设置 —— 本地策略 —— 安全选项 —— 用户账户控制：以管理员批准模式运行所有管理员 —> 禁用。
```

# 创建计划/任务

```cmd
schtasks /create /tn TaskName /tr TaskRun /sc schedule [/mo modifier] [/d day] [/m month[,month...] [/i IdleTime] [/st StartTime] [/sd StartDate] [/ed EndDate] [/s computer [/u [domain]user /p password]] [/ru {[Domain]User | "System"} [/rp Password]] /?

/tn TaskName         指定任务的名称。 
/tr TaskRun          指定任务运行的程序或命令。键入可执行文件、脚本文件或批处理文件的完全合格的路径和文件名。如果忽略该路径，SchTasks.exe 将假定文件在 SystemrootSystem32 目录下。 
/sc schedule         指定计划类型。有效值为 MINUTE、HOURLY、DAILY、WEEKLY、MONTHLY、ONCE、ONSTART、ONLOGON、ONIDLE。
    MINUTE、HOURLY、DAILY、WEEKLY、MONTHLY 指定计划的时间单位。
    ONCE 任务在指定的日期和时间运行一次。
    ONSTART 任务在每次系统启动的时候运行。可以指定启动的日期，或下一次系统启动的时候运行任务。
    ONLOGON 每当用户（任意用户）登录的时候，任务就运行。可以指定日期，或在下次用户登录的时候运行任务。
    ONIDLE 只要系统空闲了指定的时间，任务就运行。可以指定日期，或在下次系统空闲的时候运行任务。
/mo modifier 指定任务在其计划类型内的运行频率。默认 1 次。若 n > 1 则是每 n （单位） 运行一次
/s Computer 指定远程计算机的名称或 IP 地址（带有或者没有反斜杠）。默认值是本地计算机。
/p Password 指定用户帐户的密码，该用户帐户在 
/u 参数中指定。如果在指定用户帐户的时候忽略了这个参数，SchTasks.exe 会提示您输入密码而且不显示键入的文本。使用 NT AuthoritySystem 帐户权限运行的任务不需要密码。 
/? 在命令提示符显示帮助。
```

## 应用

做系统性的 TotoList

### 每日晚上 7 点弹出周报页面

step 1: 新建 daily-report.bat
```cmd
:: 打开日报
start "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" [日报网址]
:: UTF-8 模式
chcp 65001
:: 发送提醒的消息
msg /server:127.0.0.1 * 写周报了，兄弟！！
```

![daily-report.png](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/blog/images/windows-schtasks/daily-report.png)

step 2：添加任务，WIN+R 运行 `cmd \admin` ，打开 CMD
```cmd
SCHTASKS /Create /SC DAILY /TN daily-report /TR D:\Workspace-Netease\work-files\cmd-job\daily-report.bat /ST 19:00 /ED 2100/12/31
schtasks /query /tn daily-report
```

### 每天中文提醒吃饭

strp 1：新建 lunch-msg.bat
```cmd
:: UTF-8 模式
chcp 65001
:: 发送吃饭提醒的消息
msg /server:127.0.0.1 * 吃中饭了，兄弟！！
```
![lunch-msg.png](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/blog/images/windows-schtasks/lunch-msg.png)

step 2：添加任务，WIN+R 运行 `cmd \admin` ，打开 CMD
```cmd
schtasks /create /sc DAILY /tn lunch-msg /tr D:\Workspace-Netease\work-files\cmd-job\lunch-msg.bat /st 11:50 /ED 2100/12/31
schtasks /query /tn lunch-msg

PS：吃晚饭就不用我教了吧 @_@
```

# 查询计划/任务

```cmd
schtasks [/query] [/fo {TABLE | LIST | CSV}] [/nh] [/v] [/s computer [/u[domain]user /p password]]

/fo {TABLE|LIST|CSV} 指定输出格式。TABLE 为默认值。 
/nh 忽略表格显示中的列标题。此参数与 TABLE 和 CSV 输出格式共同使用时有效。 
/v 将任务的高级属性添加到显示中。
其他参数语义同上

schtasks /query /tn daily-report
schtasks /query /tn daily-report /v /fo csv >> d.csv
```

也可以在浏览器看你的任务清单：C:/Windows/System32/Tasks/

```cmd
这是批处理一（仅删除全部任务，不删任务所在文件夹）：
schtasks /delete /tn * /F
这是批处理二（先删任务，再删文件夹）：
del /s /q C:\Windows\System32\Tasks\Microsoft\Windows
rd /s /q C:\Windows\System32\Tasks\Microsoft\Windows
```

# 删除计划/任务

```cmd
schtasks /delete /tn {TaskName | *} [/f] [/s computer [/u [domain]user /ppassword]] [/?]

/fo {TABLE|LIST|CSV} 指定输出格式。TABLE 为默认值。 
/nh 忽略表格显示中的列标题。此参数与 TABLE 和 CSV 输出格式共同使用时有效。 
/v 将任务的高级属性添加到显示中。
其他参数语义同上
```

## 删除一些软件默认添加的执行计划

```cmd
Adobe、Flash、Google、WPS 一些更新计划可以删除掉

schtasks /delete /tn {taskName} /F
```

![app-tasks.png](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/blog/images/windows-schtasks/app-tasks.png)

```cmd
schtasks /delete /tn AdobeGCInvoker-1.0 /F
schtasks /delete /tn "FlashHelper TaskMachineCore" /F
schtasks /delete /tn GoogleUpdateTaskMachineCore /F
schtasks /delete /tn GoogleUpdateTaskMachineUA /F
schtasks /delete /tn WpsUpdateTask_Administrator /F
```