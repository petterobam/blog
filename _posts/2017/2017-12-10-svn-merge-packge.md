---
layout: post
title: "关于代码提交、定版合并和打单包总结"
description: "SVN 提交经验分享"
categories: [体会，SVN]
tags: [代码提交，代码合并，打包]
redirect_from:
  - /2017/12/10/
---

## 前情提要

鉴于最近公司旅游及同学聚会，琐事蛮多，疏于记录，特提笔写写最近的东西。

背景：前些日子，公司核心产品终测环境打包编译屡屡出问题，特此做一些通用总结。

## 代码提交

### 每次提交的最小单位是安全的整体逻辑或弱关联文本

愿我们每个人都将代码提交演绎为一项神圣的仪式，了解提交的魅力。

	安全：不影响启动的逻辑、不影响原先业务的逻辑。
	整体逻辑：保证不随意提交零散代码。整体提交能保证安全，拆开提交则有隐患。
	弱关联文本：新增文件的时候，弱关联文本单独提交无隐患。

#### 整体逻辑定义

- 1）一个业务功能

- 2）一个服务功能

- 3）单个 bug 的处理

- 4）其他

	代码层面上逻辑闭合（基于 SVN 上已有的类的引用，做的一整套修改）以 ASMS 为例： 

	- 如果你<span style="color:red">修改</span>的是 controller，则你需要检查对应的页面
	- 如果你<span style="color:red">修改</span>的是一个 service，则你需要检查引用这个 service 的其他 service 和 controller；
	- 如果你<span style="color:red">修改</span>的是一个<span style="color:red">dao</span>，则你需要检查对应的 Mapper 和 service；
	- 如果你<span style="color:red">修改</span>的是一个<span style="color:red">Mapper</span>，则你需要检查对应的<span style="color:red">数据库环境</span>、dao 和 service；
	- 如果你<span style="color:red">修改</span>的是一个<span style="color:red">entity</span>（关联表的 JavaBean），则你需要检查<span style="color:red">所有</span>。

当然，这些检查并不是真的要跑到每个地方去看，我们要善于利用 intellij 的编译工具和我们的经验，保证代码编译逻辑正确（启动）、业务逻辑正确（需求落实）、功能逻辑正确（需求落实+异常处理）

#### 弱关联文本的定义

所谓的弱关联文本，就是不依赖或仅仅依赖于原来 SVN 的环境，不依赖于任何新的文件的文本，他们都可以直接提交。

- 纯粹的弱关联文本

	- 1) 你<span style="color:red">新增</span>了一个 JavaBean，并且引用的类和方法是原先 SVN 仓库里面已经有的，这样的 JavaBean 可以单独提交；
	- 2) 你<span style="color:red">新增</span>了一个 js、css 或 icon 等 static 里面的静态文本，这些可以先单独提交。

- 有前提条件下的弱关联文本

	- 1)<span style="color:red">不影响启动的前提下</span>，所有的 static 和 view 下吗的文件都是弱关联文本。

#### 强关联文本的定义

有弱关联文本必有对应的强关联文本，这些东西的提交一定要有个概念。

- 1）所有于数据库交互的文本（<span style="color:red">Mapper、Entity</span>）或于数据库中间件交互的文本（<span style="color:red">Dao</span>）都是强关联文本，他们的新增都需要进行规范的检查，步骤从（数据库环境=>Entity[与数据库对应的 JavaBean]=>Mapper=>Dao=>编译=><span style="color:red">启动自测</span>）；

- 2）所有使用到其他项目的类的类都是强关联文本，比如实现继承、spring 注入、JavaBean 引入实体等，需要进行规范的检查（[确认 Mvn 的版本是最近的，至少是三天以内的]=>编译=><span style="color:red">启动自测</span>）；

- 3）所有<span style="color:red">系统配置文件</span>都是强关联文本，包括<span style="color:red">property</span>、source 下的<span style="color:red">xml</span>文件和 maven 工程的<span style="color:red">pom</span>文件，这些文档的提交需要找组长和对应的技术经理，系统框架级别的要找 CTO 的确认，禁止单独提交。

### 每次提交都要遵照标准的提交步骤

#### 提交代码前的最低标准

- 1)<span style="color:red">所在环境编译无误</span>
- 2) 最高标准：所在环境启动无误，并且代码彻底解决了某个 bug、完全实现了某个功能

#### 小乌龟操作步骤

- 1) 更新你要提交的项目的代码（如有冲突，请先解决冲突，并返回 1.2.1）

- 2)Commit 预览，预览时要确定两点：
	- a) 要提交的文件的数量
	
		注：在排除了配置文件后的文件数量，配置文件找组长和技术经理提交

	- b) 检查每个你要提交的 java 文件和 Mapper 文件，修改的地方是否是你的代码，避免提交他人的代码

		注：java 文件要特别注意导入的包，很多情况下是导入了无用的包，导致了代码的问题，可以对自己的 intellij idea 做如下设置
 
	![自动导包设置](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/oyjie.cn/upload/2017/12/qjtsinc654j8mqb0u2rnorq1nd.png)

	> 勾选标注 1 选项，IntelliJ IDEA 将在我们书写代码的时候自动帮我们优化导入的包，比如自动去掉一些没有用到的包。 <br/>
	> 勾选标注 2 选项，IntelliJ IDEA 将在我们书写代码的时候自动帮我们导入需要用到的包。但是对于那些同名的包，还是需要手动 Alt + Enter 进行导入的<br/>
	> <span style="color:red">一般勾选标注 1 即可</span>，标注 2 不勾选，有利于我们在编程的时候了解一些工具类的路径，这是一个即时学习的过程。

- 3) 写好备注

	- a) 如果是 bug，请附上 bug 的标题及 ID，详细可以追加产生原因和处理方案，总结的过程，提升贼快；
	- b) 如果是需求，请附上需求说明，及该批代码完成了需求的哪一块；
	- c) 如果是其他功能，请附上功能描述，及完成了该功能的哪一块；
	- d) 如果是其他，请附上明确备注

- 4) 提交，并跟进相关环境的更新情况，及时查看代码影响的模块，自测。

#### 提交情况告知组长

组长有义务监督组员代码的提交，特别是定版的代码提交，但是提交过程何其多，组长无法一一顾及，所以需要组员主动汇报组长自身提交的动态，不然出了问题组长会很不爽哦。

<span style="color:red">提交完开发环境</span>，需要告知组长，可以简单的发个消息，告知你提交的版本、描述和时间。

当然，个人建议可以用通讯工具建立一个组内代码提交动态群，组长可以浏览每天的提交动态。
 
![组内代码提交群](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/oyjie.cn/upload/2017/12/1hoihoum3ugcrqqhos1akaq7hu.png)

## 定版合并

SVN 开发版本到定版的代码迁移过程，称为定版合并过程。

### 定版合并先决条件

#### 保证合并的代码来源无误

开发版的代码需要满足解决了某个 bug，完成了某个需求，实现了某个功能，并测试通过。

#### 待合并的版本清单

清楚要合并的代码在开发版上的提交版本清单，需要合并哪些提交记录，才能组成一个逻辑整体。

#### 明确清楚合并顺序

当出现多个模块合成一个整体逻辑的时候，明确清楚合并顺序。例如修改了 OpenApi，如果有其他的合作项目，则其他项目的合并在前。

### 定版合并步骤

定版合并前一定要保证开发版代码正确，否则合并定版就如同一场儿戏。

#### Merge 的原则和原理

Merge 是一个代码选择性拷贝的过程，了解其原理有助于我们更流畅的 Merge，减少发生冲突的次数及减轻对冲突的恐惧。

- 1) 先更新你需要提交的项目目录。

	只要你的本地代码在版本中，更新必定不会产生冲突。定版代码我们都不会手动在上面编辑，所以更新的时候不会与你的定版代码冲突，如有冲突，说明你对本地的定版代码做了编辑修改，这个时候只需要还原整个项目的代码，在进行更新即可。

- 2) 选择对应的远程版本，Merge 预览

	少量的代码合并很容易 Merge，但也不能轻视，往往就是这种情况让我们掉以轻心。

	大量代码的合并可能让我们疲于应付，但是 Merge 只是一个代码远程 Copy 的过程，这里可以简单的分享一些技巧。

	背景 1：例如，你最近半个月都在做一个需求项目，并且你们组的其他人也全部参与其中，在这期间你的组员可能还时不时改改其他业务 bug，但是跟这个新项目有关的东西在没做完前都只能提交开发的 SVN。这种情况下，我就会定下规矩，关于新需求项目的代码提交备注统一添加前缀——XXXXX 项目：[你的 SVN 备注]。如此一来，半个月之后，项目开发完成后，需要在终测上测试了，这个时候我利用 Merge 预览就可以轻松找到我要合并的代码，而这些代码集合就是这个项目的整体逻辑，高效、完美。

	- a. 通过<span style="color:red">Next 100</span>按钮调整你的项目开始时间 From</span>
	- b. 通过小乌龟的通配搜索功能，记住使用正则功能一定要勾选 <span style="color:red">use regular expression</span>
	- c. 有些备注模糊不清的地方，组长需要找到对应的组员确认，<span style="color:red">并纠正告诫</span>
	
	![svn 的 merge 示例](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/oyjie.cn/upload/2017/12/3i7nfqp7vkjd7qs1461v4g6ov0.png)

然后，开始 Merge，庆幸的是该项目的 Merge 没有出现任何冲突，虽然归功于良好的注释和整体逻辑的提交原则，但是这并不意味着不会出现冲突的 Merge 情况了。

往往一个项目时长越长，业务关联越多，可能出现的问题也会越多，牵扯到的业务越多，交叉修改文件的频率也会越频繁，这样通过搜索出来的的文件很大概率跨了很多未合并的版本。

例如，我在版本里面随机选择一些版本进行合并

![随机代码合并](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/oyjie.cn/upload/2017/12/vjvk33sq74iajologp27rhem3h.png)

这种文件树的冲突，一般指文件夹，就算是文件也可以直接不管，标记为已解决即可

![文件夹冲突](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/oyjie.cn/upload/2017/12/slmsm4v218j9mrjfu7jfmvbrrf.png)

像这种文件类的冲突，如果你不擅长或不确定如何 Edit conflict，可以先选择合并接收开发版本的 SVN 最新版，快速完成 Merge 的过程，并且确保你的代码能过来是最重要的。

![文件冲突](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/oyjie.cn/upload/2017/12/23oi0ni1mqggbpfhdmond8ftac.png)

这样，你的代码就“毫无 Conflict”的情况下 Merge 到了本地的定版，这样就结束了吗？

No，上面都是无关紧要的必要步骤，下面的才是重中之重。

#### 有意识的检查

检查是一项很枯燥的工作，很容易让人失去耐性，但是如果是有意识的检查，有明确的目标，那么这项工作就变得流畅而富于意义，至少对于当时的你是这样的。

首先打开你 Merge 的项目的提交预览界面，不要写提交备注

预览要确定的一些东西，即目标：

- a) 要提交的文件的数量
	
	注：在排除了配置文件后的文件数量，配置文件找组长和技术经理提交

- b) 检查每个你要提交的 java 文件和 Mapper 文件
	
	注：确定修改的地方是你的代码。

- c)<span style="color:red">重点检查 Merge 过程中发生过冲突的文件</span>
	
	注：这样的文件必定是少量，如果有很多，你就要慎重一点了，找找原因你会发现，可能有正在 130 测试中的需求没有合并到定版，也可能会有很久远的代码没有合并到定版了，然后幸运的被你发现了，<span style="color:red">解决他</span>。

**提问：如果 Merge 过程中，没有出现一次 <span style="color:red">Conflict</span> 的提示，是不是意味着可以绝对不会有问题？**

> 答：不是。这只能说明你 Merge 的代码一定是你提交的那些代码，如果是一个整体逻辑，那确实没有问题，可是问题是可能不是一个整体逻辑，比如出现 1.2.2 中你提交到开发版有<span style="color:red">import</span>无用的包，恰好你没有设置自动清除无用的包，而这个依赖的类在定版正好没有，那你的这次提交就是一个<span style="color:red">伪整体逻辑</span>，就会导致定版启动异常。

如何判断你的每一次提交是否是整体逻辑呢？下面的步骤才是无罪证书获取流程。

#### 编译都没问题了，那才是没问题

我们用 intellij idea 打开我们定版的工程：

- 1) 确保你定版的 idea 工程的 Maven 是三天以内的版本（看 overlay 里面的子项目时间）。
- 2) 确保 idea 工程的每个 Module 是最新的，不是就更新。

打开 idea 工程的 Maven Projects，展开你要提交的子项目的 lifecycle，clear、compile，
<span color="blue">Process finished with exit code 0</span> 代表你可以喝口茶了。

最后，提交代码，再次简单检查一下，写好备注，提交代码，并实时关注终测环境的更新状态，确保你提交的代码不但安全，并且有效（满足了需求？解决了问题？实现了功能？）。

## 定版打单包
<span style="color:red">如果是用于终测或客户环境，请在本地定版打单包</span>。

### 定版打包的先决条件

- 1) 保证定版 idea 项目 Maven 是三天以内
- 2) 保证你要打包的子项目 Maven 编译无误

### 定版打包的技巧

#### 定版打单包的痛点

**<span size="20px">慢！</span>**

借助我们原来的打包工具
 
和与 tomcat 一致的子目录

![tomcat 发布包](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/oyjie.cn/upload/2017/12/6e36b3aj6ii6cr09jcph8npa99.png)

请问你要什么样的包，我都可以给你。

定版打包让人比较难受的是，编译启动太耗时间，然而这往往是喜欢从主项目（例如 ASMS10000 的 asms-web）的 target 目录下打包的人的烦恼，当然这种情况打的包自然是没问题，但是要全部编译并发布到主项目 target 太耗时，特别是我们的核心产品的项目。

但是回头想想，为啥当初要将一个项目分离成这么多个项目，不就是为了降低不同组之间的相互影响，如果每个组自身的代码没有 problem，那么整个项目就理应 No problem。同理，打包原理也是类似，可以分离打包，基于 tomcat 的特性，我们如果能够创造那样的目录结构和所需的文件，借助打包工具，往往会事半功倍呢。

#### 定版打单包的技巧

- 1) 在桌面创建一个文件夹

	![打包区](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/oyjie.cn/upload/2017/12/pbumj6iq4sjnioqhh06mr579m2.png)
 
- 2) 将你要打包的定版子项目 webapp 文件夹下的文件夹拷入其中

	![子项目目录](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/oyjie.cn/upload/2017/12/774mlo5nbkhs3ra142t0t02alk.png)

	![打包子项目](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/oyjie.cn/upload/2017/12/54o0qq6iregvap1fu7c7a3cd65.png)

	当然，如果你打包的项目里面没有 static 类的文件可以不拷贝 static 文件夹，如果没有 view 类文件，课可以不拷贝 WEB-INF 文件，直接新建一个 WEB-INF 文件夹即可

- 3) 在 idea 定版项目上 Maven clear、compile 你的子项目
 
	![子项目编译](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/oyjie.cn/upload/2017/12/5g5r10utkihfaok3silof1fg0m.png)

- 4) 确保编译无误后，将你要提交的项目下的 target 文件下的 classes 文件夹拷入 WEB-INF 目录中
 
	![子项目编译结果](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/oyjie.cn/upload/2017/12/ptngqv77vehocpuga81lvpc0oi.png)

- 5) 然后就创造了单个子项目的打包环境
 
	![项目打包区](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/oyjie.cn/upload/2017/12/pphm6r3he2hgjo9gpv8oke257k.png)

- 6) 根据提交记录打包

	![SVN 提交日志](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/oyjie.cn/upload/2017/12/pfphd8dp0ehsep0befqrjnel1p.png)

	注：如果文件成批的在某个文件夹内，可以批量的拖进打包工具。
 
