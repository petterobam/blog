---
layout: post
title: "Tale 博客部署"
description: "Tale 博客搭建过程分享"
categories: [框架，CentOs]
tags: [博客，搭建，CentOs,Tale]
redirect_from:
  - /2017/09/10/
utterances:
  issue_number: "1" 
---

## @首先你要有

服务器（我的是 CentOs，在 [搬瓦工](https://bwh1.net/) 上买的国外服务器）、电脑、浏览器、WIFI、远程连接工具（我用的是 SecureCRT）

## 安装 jdk1.8
	
```
// 查看可用的 jdk
$ yum search java | grep -i jdk  
	
ldapjdk-javadoc.x86_64 : Javadoc for ldapjdk
icedtea-web.x86_64 : Additional Java components for OpenJDK - Java browser
java-1.6.0-openjdk.x86_64 : OpenJDK Runtime Environment
java-1.6.0-openjdk-demo.x86_64 : OpenJDK Demos
java-1.6.0-openjdk-devel.x86_64 : OpenJDK Development Environment
java-1.6.0-openjdk-javadoc.x86_64 : OpenJDK API Documentation
java-1.6.0-openjdk-src.x86_64 : OpenJDK Source Bundle
java-1.7.0-openjdk.x86_64 : OpenJDK Runtime Environment
java-1.7.0-openjdk-demo.x86_64 : OpenJDK Demos
java-1.7.0-openjdk-devel.x86_64 : OpenJDK Development Environment
java-1.7.0-openjdk-javadoc.noarch : OpenJDK API Documentation
java-1.7.0-openjdk-src.x86_64 : OpenJDK Source Bundle
java-1.8.0-openjdk.x86_64 : OpenJDK Runtime Environment
java-1.8.0-openjdk-debug.x86_64 : OpenJDK Runtime Environment with full debug on
java-1.8.0-openjdk-demo.x86_64 : OpenJDK Demos
java-1.8.0-openjdk-demo-debug.x86_64 : OpenJDK Demos with full debug on
java-1.8.0-openjdk-devel.x86_64 : OpenJDK Development Environment
java-1.8.0-openjdk-devel-debug.x86_64 : OpenJDK Development Environment with
java-1.8.0-openjdk-headless.x86_64 : OpenJDK Runtime Environment
java-1.8.0-openjdk-headless-debug.x86_64 : OpenJDK Runtime Environment with full
java-1.8.0-openjdk-javadoc.noarch : OpenJDK API Documentation
java-1.8.0-openjdk-javadoc-debug.noarch : OpenJDK API Documentation for packages
java-1.8.0-openjdk-src.x86_64 : OpenJDK Source Bundle
java-1.8.0-openjdk-src-debug.x86_64 : OpenJDK Source Bundle for packages with
ldapjdk.x86_64 : The Mozilla LDAP Java SDK

//安装 jdk1.8
$ yum install java-1.8.0-openjdk.x86_64 
```
## iptables 永久打开新端口

1. CentOS/RHEL 7
		
```
//tale 默认是 9000，我们需要开放 9000 端口
sudo firewall-cmd --zone=public --add-port=9000/tcp --permanent
sudo firewall-cmd --zone=public --add-port=80/tcp --permanent
sudo firewall-cmd --reload 
```
2. CentOS/RHEL 6

```
//tale 默认是 9000，我们需要开放 9000 端口
sudo iptables -I INPUT -p tcp -m tcp --dport 9000 -j ACCEPT
sudo iptables -I INPUT -p tcp -m tcp --dport 80 -j ACCEPT
sudo service iptables save 
```
3. 查看打开的端口：

```
/etc/init.d/iptables status
```
## ngix 安装配置

1. 下载

```
wget http://nginx.org/packages/centos/6/noarch/RPMS/nginx-release-centos-6-0.el6.ngx.noarch.rpm
```
2. nginx 开启对外映射共享

```
// 安装源库
chmod +x nginx-release-centos-6-0.el6.ngx.noarch.rpm 
// 解压
rpm -i nginx-release-centos-6-0.el6.ngx.noarch.rpm 
// 安装 nginx
yum install nginx
// 启动 nginx
service nginx start
```
3. 简单说明

   - 默认 nginx 配置文件：`/etc/nginx/nginx.conf`         【nginx 主要的配置文件】 
   - 默认 nginx 的 ssl 配置文件：`/etc/nginx/conf.d/ssl.conf` 【配置 SSL 证书的，也可以并入到 nginx.conf 文件里】 
   - 默认 nginx 的虚拟主机配置文件：`/etc/nginx/conf.d/virtual.conf` 【如同 Apache 的虚拟主机配置，也可以并入到 nginx.conf 文件里】 
   - 默认的 web_root 文件夹路径：`/usr/share/nginx/html` 【web 目录夹，放置 Magento 主程序】 

4. 将你的 web 程序文件夹 放到 `/usr/share/nginx/html` 下

## 在线下载安装 tale

1. 下载
	```
	// 请到 nginx 的 html 目录下下载
	sudo wget http://7xls9k.dl1.z0.glb.clouddn.com/tale.zip
	```
2. 解压
	```
	unzip tale.zip
	```
3. 启动
	```
	// 进入 tale 网站的 bin 目录下
	cd tale/bin
	// 脚本执行授权
	chmod 755 tale.sh
	// 启动
	sh tale.sh start
	// 默认的启动 JVM 参数为 -Xms128m -Xmx128m 如果你想修改内存配置可以这样 
	sh tale.sh start "-Xms512m -Xmx512m
	// 关闭博客程序
	sh tale.sh stop
	// 查看日志
	sh tale.sh log
	// 查看启动状态
	sh tale.sh status
	```
## 绑定域名

通过 IP: 端口号，tale 默认是 9000，访问可以的话，可以去阿里云或其他网站上买个域名，配置好 DNS 解析，就可以通过域名访问，9000 端口不像 80 是默认端口，在域名后面带个端口比较难看，可以将 tale 的端口改为 80
		
```
// 进入配置文件夹
cd tale/resources
// 修改应用配置文件
vi app.properties
//最加一行
server.port=9001
cd tale/bin
// 关闭博客程序
sh tale.sh stop
// 启动
sh tale.sh start
```
你会发现无法启动，因为 80 端口被占用了 sh /usr/local/webserver/nginx/html/tale/bin/tale.sh start

```
Exception in thread "main" com.blade.exception.EmbedServerException: java.net.BindException: Address already in use
		at com.blade.embedd.EmbedJettyServer.startup(EmbedJettyServer.java:170)
		at com.blade.embedd.EmbedJettyServer.startup(EmbedJettyServer.java:74)
		at com.blade.Blade.startNoJoin(Blade.java:499)
		at com.blade.Blade.start(Blade.java:472)
		at com.blade.Blade.start(Blade.java:478)
		at com.tale.Application.main(Application.java:11)
Caused by: java.net.BindException: Address already in use
		at sun.nio.ch.Net.bind0(Native Method)
		at sun.nio.ch.Net.bind(Net.java:433)
		at sun.nio.ch.Net.bind(Net.java:425)
		at sun.nio.ch.ServerSocketChannelImpl.bind(ServerSocketChannelImpl.java:223)
		at sun.nio.ch.ServerSocketAdaptor.bind(ServerSocketAdaptor.java:74)
		at org.eclipse.jetty.server.ServerConnector.open(ServerConnector.java:298)
		at org.eclipse.jetty.server.AbstractNetworkConnector.doStart(AbstractNetworkConnector.java:80)
		at org.eclipse.jetty.server.ServerConnector.doStart(ServerConnector.java:236)
		at org.eclipse.jetty.util.component.AbstractLifeCycle.start(AbstractLifeCycle.java:68)
		at org.eclipse.jetty.server.Server.doStart(Server.java:431)
		at org.eclipse.jetty.util.component.AbstractLifeCycle.start(AbstractLifeCycle.java:68)
		at com.blade.embedd.EmbedJettyServer.startup(EmbedJettyServer.java:166)
		... 5 more
```
需要修改 nginx 的默认配置，将 nginx 端口改成其他的

```
// 修改 nginx 的默认配置
vi /etc/nginx/conf.d/default.conf
// 将 listen 改成其他，例如 i
server {
	listen       81;
	server_name  localhost;
	……
}
// 退出保存，重启 nginx
nginx -s reload
```
然后在重启 tale，就可以了
