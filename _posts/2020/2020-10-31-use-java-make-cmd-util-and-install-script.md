---
layout: post
title: "用 Java 制作命令行工具并提供自动安装脚本"
description: "【2020-10-31】用 Java 制作命令行工具和自动安装脚本"
categories: [整理，工具制作]
tags: [命令行工具，静态多态反射]
redirect_from:
  - /2020/10/31/
---

# 命令行应用特征

```
入口唯一：API 唯一
一行入参：线性传参
文本出参：Console 输出
```

## 入口唯一（API 唯一）

指令格式：
```shell
$ command [options] [arguments]

↓变式 1

$ command [option1] [argument1] [option2] [argument2] ... [optionN] [argumentN]

↓变式 2

$ command [option1] [argument1] [argument2] ... [argumentN] [option2] [argument1] [argument2] ... [argumentN]

↓

...
```

通常，一个命令被开发出来，只会有一种格式，而所有变化都在 `[options]` 和 `[arguments]` 里面，它们组合理论上可以产生无限种变化。
```
[options] 动作/业务/行为
[arguments] 变量/参数
```

## 一行入参（线性传参）

由于换行就会执行命令，所以传入的参数只有一维的结构，故【线性传参】。

```shell
$ command [options] [arguments]
[options] 特殊参数，定制化动作/业务/行为
[arguments] 普通参数，依赖 [options]
```

参数分隔：通过空格可以天然分隔参数，从而实现`【线性传参】->【参数数组】`，若单个参数里面有空格，则用英文引号括起来。

## 文本出参（Console 输出）

命令是在控制台执行的，不管是什么样的控制台，由于没有特殊的作图或制表语法，所有的输出都是字符集的一个组合。

而二维的字符集能够产生什么样的输出，很多时候需要我们的想象力，比如表格的输出： ↓

```shell
$ util -tt title1,title2,t3 text1,text2,t3 longlongcontext,test1,te2
 工具类型：文字表格【-tt】
 分隔符：【,】
 +----------------+-------+----+
 |title1          |title2 |t3  |
 +----------------+-------+----+
 |text1           |text2  |t3  |
 +----------------+-------+----+
 |longlongcontext |test1  |te2 |
 +----------------+-------+----+

$ util -tt -s "#" title1#title2#t3 text1#text2#t3 "longlongcontext#test1#content with space"
 工具类型：文字表格【-tt】
 动作：自定义分隔符【-s】
 分隔符：【#】
 +----------------+-------+-------------------+
 |title1          |title2 |t3                 |
 +----------------+-------+-------------------+
 |text1           |text2  |t3                 |
 +----------------+-------+-------------------+
 |longlongcontext |test1  |content with space |
 +----------------+-------+-------------------+
```

# Java 实现

```
可执行文件：Jar
main 函数接收参数
预处理
Maven 打包
```

## 可执行文件（Jar）

打一个可执行的 Jar，通过命令执行：
```shell
java -jar 包名。jar
```

当然也可以把 Jar 打包成可执行文件：[exe4j](https://www.ej-technologies.com/download/exe4j/files)

## main 函数接收参数

```java
public static void main(String[] args) {
    // excute cmd
    MainApp.excute(params);
}

$ java -jar 包名。jar $参数 1 $参数 2 "$参数 3" ...

↓

MainApp.excute(new String[]{ "$参数 1" "$参数 2" "$参数 3" ... })
```

## 预处理

所谓的预处理就是把普通参数进行提取，归类为 [options] 对 [agraments] 的映射。

```java
$ java -jar 包名。jar [类型] [动作] [arguments]
[类型] 用于寻找具体的业务实现类，对应模块
[动作] 用于定位具体的执行代码块或调用的函数，具体到功能
[arguments] 普通参数，依赖 [options]

↓ 部分 MainApp.java 代码片段

private static List<Class<? extends BaseCmdUtils>> cmdUtilList =  CmdClassUtils.getAllSubClass(BaseCmdUtils.class);

public static void main(String[] args) {
    // args = new String[] {  };
    // args = new String[] { "-h" };
    // args = new String[] { "-t","-f","now" };
    if (null == args || args.length < 1) {
        System.out.println(" 请传入工具类型参数：-help | -h（帮助）！");
        return;
    }
    String type = args[0];
    String action = args.length > 1 ? args[1] : null;
    String[] params = reGetParams(args);

    // excute cmd
    MainApp.excute(type, action, params);
}

private static void excute(String type, String action, String[] params) {
    try {
        // help go excute
        if ("-help".equals(type) || "-h".equals(type)) {
            MainApp.help();
            return;
        }
        // util go excute
        for (Class<? extends BaseCmdUtils> c : MainApp.cmdUtilList) {
            if (Boolean.TRUE.equals(CmdClassUtils.invokeStaticMethod(c, "canDeal", type))) {
                CmdClassUtils.invokeStaticMethod(c, "excute", action, params);
                return;
            }
        }
        // other go excute
        System.out.println(" 未知工具类型：" + type);
        System.out.println(" 请运行：util -h 查看帮助");
    } catch (Exception e) {
        // exception go excute
        System.out.println("----------------------------------!! 异常发生 !!--------------------------------");
        e.printStackTrace();
        System.out.println("--------------------------------------------------------------------------------");
    }
}

private static void help() {
    System.out.println(" Terminal 命令行工具 V0.0.1");
    System.out.println("------------------------------------------------------------------------------");
    System.out.println(" util [工具类型] [动作类型] [参数。..（多个空格分隔，含空格的参数用 \" \" 括起来）]");
    try {
        for (Class<? extends BaseCmdUtils> c : MainApp.cmdUtilList) {
            CmdClassUtils.invokeStaticMethod(c, "help");
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}

由此，可以看到，所有命令行工具类都实现了 BaseCmdUtils 这个基类，而且都实现了三个静态方法：
1. help（使用说明）
2. canDeal（是否支持类型参数判断）
3. excute（执行动作）

由于工具类的寻找和方法调用都用反射自动处理，MainApp.main 里面的代码已经成为了通用的预处理代码
所以，后续需要添加什么新的工具直接添加一个 BaseCmdUtils 扩展类并实现其中三个静态方法即可
```

PS：具体代码逻辑参见：[https://github.com/petterobam/util-cmd](https://github.com/petterobam/util-cmd)

## Maven 打包

那么问题来了，如何打出一个单文件的可执行 Jar 呢？

```xml
<!--打包方式 2，mvn package assembly:single，生成单个 jar-->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-assembly-plugin</artifactId>
    <version>2.5.5</version>
    <configuration>
        <archive>
            <manifest>
                <mainClass>com.github.terminal.MainApp</mainClass>
            </manifest>
        </archive>
        <descriptorRefs>
            <descriptorRef>jar-with-dependencies</descriptorRef>
        </descriptorRefs>
        <!--不加 jar-with-dependencies 后缀-->
        <appendAssemblyId>false</appendAssemblyId>
        <!--包名用项目名-->
        <finalName>${project.name}</finalName>
    </configuration>
    <executions>
        <execution>
            <id>make-assembly</id>
            <phase>package</phase>
            <goals>
                <goal>single</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

# 一键安装

```
shell 脚本自动安装
cmd 批处理自动安装
powershell 自动安装
```

所谓自动安装就是将 `java -jar 包名。jar ` 绑定某个快捷命令，比如 `util`

这个在 shell 里面就直接通过 `alias util=java -jar $PROJECT_PATH/target/util-cmd.jar` 指定了，其他里面同理。

## shell 脚本自动安装

自动安装脚本如下：
```shell
#!/bin/bash
# author:ouyangjie02
# Usage: util cmd util install
# shell path
SHELL_PATH=$(cd `dirname $0`; pwd)
echo "-----> shell current path"
echo "cd $SHELL_PATH"
cd $SHELL_PATH
cd ..
PROJECT_PATH=$(pwd)

echo "-----> check util alias in profile is exit"
if cat ~/.bash_profile | grep "alias util=java -jar">/dev/null
then
  echo "-----> exit util alias in profile then skip"
else
  echo "-----> add util alias to profile"
  echo "alias util=java -jar $PROJECT_PATH/target/util-cmd.jar" >> ~/.bash_profile
  source ~/.bash_profile
fi

echo "-----> check util alias in zsh is exit"
if cat ~/.zshrc | grep "alias util=java -jar">/dev/null
then
  echo "-----> exit util alias in zsh then skip"
else
  echo "-----> add util alias to zsh"
  echo "alias util=java -jar $PROJECT_PATH/target/util-cmd.jar" >> ~/.zshrc
  source ~/.zshrc
fi

echo "-----> call mvn package"
mvn package
echo "if [util -help] not useful, please reopen terminal !"
```

## cmd 批处理自动安装

Windows 的命令行窗口没办法使用 Alias，只能通过注册表预执行 doskey 命令的批处理文件，为当前窗口注入快捷命令

1. 新建一个 cmd-alia.bat 批处理文件，添加 doskey 快捷命令指定
    ```bat
    :: util-cmd Terminal 常用小功能命令行工具 
    @doskey util=java -jar ${projectPath}\util-cmd.jar $* 
    ```
2. 新建一个 cmd-alia.reg 文件
    ```shell
    Windows Registry Editor Version 5.00

    [HKEY_CURRENT_USER\Software\Microsoft\Command Processor]
    "AutoRun"="C:\\cmd-alias.bat"
    ```
3. 双击执行 cmd-alia.reg 文件，添加注册表

cmd-alia.reg 提前建好，写成自动化脚本就是下面这个：
```bat
@Echo Off
echo "----- utf-8 mode"
chcp 65001
@Title util-cmd-install@ouyangjie02
echo "----- bat current path"
Set curr_path=%~dp0
echo "----- remove bin/"
Set project_path=%curr_path:~0,-4%
echo "----- cd %project_path%"
cd %project_path%
echo "----- call mvn package"
call mvn package
echo "----- check is exit util alias"
find /I "@doskey util" C:\cmd-alias.bat
IF ERRORLEVEL 1 goto 1
IF ERRORLEVEL 0 goto 0
:0
echo "----- exit util alias then exit"
echo "if [util -help] not useful, please reopen terminal !"
pause
goto exit
:1
:: add \r\n to end of C:\cmd-alias.bat
echo "----- add util alias"
echo :: util-cmd Terminal 常用小功能命令行工具 >> C:\cmd-alias.bat
echo @doskey util=java -jar %project_path%target\util-cmd.jar $* >> C:\cmd-alias.bat
:: echo @doskey util-update=cd %project_path% ^&^& git pull ^&^& mvn package  >> C:\cmd-alias.bat
echo "----- register cmd-alias.bat"
regedit /s cmd-alias.reg
echo "if [util -help] not useful, please reopen terminal !"
refreshenv
pause
goto exit
```

## powershell 自动安装

powershell 的配置文件和 Linux 类似，将预加载命令添加到 `notepad $PROFILE` 文件里面就能达到效果

```shell
# 由于 powershell 的 Add-Alias 命令无法追随参数，所以用的 function 命令预加载指定快捷命令：
function util { java -jar $project_path\target\util-cmd.jar `$(`$args[0]) `$(`$args[1]) `$(`$args[2]) `$(`$args[3]) `$(`$args[4]) `$(`$args[5]) }
```

自动安装脚本如下：
```shell
echo "-----> utf-8 mode"
chcp 65001
echo "-----> ps1 current path"
$curr_path = Split-Path -Parent $MyInvocation.MyCommand.Definition
echo "-----> remove bin/"
$project_path=$curr_path.Substring(0,$curr_path.Length-4)
echo "-----> cd $project_path"
cd $project_path
echo "-----> call mvn package"
mvn package
echo "-----> add util alias to powershell"
Add-Content $PROFILE -Encoding utf8 -Value "# util-cmd utils "
Add-Content $PROFILE -Encoding utf8 -Value "function util { java -jar $project_path\target\util-cmd.jar `$(`$args[0]) `$(`$args[1]) `$(`$args[2]) `$(`$args[3]) `$(`$args[4]) `$(`$args[5]) }"
Add-Content $PROFILE -Encoding utf8 -Value "function util-update { cd $project_path; git pull; mvn package; }"
echo "if [util -help] not useful, please reopen terminal !"
```