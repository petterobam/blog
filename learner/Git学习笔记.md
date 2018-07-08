Git学习笔记
===========

```git
git clone https://github.com/petterobam/my-sqlite.git
cd my-sqlite/
git status
git add .
git status
git commit -m "提交备注"
git pull
git push
git config --global credential.helper store
push你的代码 (git push), 这时会让你输入用户名和密码, 这一步输入的用户名密码会被记住, 下次再push代码时就不用输入用户名密码!这一步会在用户目录下生成文件.git-credential记录用户名密码的信息

git init
git remote add origin git@github.com:petterobam/database-oop.git
补充提交
git commit -m 'initial commit'
git add forgotten_file
git commit --amend

撤销add 所有
git reset HEAD
git reset HEAD 文件名
```

## 设置全局用户
```git
$ git config --global user.name "John Doe"
$ git config --global user.email johndoe@example.com
```

## 自定义全局编辑器
```git
$ git config --global core.editor emacs
```

## 查看git配置信息
```git
$ git config --list
user.name=John Doe
user.email=johndoe@example.com
color.status=auto
color.branch=auto
color.interactive=auto
color.diff=auto
...
```

## 检查git某一项配置
```git
$ git config user.name
John Doe
```

## 获取命令帮助说明
```git line-numbers
$ git help <verb>
$ git <verb> --help
$ man git-<verb>
```

```git
$ git help config
```

## 已有项目中初始化仓库
```git
$ git init
```

## 添加提交
```git
$ git add *.c
$ git add LICENSE
$ git commit -m 'initial project version'
```

## 克隆现有项目
```git
$ git clone https://github.com/libgit2/libgit2
$ git clone user@server:path/to/repo.git
```

## 检查当前文件状态
```git
$ git status
On branch master
nothing to commit, working directory clean
```

```git
$ git status
On branch master
Untracked files:
  (use "git add <file>..." to include in what will be committed)

    README.md

nothing added to commit but untracked files present (use "git add" to track)
```

```git
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

    new file:   README.md
```

## 状态概览
```git
$ git status -s
 M README
MM Rakefile
A  lib/git.rb
M  lib/simplegit.rb
?? LICENSE.txt
```

## 查看改变的部分
```git
$ git diff
diff --git a/CONTRIBUTING.md b/CONTRIBUTING.md
index 8ebb991..643e24f 100644
--- a/CONTRIBUTING.md
+++ b/CONTRIBUTING.md
@@ -65,7 +65,8 @@ branch directly, things can get messy.
 Please include a nice description of your changes when you submit your PR;
 if we have to read the whole diff to figure out why you're contributing
 in the first place, you're less likely to get feedback and have your change
-merged in.
+merged in. Also, split your changes into comprehensive chunks if your patch is
+longer than a dozen lines.

 If you are starting to work on a particular area, feel free to submit a PR
 that highlights your work in progress (and note in the PR title that it's
```

## list查看改变的部分

```git
$ git diff --cached
diff --git a/CONTRIBUTING.md b/CONTRIBUTING.md
index 8ebb991..643e24f 100644
--- a/CONTRIBUTING.md
+++ b/CONTRIBUTING.md
@@ -65,7 +65,8 @@ branch directly, things can get messy.
 Please include a nice description of your changes when you submit your PR;
 if we have to read the whole diff to figure out why you're contributing
 in the first place, you're less likely to get feedback and have your change
-merged in.
+merged in. Also, split your changes into comprehensive chunks if your patch is
+longer than a dozen lines.

 If you are starting to work on a particular area, feel free to submit a PR
 that highlights your work in progress (and note in the PR title that it's

	- 高版本list查看改变的部分
	$ git diff --staged
	diff --git a/README b/README
	new file mode 100644
	index 0000000..03902a1
	--- /dev/null
	+++ b/README
	@@ -0,0 +1 @@
	+My Project
```

## 代码提交
```git
$ git commit
```

## 提交带上备注
```git
$ git commit -m "Story 182: Fix benchmarks for speed"
```

## 直接提交(含git add)
```git
跳过缓存区，不用git add命令，直接提交
$ git commit -a -m 'added new benchmarks'
```

## 将文件移出版本管理
```git
$ git rm README.md
$ git rm --cached README.md
$ git rm log/\*.log
```

## 移动文件，重命名某个文件
```git
$ git mv file_from file_to
```

## 查看提交日志
```git
$ git log
commit ca82a6dff817ec66f44342007202690a93763949
Author: Scott Chacon <schacon@gee-mail.com>
Date:   Mon Mar 17 21:52:11 2008 -0700

    changed the version number

commit 085bb3bcb608e1e8451d4b2432f8ecbe6306e7e7
Author: Scott Chacon <schacon@gee-mail.com>
Date:   Sat Mar 15 16:40:33 2008 -0700

    removed unnecessary test

commit a11bef06a3f659402fe7563abf99ad00de2209e6
Author: Scott Chacon <schacon@gee-mail.com>
Date:   Sat Mar 15 10:31:28 2008 -0700

    first commit
```

## 显示详细提交记录数量

```git
$ git log -p -2
commit ca82a6dff817ec66f44342007202690a93763949
Author: Scott Chacon <schacon@gee-mail.com>
Date:   Mon Mar 17 21:52:11 2008 -0700

    changed the version number

diff --git a/Rakefile b/Rakefile
index a874b73..8f94139 100644
--- a/Rakefile
+++ b/Rakefile
@@ -5,7 +5,7 @@ require 'rake/gempackagetask'
 spec = Gem::Specification.new do |s|
     s.platform  =   Gem::Platform::RUBY
     s.name      =   "simplegit"
-    s.version   =   "0.1.0"
+    s.version   =   "0.1.1"
     s.author    =   "Scott Chacon"
     s.email     =   "schacon@gee-mail.com"
     s.summary   =   "A simple gem for using Git in Ruby code."

commit 085bb3bcb608e1e8451d4b2432f8ecbe6306e7e7
Author: Scott Chacon <schacon@gee-mail.com>
Date:   Sat Mar 15 16:40:33 2008 -0700

    removed unnecessary test

diff --git a/lib/simplegit.rb b/lib/simplegit.rb
index a0a60ae..47c6340 100644
--- a/lib/simplegit.rb
+++ b/lib/simplegit.rb
@@ -18,8 +18,3 @@ class SimpleGit
     end

 end
-
-if $0 == __FILE__
-  git = SimpleGit.new
-  puts git.show
-end
```

## 提交日志统计信息
```git
$ git log --stat
commit ca82a6dff817ec66f44342007202690a93763949
Author: Scott Chacon <schacon@gee-mail.com>
Date:   Mon Mar 17 21:52:11 2008 -0700

    changed the version number

 Rakefile | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

commit 085bb3bcb608e1e8451d4b2432f8ecbe6306e7e7
Author: Scott Chacon <schacon@gee-mail.com>
Date:   Sat Mar 15 16:40:33 2008 -0700

    removed unnecessary test

 lib/simplegit.rb | 5 -----
 1 file changed, 5 deletions(-)

commit a11bef06a3f659402fe7563abf99ad00de2209e6
Author: Scott Chacon <schacon@gee-mail.com>
Date:   Sat Mar 15 10:31:28 2008 -0700

    first commit

 README           |  6 ++++++
 Rakefile         | 23 +++++++++++++++++++++++
 lib/simplegit.rb | 25 +++++++++++++++++++++++++
 3 files changed, 54 insertions(+)
```

## 提交日志每次记录一行展示
```git
$ git log --pretty=oneline
ca82a6dff817ec66f44342007202690a93763949 changed the version number
085bb3bcb608e1e8451d4b2432f8ecbe6306e7e7 removed unnecessary test
a11bef06a3f659402fe7563abf99ad00de2209e6 first commit
```

## 定义日志浏览输出格式
```git
$ git log --pretty=format:"%h - %an, %ar : %s"
ca82a6d - Scott Chacon, 6 years ago : changed the version number
085bb3b - Scott Chacon, 6 years ago : removed unnecessary test
a11bef0 - Scott Chacon, 6 years ago : first commit
-------------------------------------------------
%H	提交对象（commit）的完整哈希字串
%h	提交对象的简短哈希字串
%T	树对象（tree）的完整哈希字串
%t	树对象的简短哈希字串
%P	父对象（parent）的完整哈希字串
%p	父对象的简短哈希字串
%an	作者（author）的名字
%ae	作者的电子邮件地址
%ad	作者修订日期（可以用 --date= 选项定制格式）
%ar	作者修订日期，按多久以前的方式显示
%cn	提交者（committer）的名字
%ce	提交者的电子邮件地址
%cd	提交日期提交日期
%cr	提交日期，按多久以前的方式显示
%s	提交说明
-------------------------------------------------
```

## 日志浏览截止时间或范围
```git
$ git log --since=2.weeks
```

## 日志浏览根据作者筛选
```git
$ git log --author=bob
```

```git line-numbers
-------------------------------------------------
-(n)	仅显示最近的 n 条提交
--since, --after	仅显示指定时间之后的提交。
--until, --before	仅显示指定时间之前的提交。
--author	仅显示指定作者相关的提交。
--committer	仅显示指定提交者相关的提交。
--grep	仅显示含指定关键字的提交
-S	仅显示添加或移除了某个关键字的提交
-------------------------------------------------
```

## 尝试重提
```git
尝试重提上一个还未push的提交
$ git commit --amend
然后可以git add或git commit 重新写注释
```

## 撤销git add
```git
$ git reset HEAD CONTRIBUTING.md
```

## 还原某个文件到上一个版本
```git
$ git checkout -- CONTRIBUTING.md
```

## 查看远程仓库信息
```git
$ git clone https://github.com/schacon/ticgit
$ cd ticgit
$ git remote -v
origin    git@github.com:mojombo/grit.git (fetch)
origin    git@github.com:mojombo/grit.git (push)
```

## 添加远程仓库版本
```git
$ git remote add pb https://github.com/paulboone/ticgit
$ git remote -v
origin	https://github.com/schacon/ticgit (fetch)
origin	https://github.com/schacon/ticgit (push)
pb	https://github.com/paulboone/ticgit (fetch)
pb	https://github.com/paulboone/ticgit (push)
```

## 拉取分支但本地没有的信息
```git
$ git fetch pb
remote: Counting objects: 43, done.
remote: Compressing objects: 100% (36/36), done.
remote: Total 43 (delta 10), reused 31 (delta 5)
Unpacking objects: 100% (43/43), done.
From https://github.com/paulboone/ticgit
 * [new branch]      master     -> pb/master
 * [new branch]      ticgit     -> pb/ticgit
```

## 将内容提交到远程仓库
```git
git push [remote-name] [branch-name]
$ git push origin master
```

## 查看远程仓库
```git
$ git remote show origin
$ git remote show origin
* remote origin
  Fetch URL: https://github.com/schacon/ticgit
  Push  URL: https://github.com/schacon/ticgit
  HEAD branch: master
  Remote branches:
    master                               tracked
    dev-branch                           tracked
  Local branch configured for 'git pull':
    master merges with remote master
  Local ref configured for 'git push':
    master pushes to master (up to date)
```

## 远程仓库重命名
```git
$ git remote rename pb paul
$ git remote
origin
paul
```

## 远程仓库删除
```git
$ git remote rm paul
$ git remote
origin
```

## 列出已有标签
```git
$ git tag
v0.1
v1.3

$ git tag -l 'v1.8.5*'
v1.8.5
v1.8.5-rc0
v1.8.5-rc1
v1.8.5-rc2
v1.8.5-rc3
v1.8.5.1
v1.8.5.2
v1.8.5.3
v1.8.5.4
v1.8.5.5
```

## 创建附注标签
```git
$ git tag -a v1.4 -m 'my version 1.4'
$ git tag
v0.1
v1.3
v1.4
```

```git
$ git show v1.4
tag v1.4
Tagger: Ben Straub <ben@straub.cc>
Date:   Sat May 3 20:19:12 2014 -0700

my version 1.4

commit ca82a6dff817ec66f44342007202690a93763949
Author: Scott Chacon <schacon@gee-mail.com>
Date:   Mon Mar 17 21:52:11 2008 -0700

    changed the version number
```

## 创建轻量标签
```git
$ git tag v1.4-lw
$ git tag
v0.1
v1.3
v1.4
v1.4-lw
v1.5
```

```git
$ git show v1.4-lw
commit ca82a6dff817ec66f44342007202690a93763949
Author: Scott Chacon <schacon@gee-mail.com>
Date:   Mon Mar 17 21:52:11 2008 -0700

    changed the version number
```

## 给某次提交记录打标签
```git
$ git tag -a v1.2 9fceb02
$ git show v1.2
tag v1.2
Tagger: Scott Chacon <schacon@gee-mail.com>
Date:   Mon Feb 9 15:32:16 2009 -0800

version 1.2
commit 9fceb02d0ae598e95dc970b74767f19372d61af8
Author: Magnus Chacon <mchacon@gee-mail.com>
Date:   Sun Apr 27 20:43:35 2008 -0700

    updated rakefile
...
```

## 共享标签到远程仓库
```git
$ git push origin v1.5
```

```git
$ git push origin --tags
```

## 检出标签
```git
git checkout -b [branchname] [tagname]
$ git checkout -b version2 v2.0.0
Switched to a new branch 'version2'
```

## 为git命令设置别名
```git
$ git config --global alias.co checkout
$ git config --global alias.br branch
$ git config --global alias.ci commit
$ git config --global alias.st status

$ git config --global alias.unstage 'reset HEAD --'
$ git unstage fileA
等同于 git reset HEAD -- fileA

$ git config --global alias.last 'log -1 HEAD'
$ git last
commit 66938dae3329c7aebe598c2246a8e6af90d04646
Author: Josh Goebel <dreamer3@example.com>
Date:   Tue Aug 26 19:48:51 2008 +0800

    test for current head

    Signed-off-by: Scott Chacon <schacon@example.com>

$ git config --global alias.visual '!gitk'
git config --global gui.encoding utf-8
```

## 切换分支
```git
$ git checkout [barcher-name]
```

## 在某个问题上建立一个分支
```git
比如：问题##53
$ git checkout -b iss53
或者
$ git branch iss53
$ git checkout iss53

比如有个紧急问题分支，先切换到紧急分支
$ git checkout -b hotfix
```

## 将紧急分支merge到主干
```git
$ git checkout master
$ git merge hotfix
```

## 紧急分支切换回来继续工作
```git
解决问题后删除紧急分支，然后切换回来继续解决原来问题
$ git branch -d hotfix
$ git checkout iss53
$ git checkout master
Switched to branch 'master'
$ git merge iss53
Merge made by the 'recursive' strategy.
index.html |    1 +
1 file changed, 1 insertion(+)
$ git branch -d iss53
```

## merge冲突解决
```git
图形化界面
$ git mergetool
```

## 分支管理
```git
$ git branch
  iss53
* master
  testing

$ git branch -v
  iss53   93b412c fix javascript issue
* master  7a98805 Merge branch 'iss53'
  testing 782fd34 add scott to the author list in the readmes

$ git branch --merged
查看合并过的分支
在这个列表中分支名字前没有 * 号的分支通常可以使用 git branch -d 删除掉

$ git branch --no-merged
查看未合并过的分支
```

## 远程分支
```git
“origin” 并无特殊含义
远程仓库名字 “origin” 与分支名字 “master” 一样，在 Git 中并没有任何特别的含义一样。 同时 “master” 是当你运行 git init 时默认的起始分支名字，原因仅仅是它的广泛使用，“origin” 是当你运行 git clone 时默认的远程仓库名字。 如果你运行 git clone -o booyah，那么你默认的远程分支名字将会是 booyah/master。

$ git push origin serverfix
将分支推送到远程仓库

$ git fetch origin
remote: Counting objects: 7, done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 0), reused 3 (delta 0)
Unpacking objects: 100% (3/3), done.
From https://github.com/schacon/simplegit
 * [new branch]      serverfix    -> origin/serverfix

可以运行 git merge origin/serverfix 将这些工作合并到当前所在的分支。 如果想要在自己的 serverfix 分支上工作，可以将其建立在远程跟踪分支之上：
$ git checkout -b serverfix origin/serverfix
```

## 跟踪分支
```git
$ git checkout --track origin/serverfix
如果想要将本地分支与远程分支设置为不同名字，你可以轻松地增加一个不同名字的本地分支的上一个命令：
$ git checkout -b sf origin/serverfix
```

## 拉取分支
```git
git pull 的魔法经常令人困惑所以通常单独显式地使用 fetch 与 merge
```

## 删除远程分支
```git
假设你已经通过远程分支做完所有的工作了 - 也就是说你和你的协作者已经完成了一个特性并且将其合并到了远程仓库的 master 分支（或任何其他稳定代码分支）。 可以运行带有 --delete 选项的 git push 命令来删除一个远程分支。 如果想要从服务器上删除 serverfix 分支，运行下面的命令：
$ git push origin --delete serverfix
```

## 变基
```git
你可以使用 rebase 命令将提交到某一分支上的所有修改都移至另一分支上，就好像“重新播放”一样。

$ git checkout experiment
$ git rebase master

快进合并 master 分支，使之包含来自 client 分支的修改
$ git rebase master server

变基的风险
呃，奇妙的变基也并非完美无缺，要用它得遵守一条准则：
不要对在你的仓库外有副本的分支执行变基。
```

## 官方文档

https://git-scm.com/book/zh/v2
