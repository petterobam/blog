Github个人博客部署
==================

## 安装ruby

下载地址：https://rubyinstaller.org/downloads

![ruby下载](github-blog/1.png)

Ruby安装完，cmd命令
```
ruby -v
gem -v
```

![DevKit下载](github-blog/2.png)

DevKit-mingw64-64-4.7.2-20130224-1432-sfx.exe运行，解压目录如下

![DevKit解压](github-blog/3.png)

## 安装 msys2

下载地址：http://sourceforge.net/projects/msys2

## 安装 jeky、bundler

```
gem install jekyll bundler
```

如果出错，尝试 ```gem install jekyll -v 3.3``` 或 ```gem update```

## 新建jekyll博客

```
jekyll new my-blog
```

```
cd my-blog
```

删除默认md文件、Gemfile.lock和_XX目录

## 采用主题

https://github.com/yizeng/jekyll-theme-simple-texture/tree/master/starter-kit
下载该主题，并覆盖my-blog下面的文件

将你的markdown文件放置于 ```_post``` 文件夹下面，可以自己创建文件夹给markdown分类

![markdown文件目录](github-blog/4.png)

文件名命名：日期-文件名（最好是英文的名字）

![markdown文件](github-blog/5.png)

因为这个关系到每个博客的http路径，带中文容易出问题

![http路径](github-blog/6.png)

命令行下：```bundle install```

命令行下：```bundle exec jekyll serve```

![命令截图](github-blog/7.png)

然后打开 http://localhost:4000/

![预览](github-blog/8.png)

![预览](github-blog/9.png)

![预览](github-blog/10.png)

其中 ```_config.yml``` 和 ```_data``` 文件夹下面的yml文件控制着页面一些元素的文本显示

![配置](github-blog/11.png)

![配置](github-blog/12.png)

## 推送到github

摸索实验就可以发现修改界面的规律，在本地调好后就可以将 my-blog下面的文件推到github

![推送到github](github-blog/13.png)

## 域名绑定

开启github page ， 并绑定你的域名

![绑定域名](github-blog/14.png)

然后，在阿里云或其他域名解析处添加 A记录 和 @记录，指定的IP可以ping下自己github.io的IP。

![获取IP](github-blog/15.png)

然后访问 www.petterobam.cn   ，OK

![预览测试](github-blog/16.png)

## 额外情况

https://github.com/jekyller/jasper2
如果是非标准的jekyll主题，还需要travis-ci辅助编译，并将静态页面发布到 对应github项目的 gh-pages 分支

具体细节需要注意的有：

1. 到你的github 获取 GH-TOKEN
https://github.com/settings/tokens
为公共仓库启用“public_repo”访问权限
然后记住他展示的TOKEN，因为那个只显示一次

![GH-TOKEN获取](github-blog/17.png)


2. Travis-ci 需要添加额外属性，主要包括GH-TOKEN、GIT_NAME、GIT_EMAIL，例如：

![Travis-ci配置](github-blog/18.png)

3. [可选]在你的电脑上安装travis，并生成travis-encrypt

```
gem install travis
travis encrypt <api-token>
```

其中 ```<api-token>``` 就是你在travis定义的额外属性，形如：

```
'GIT_NAME="YOUR_USERNAME" GIT_EMAIL="YOUR_EMAIL" GH_TOKEN=YOUR_TOKEN'
```

然后这个 ```travis-encrypt``` 用在 ```.travis.yml``` 文件中，形如：

![Travis-ci配置](github-blog/19.png)

4. 更多详细信息请参见 jekyll-travis：https://github.com/mfenner/jekyll-travis

额外情况博客部署效果图

![额外情况博客部署效果图](github-blog/20.png)

## 集成博客评论系统
基于 ```github issue```
https://github.com/settings/applications/new

申请OAuth application

![申请OAuth](github-blog/21.png)

## 让域名支持HTTPS

这个东西不强求，但是会在浏览器地址栏有个绿色的小锁（逼格.png）

https://jingyan.baidu.com/article/f79b7cb3309be79144023ea4.html

或者用 cloudflare 加持 https：https://www.cloudflare.com/
