---
layout: post
title: "Git 源码·LinusTorvalds 第一次提交 CR 和启发"
description: "【2020-12-03】Git 源码第一次提交 CR 和启发"
categories: [整理，源码]
tags: [Git, 底层原理]
redirect_from:
  - /2020/12/03/
---

## Git 源码第一次提交 CodeReview

>Today, let's review Linus Torvalds's code.

### 检出第一次提交

>检出源码并定位到第一次提交

```shell
# 检出 Git 源码
$ git clone https://github.com/git/git.git
# 切换到第一次提交
$ git log --reverse --pretty=%H origin/master | head -1 | xargs git checkout
Previous HEAD position was 72ffeb997e Ninth batch
HEAD is now at e83c516331 Initial revision of "git", the information manager from hell
```

### 一些小提示

>需要 CodeReview 的文件请按照如下顺序！

```shell
$ git ls-files
 1. cache.h
 2. init-db.c
 3. update-cache.c
 4. write-tree.c
 5. read-cache.c
 6. commit-tree.c
 7. cat-file.c
 8. read-tree.c
 9. show-diff.c
10. Makefile
11. README

让我们按照上面的文件顺序 Review 一下 Linus Torvalds 的 Code 吧！！

NOTE!! 一些小提示~
cache.h 【*】一些变量和 object(blob/tree/commit) 结构定义，注释很多，请多花时间理解
init-db.c 对应 git init 命令，初始化 .git（最开始是 .dircache） 文件夹内容
update-cache.c 【*】对应 git add 命令，将文件添加到 .git/index 和 .git/objects
write-tree.c、commit-tree.c 【*】对应 git commit 将文件夹关系和 changeset 添加到 .git/objects
read-cache.c、read-tree.c、cat-file.c 解压 object 文件到临时文件
show-diff.c 调用系统 diff 命令，将解压的临时文件和当前文件做 diff 对比
Makefile 编译安装配置文件
README 【*】总结文档，作者的设计和想法
```

### 一步步深入技巧

>如何按照提交记录一步步 CodeReview ？

```shell
# 向后检出一个提交
$ git log --reverse --pretty=%H origin/master | grep -A 1 $(git rev-parse HEAD) | tail -1 | xargs git checkout
Previous HEAD position was e83c516331 Initial revision of "git", the information manager from hell
HEAD is now at 8bc9a0c769 Add copyright notices.
# Git 日志美化
$ git log --pretty=format:'|%h|%ae|%an|%aI|%s' --numstat
|e83c516331|torvalds@ppc970.osdl.org|Linus Torvalds|2005-04-07T15:13:13-07:00|Initial revision of "git", the information manager from hell
40      0       Makefile
168     0       README
93      0       cache.h
23      0       cat-file.c
172     0       commit-tree.c
51      0       init-db.c
259     0       read-cache.c
43      0       read-tree.c
81      0       show-diff.c
248     0       update-cache.c
66      0       write-tree.c
# 该版本与前一个版本比较改动
$ git diff HEAD~1
# 向前检出一个提交
$ git checkout HEAD~1
```

>that's all. go and think!!

---

## Git 第一次提交的源代码分析及带来的启示

```
Git 的本质就是一系列的文件对象集合，代码文件是对象、文件目录树是对象、commit 也是对象。
文件对象的名称即内容的 SHA1 值，SHA1 哈希算法的值为 40 位。
Linus 将前 2 位作为文件夹、后 38 位作为文件名。
```

### 哈希碰撞问题
>[哈希碰撞问题](https://security.googleblog.com/2017/02/announcing-first-sha1-collision.html)：2017 年 2 月 23 日，SHA1 算法已经在谷歌的帮助下碰撞成功，使用 SHA1 的 Git 怎么处理这个事情？

```
https://stackoverflow.com/questions/9392365/how-would-git-handle-a-sha-1-collision-on-a-blob/9392525#9392525
Git 创始人 Linus Torvalds 已经在邮件列表进行了回应，大体意思是 Git 除了 hash 了数据之外，还在文件头部存储了数据长度等信息。
想要骗过 Git 除了 SHA-1 值要相同之外，数据长度也要一致才行，这大大增加了碰撞难度。
Linus 说碰撞是通过增删一些可有可无的不透明数据来实现的，所以 Git 以后需要加强对不透明数据的检查，让这些碰撞无处可藏。
PS：从 2018 和 Git 2.19 开始，代码已重构为使用 SHA-256。
```

### 三种对象构成所有

>对象有三种类型：blob、tree、commit。

1. blob：文件内容 zlib 后的文件
2. tree：如下格式组装的文本 zlib 后的文件
   ```
   [文件属性 (mode) 类型 (blob/tree) SHA1 文件名]
   [...]
   ```
3. changeset(commit)：如下格式组装的文本 zlib 后的文件
   ```
   [tree SHA1]
   [parent [pre-commit SHA1](if exit pre-commit)
   [author 环境提交人|提交人 环境提交人邮箱|提交人邮箱 环境时间]
   [committer 提交人 提交人邮箱 提交时间]

   [{commit message}]
   ```

### 提交引起的数据结构变化简图

```yml
假设文件经过两次提交，细节分别如下，我们来看下 objects 链的变化
0、git init
1、first commit log-1
new file:   file-1.txt
new file:   dirname-1/file-2.txt
2、second commit log-2
deleted:    dirname-1/file-2.txt
renamed:    file-1.txt -> dirname-1/file-1.txt
new file:   file-3.txt

则以日志为时间维度，object 对象为数据维度，数据结构关系如下变化。

                      log-1 -----------------------------------------------→ log-2   ----------→  ...
                        ↓                                                      ↓
                changeset-1(sha1-c1)                                      changeset-2(sha1-c2) 
                        ↓                                                      ↓
                   tree-1(sha1-t1)                                         tree-3(sha1-t2)  
                    ↙       ↘                                              ↙       ↘
(sha1-f1|file-1.txt)blob-1  tree-2(sha1-d1|dirname-1)  (sha1-f3|file-3.txt)blob-3   tree-4(sha1-d2|dirname-1)
                              ↓  ↘                                                  ↓   ↘
      (sha1-f2|file-2.txt)blob-2   ...                         (sha1-f1|file-1.txt)blob-1  ...

```

### 如何设计出一个成功的开源产品？

1. 解决痛点问题
2. 极简设计
3. MVP (minimum viable product, 最小可用产品） —— 即使是少部分专业人士才会使用
4. 快速发布，快速迭代
5. 找到合适接班人

--- 

## Git 底层命令实践

>第一次提交的代码包含的 7 个底层命令

```yml
init-db: 初始化一个 git 本地仓库。
update-cache: 输入文件路径，将该文件（或多个文件）加入缓冲区中。
write-tree: 将缓存的目录树信息生成 TREE 对象，并写入对象数据库中。
commit-tree: 将 TREE 对象信息生成 commit 节点对象并提交到版本历史中。
cat-file: 由于所有的对象文件都经过 zlib 压缩，因此想要查看文件内容的话需要使用这个工具来解压生成临时文件，以便查看对象文件的内容。
show-diff: 快速比较当前缓存与当前工作区的差异。
read-tree: 根据输入的 TREE 对象 SHA1 值输出打印 TREE 的内容信息。

Oh，let's try it.
```

>初始化且添加一个文件，查看 GitDB。

```shell
$ git init-db

$ echo "test git add" > test1.txt

$ git hash-object test1.txt
3bb333e4f50b5bd51844c7a59a0f5b52ba993409

$ git add .
# 此时 .git/objects 里面会产生一个文件 .git/objects/3b/b333e4f50b5bd51844c7a59a0f5b52ba993409

$ git cat-file -t 3bb333e4f50b5bd51844c7a59a0f5b52ba993409
blob

$ git cat-file -p 3bb333e4f50b5bd51844c7a59a0f5b52ba993409
 þt e s t   g i t   a d d
```

>添加一个文件夹和文件，观察 GitDB。

```shell
$ mkdir test-dir

$ echo "test tree add" > test-tree.txt

$ git hash-object test-dir/test-tree.txt
9fad0267fc3a07507422f4b921c4780b500a53d5

$ git add .
# 此时 .git/objects 里面会产生一个文件 .git/objects/9f/ad0267fc3a07507422f4b921c4780b500a53d5

$ git cat-file -p 9fad0267fc3a07507422f4b921c4780b500a53d5
 þt e s t   t r e e   a d d

# 为啥没有生成 tree 文件，解压查看 .git/index 文件，文件名包含了文件路径，到提交的时候会生成 tree
$ git ls-files --stage
100644 9fad0267fc3a07507422f4b921c4780b500a53d5 0       test-dir/test-tree.txt
100644 3bb333e4f50b5bd51844c7a59a0f5b52ba993409 0       test1.txt
```

>提交内容，观察 GitDB

```shell
$ git commit -m "test-commit"
[master (root-commit) 014237f] test-commit
 2 files changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 test-dir/test-tree.txt
 create mode 100644 test1.txt
# 此时会产生对应的 tree 和 changeset 对象文件
```

>依次解压内容如下

```shell
# 此时会产生三个文件，对应的类型分别如下
commit  .git/objects/01/4237ff974856b594a18dc0710c63ed70c11ee1
tree    .git/objects/17/86de2cabadfcbfbb1ef9b72096d6776a64f207
tree    .git/objects/cc/eef7530fda0c16783241412793f6218b1edc6e

# commit 文件解压
$ git cat-file -p 014237ff974856b594a18dc0710c63ed70c11ee1
tree 1786de2cabadfcbfbb1ef9b72096d6776a64f207
author petterobam <1460300366@qq.com> 1606888742 +0800
committer petterobam <1460300366@qq.com> 1606888742 +0800

test-commit

# 查看类型
$ git cat-file -t 014237ff974856b594a18dc0710c63ed70c11ee1
commit

# 提交的 tree 文件解压
$ git cat-file -p 1786de2cabadfcbfbb1ef9b72096d6776a64f207
040000 tree cceef7530fda0c16783241412793f6218b1edc6e    test-dir
100644 blob 3bb333e4f50b5bd51844c7a59a0f5b52ba993409    test1.txt

# tree 下面的 tree 文件解压
$ git cat-file -p cceef7530fda0c16783241412793f6218b1edc6e
100644 blob 9fad0267fc3a07507422f4b921c4780b500a53d5    test-tree.txt
```

>删除文件 test1.txt 并添加文件 test2.txt

```shell
$ echo "test index see" > test2.txt
$ rm -rf test1.txt
$ git add .
$ git commit -m "delete test1 and add test2"
[master b543ac9] delete test1 and add test2
 2 files changed, 0 insertions(+), 0 deletions(-)
 delete mode 100644 test1.txt
 create mode 100644 test2.txt
# 发现产生了两个 object 文件
.git/objects/b5/43ac952ba32ad201f2e55d167d00dd450d1e66
.git/objects/84/04b2676456885b00f239be95674e9c4ff5550a
# 依次解压如下
$ git cat-file -p b543ac952ba32ad201f2e55d167d00dd450d1e66
tree 8404b2676456885b00f239be95674e9c4ff5550a
parent 014237ff974856b594a18dc0710c63ed70c11ee1
author petterobam <1460300366@qq.com> 1606921927 +0800
committer petterobam <1460300366@qq.com> 1606921927 +0800

delete test1 and add test2
------------------------------------
git cat-file -p 8404b2676456885b00f239be95674e9c4ff5550a
040000 tree cceef7530fda0c16783241412793f6218b1edc6e    test-dir
100644 blob 06224df7b6d1d861f213721fd8f1720771fda6ae    test2.txt
# 删除 text1.txt 并不会删除其对应的 blob 文件，而是生成一个新的 changeset 文件，changeset 文件指向一个新的 tree 文件
```

>再观察下 .git 下其他文件的情况

```shell
.git/logs/refs/heads/master
.git/logs/HEAD
.git/refs/heads/master
里面有一个最近一次 commit 产生 changeset 的 sha1
---------------------------
.git/COMMIT_EDITMSG
里面记录的是最近一次 commit 的 message

# 整个项目根目录如果有提交记录，也是一个 tree 文件
$ git cat-file -p 'master^{tree}'
040000 tree cceef7530fda0c16783241412793f6218b1edc6e    test-dir
100644 blob 3bb333e4f50b5bd51844c7a59a0f5b52ba993409    test1.txt
```

>自己尝试下，通过 GitDB 里面的文件，反查对应的文档

```shell

# 打开任何一个 git 项目在 .git/objects 里面随便找一个文件夹（xx）+ 文件（x{38}）
$ git cat-file -p xxx{38}
```

>to be continue ...

---

相关参考资料：
1. Pro Git 第二版：[英文版](https://git-scm.com/book/en/v2) # [中文版](https://git-scm.com/book/zh/v2) # [高亮版](https://gitee.com/progit/index.html) # [侧边菜单版](https://www.progit.cn/)
2. [改变世界的一次代码提交](https://hutusi.com/articles/the-greatest-git-commit)
3. [Git 源码·LinusTorvalds 第一次提交 CR 和启发](http://www.petterobam.cn/blog/2020/12/03/git-first-commit-code-review-and-think/)
