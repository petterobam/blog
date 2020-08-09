---
layout: post
title: "项目依赖冲突解决技巧和经验"
description: "【2020-07-23】项目依赖冲突解决技巧和经验"
categories: [整理,Maven]
tags: [Maven,冲突]
redirect_from:
  - /2020/07/23/
---

# 背景

一般正规的 CI 的时候会包含【冲突检测】和【Jar包版本检测】这两项，出现失败的时候，需要解决问题。

# 冲突检测卡点

冲突检测一般可以分为两种：

1. 包冲突（The diffrent in conflict: [groupId]:[artifactId]）
    ```
    1、相同包不同版本，多数情况下不影响使用，系统默认选择加载其一。
    2、Maven命令表现：([groupId]:[artifactId]:[conflict version] compile -  omitted for conflict with [used version])
    ``` 
2. 类冲突（duplicate classes）
    ```
    1、相同类路径且相同类名，可能包名不相同。
    2、如果类内容不一样，会增加应用不确定性。
    3、关键类需要处理，非关键类可以选择忽视。
    4、Maven命令表现：
     1) 同jar ([groupId]:[artifactId]:[version] - version managed from [conflit version]; omitted for duplicate)
     2) 不同jar ([groupId]:[artifactId]:[version]:runtime - scope managed from compile; omitted for duplicate)
    ```

## 包冲突处理步骤

方法一：通过 idea Maven Help 插件，排除冲突包

方法二：通过 Maven 命令，找出依赖清单，exclusion 排除冲突包
```bash
# 多 Maven 应用需要执行，install 子项目，保证 dependency:tree 时候找不到子项目依赖
mvn clear install -Dmaven.test.skip=true
# 冲突依赖清单
mvn dependency:tree -Dverbose
# 指定查看某个包的冲突依赖清单
mvn denpendency:tree -Dverbose -Dincludes=[groupId]:[artifactId]
```

方法三：dependencyManagement 强制指定版本（推荐）
```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>1.2.70</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

## 类冲突处理步骤

类冲突无法精准通过 -Dverbose 筛选出来，需要通过指定工具处理。

方法一：通过公司系统识别的 指定冲突，确定要排除的 jar 包，从依赖树里面排除（推荐）
```bash
# 多 Maven 应用需要执行，install 子项目，保证 dependency:tree 时候找不到子项目依赖
mvn clear install -Dmaven.test.skip=true
# 依赖清单
mvn dependency:tree > mvn.txt
# 去 mvn.txt 里面 find 冲突包最近可见父依赖，exclusion 冲突包
```

方法二：runtime debug 查看类源头
```java
// Jdk自带
<类名>.class.getProtectionDomain().getCodeSource().toString()
// 或者使用工具类
ClassLoaderUtils.where(<类名>.class)  

// 保存下面类到项目，debug 时候，idea 按 Alt+F8，弹出 Evluate Expression 对话框，在 Expression 处输入：ClassLoaderUtils.where(<类名>.class)
import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.CodeSource;
import java.security.ProtectionDomain;

public class ClassLoaderUtils {
    public static String where(final Class cls) {
        if (cls == null) {
            throw new IllegalArgumentException("null input: cls");
        }
        URL result = null;
        final String clsAsResource = cls.getName().replace('.', '/').concat(".class");
        final ProtectionDomain pd = cls.getProtectionDomain();
        if (pd != null) {
            final CodeSource cs = pd.getCodeSource();
            if (cs != null) {
                result = cs.getLocation();
            }
            if (result != null && "file".equals(result.getProtocol())) {
                try {
                    if (result.toExternalForm().endsWith(".jar") ||
                            result.toExternalForm().endsWith(".zip")) {
                        result = new URL("jar:".concat(result.toExternalForm())
                                .concat("!/").concat(clsAsResource));
                    } else if (new File(result.getFile()).isDirectory()) {
                        result = new URL(result, clsAsResource);
                    }
                } catch (MalformedURLException ignore) {
                }

            }
        }
        if (result == null) {
            final ClassLoader clsLoader = cls.getClassLoader();
            result = clsLoader != null ?
                    clsLoader.getResource(clsAsResource) :
                    ClassLoader.getSystemResource(clsAsResource);
        }
        return result.toString();
    }
}
```

# Jar包版本检测卡点

jar 卡点一般是原来 jar 包有故障或安全问题，需要在上线时候修复，红色部分的是必须要做的。

## 局部处理（快速解决-推荐）

方法一：dependencyManagement 强制指定版本（推荐）
```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>1.2.70</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

方法二：修改高版本或引入高版本包且exclusion 低版本的依赖。
```bash
# 多 Maven 应用需要执行，install 子项目，保证 dependency:tree 时候找不到子项目依赖
mvn clear install -Dmaven.test.skip=true
# 指定包的依赖清单
mvn denpendency:tree -Dincludes=[groupId]:[artifactId]
```

## 脚手架升级（风险）

风险点：

0. 脚手架本身有问题的风险
1. 脚手架升级可能导致原应用个性化代码不可用
2. 脚手架自动注入可能导致重复配置源或冲突配置源，需要手动排除一方配置
3. 基于 starter 和原来单 jar 引入重复类，导致大量 duplicate classes 问题

### 某项目升级脚手架案例

由于有大量 jar 包版本卡点，没有使用 dependencyManagement 强制指定版本，就直接升级了脚手架，出现了的问题：

1. 日志框架问题（日志框架初始化失败，JVM启动失败）
    ```java
    日志相关类找不到，导致JVM启动异常

    启动情况：必现 

    问题分析：
    1、static 方法（里面调用日志）在 WebApplication 类中调用。
    2、根据依赖就近选择原则（需要什么加载什么），WebApplication 作为入口类加载时候执行了该方法，导致内部有调用 logger.info 时候，自定义实现的 LogFactory 调用 logger.info，循环逻辑导致异常。
    3、总结：日志组件未初始化时候日志组件内部使用日志工具输出日志异常

    解决办法：
    1、[延迟加载] static 方法调用放到其他 SpringBean 类中执行。（Spring Context 先于 SpringBean 加载） —— 如果其他 Context 类型的加载类中使用了 logger 则又会出现该问题
    2、[日志降级] 添加指定 LogFactory 类日志级别过滤配置 <Logger name="com.xxx.xxx.LogFactory" level="warn"/>
    ```

2. 数据源重复问题
    ```java
    ***************************
    APPLICATION FAILED TO START
    ***************************

    Description:

    Cannot determine embedded database driver class for database type NONE

    Action:
    ....
    ------------------------------------------------------

    启动情况：必现

    问题分析：
    1、征兆：Cannot determine embedded database driver class for database type NONE
    2、脚手架自动注入，导致多个数据源，无法选择使用哪个
    3、自动注入的类可到对应 starter 包或自动注入包下面的 resources/META-INF/spring.factories 找到。

    解决方法：启动类上添加排除自动注入注解
    @EnableAutoConfiguration(exclude = {
        KafkaAutoConfiguration.class,
        DataSourceAutoConfiguration.class,
        RedisAutoConfiguration.class
    })
    ```

3. 脚手架升级后需要关注风险
    ```
    升级后的代码改造
    ```

# 注意事项

1. 新脚手架 Maven 各个 pom 文件 parent 依赖关系
    ```
    多 Maven 子项目互相依赖关系要弄清楚才能很好排包
    略
    ```

2. 以下情况会导致目标 Maven 依赖无法加载
    ```xml
    1、[远程仓库] 无法查到
        联系相关人员发包，然后再拉

    2、Failure to find [groupId]:[artifactId]:pom:[version] in 远程仓库地址 was cached in local repository，resolution will not be reattempted until the update interval of 仓库名 has elapsed or updates are forced.
    本地 maven 下载异常，且在 本地仓库（idea->setting->maven->local repository) 
    创建了 [目标包文件目录]（local repository/[groupId].spilt(".")多级目录/[artifactId]文件夹/[version]目录）和 xxx.lastUpdated，
    导致不会重新获取远程文件，除非远程标记更新时间更新或本地强制远程更新
        1）删除本地jar包目录或*.lastUpdated文件
        2）配置 setting.xml 强制远程校验
            <repositories>
                <repository>
                        <id>central</id>
                        <url>远程仓库地址</url>
                        <releases>
                                <enabled>true</enabled>
                                <updatePolicy>always</updatePolicy>
                        </releases>
                        <snapshots>
                                <enabled>true</enabled>
                                <updatePolicy>always</updatePolicy>
                        </snapshots>
                </repository>
            </repositories>
    ```