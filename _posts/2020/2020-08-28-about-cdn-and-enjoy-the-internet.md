---
layout: post
title: "公网 CDN 污染如何愉快上网冲浪"
description: "公网 CDN 污染如何愉快上网冲浪"
categories: [整理，CDN,DNS]
tags: [CDN,DNS]
redirect_from:
  - /2020/08/28/
---

# 关于公网 CDN 污染

CDN 的全称是 Content Delivery Network，即内容分发网络。CDN 是构建在网络之上的内容分发网络，依靠部署在各地的边缘服务器，通过中心平台的负载均衡、内容分发、调度等，域名提供商可以提供许多免费的 DNS 解析服务，并且其解析速度非常快，多组 DNS 服务器，保证这些资源的快速访问。

然鹅，公网的环境 CDN 混乱，一些刻意制造或无意中制造出来的域名服务器分组，把域名指往不正确的 IP 地址，又可能路径特别长或错误导致对应网站访问超时或出错，这种现象定义为 DNS 污染。

某些网络运营商为了某些目的，对 DNS 进行了某些操作，导致使用 ISP 的正常上网设置无法通过域名取得正确的 IP 地址。

某些国家或地区为出于某些目的防止某网站被访问，而且其又掌握部分国际 DNS 根目录服务器或镜像，也可以利用此方法进行屏蔽。

这和某些运营商利用 DNS 劫持域名发些小广告不同，DNS 污染则让域名直接无法访问了

如何查看 DNS 污染？经收集整理归纳以下三点：

点“开始”-“运行”-输入 CMD，再输入 ipconfig /all ，在下“DNS SERVER”里找到你使用的 DNS 服务器地址。

再输入 `nslookup （要检测的域名）` 你的 DNS 服务器 IP ，来查看是否能解析。

再输入 `nslookup （要检测的域名） 8.8.8.8` 使用 Google 的 DNS 服务器验证。  

# 提速解决

方法一：

1. 百度搜索 [站长工具 ping 检测](https://www.baidu.com/s?tn=02003390_hao_pg&ie=utf-8&wd=%E7%AB%99%E9%95%BF%E5%B7%A5%E5%85%B7%20ping%E6%A3%80%E6%B5%8B)，选择一个站长工具，比如：http://ping.chinaz.com
2. 输入你访问的慢的域名，比如我们下载 idea 插件的地址：plugins.jetbrains.com
    ![Ping-Test.png](/images/dns-host/Ping-Test.png) 
3. 找一个最快的 ip 配置到本地的 DNS 里面，推荐使用 [SwitchHosts](https://oldj.github.io/SwitchHosts/) 工具方便下载
    ![SwitchHosts.png](/images/dns-host/SwitchHosts.png)
4. 然后可以愉快的冲浪了

方法二：

使用 [DNS Jumper](https://www.sordum.org/7952/dns-jumper-v2-2/) >> [介绍参考](https://www.zhihu.com/question/32229915/answer/112085467)

![DNS-Jumper.png](/images/dns-host/DNS-Jumper.png)

# 愉快的浏览 Github

Github 是个综合网站，代码库、个人信息、搜索索引、图片等都在不同的域名，国内访问特别卡顿，需要配置下比较快速的 DNS 才能保证体验。

![Github-Host.png](/images/dns-host/Github-Host.png)

幸好有人长期维护这些域名 DNS，所以打开 SwitchHosts，添加 [远程订阅] host：https://raw.githubusercontent.com/521xueweihan/GitHub520/master/hosts

![Github-Remote-Host.png](/images/dns-host/Github-Remote-Host.png)

# CDN 其他探索参考

1. CDN 劫持
2. CDN 原理
3. CDN 高并发
4. CDN 攻防
