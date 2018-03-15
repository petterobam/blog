---
layout: post
title: "CentOS自动发邮件"
description: "CentOS自动发邮件操作分享"
categories: [邮件,CentOs]
tags: [CentOs,maillx,定时任务,邮件]
redirect_from:
  - /2017/09/17/
---

## 应用场景

我们组有十几个人，安排了值日倒垃圾的表，但是总是有人会忘记，然后产品经理就将这个东西与个人绩效挂钩，少一次扣一分，这里用我的服务器把值日表里内容对应的人每天定时给他发邮件提醒。

## 配置mail

### 查看mail是否已安装

	[root@host ~]# mail
	-bash: mail: command not found
	[root@host ~]# witch mail
	-bash: witch: command not found
	[root@host ~]# which mail
	/usr/bin/which: no mail in (/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin:/root/bin)

### 不存在，安装

	[root@host ~]# yum install mail
		
### 配置mail

1. 查看mail配置

		[root@host ~]# mail
		No mail for root
		[root@host ~]# which mail
		/bin/mail

2. 没有配置账号

		[root@host etc]# vi mail.rc
		// 把这段加进去
		set from=账号 
		set smtp=邮件服务器地址
		set smtp-auth-user=账号 
		set smtp-auth-password=密码 
		set smtp-auth=login

我用的是网易邮箱，对外的服务器地址有这些

![网易邮箱服务器信息](/images/centos-auto-mail/mail-service-info.png)

对了，这个密码需要邮箱的授权码，不是登录密码。

=_= 醉了，我的网易邮箱不能开启stmp服务，改用qq邮箱，stmp服务器是smtp.qq.com。

## 配置sendmail

### 安装sendmail

	yum install -y sendmail

### 配置sendmail

	sendmail -bd –q12h

 * -b：设定Sendmail服务运行于后台。
 * -d：指定Sendmail以Daemon（守护进程）方式运行。
 * -q：设定当Sendmail无法成功发送邮件时，就将邮件保存在队列里，并指定保存时间。上面的12h表示保留12小时。

此外，要检测Sendmail服务器是否正常运行，可以使用命令行：

	/etc/rc.d/init.d/sendmail status

### 配置Senmail的SMTP认证

	vi /etc/mail/sendmail.mc

esc,查找`/TRUST_AUTH_MECH`，去掉这两行

	dnl TRUST_AUTH_MECH(`EXTERNAL DIGEST-MD5 CRAM-MD5 LOGIN PLAIN')dnl
	dnl define(`confAUTH_MECHANISMS', `EXTERNAL GSSAPI DIGEST-MD5 CRAM-MD5 LOGIN PLAIN')dnl

### 网络访问权限

esc，查找`/DAEMON_OPTIONS`，改为任意网段可访问

	DAEMON_OPTIONS(`Port=smtp,Addr=0.0.0.0, Name=MTA')dnl
	
### 生成配置文件

	[root#host ~]#m4 /etc/mail/sendmail.mc > /etc/mail/sendmail.cf
	m4:/etc/mail/sendmail.mc:10: cannot open `/usr/share/sendmail-cf/m4/cf.m4': No such file or directory

需要安装sendmail-cf

	yum install sendmail-cf

### 重启sendmail
	
	/etc/init.d/sendmail restart

## 测试邮件发送
		
	[root@host ~]# echo '文本内容！' | mail -s "标题" 1460300366@qq.com
 	smtp-server: 530 Error: A secure connection is requiered(such as ssl).......

### 忽略ssl验证
	
修改添加参数

	vi /etc/mail.rc
	// 追加
	set smtp-use-starttls
	set ssl-verify=ignore
	set nss-config-dir=/etc/pki/nssdb/

再试

	[root@host ~]# echo '文本内容！' | mail -s "标题" 1460300366@qq.com
	Error in certificate: Peer's certificate issuer is not recognized.

### 需要证书

	mkdir -p /root/.certs/
	echo -n | openssl s_client -connect smtp.qq.com:465 | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > ~/.certs/qq.crt
	certutil -A -n "GeoTrust SSL CA" -t "C,," -d ~/.certs -i ~/.certs/qq.crt
	certutil -A -n "GeoTrust Global CA" -t "C,," -d ~/.certs -i ~/.certs/qq.crt
	certutil -L -d /root/.certs
	vi /etc/mail.rc
	set nss-config-dir=/root/.certs

再试

	[root@host share]# echo '文本内容！' | mail -s "标题" 1460300366@qq.com
	Error in certificate: Peer's certificate issuer is not recognized.

虽然**证书报错**没有验证，但是我收到了邮件，然后就是内容**中文乱码**。

证书报错可以这样解决

	cd /root/.certs
	certutil -A -n "GeoTrust SSL CA - G3" -t "Pu,Pu,Pu"  -d ./ -i qq.crt 

中文乱码这样解决

	1）查看支持的字符集是否有GBK
	[root@host ~]# locale -a
	2) 安装英文版默认的字符集配置为：
	[root@host ~]# cat /etc/sysconfig/i18n
	LANG="en_US.UTF-8"
	SYSFONT="latarcyrheb-sun16"
	3) 修改为中文字符集:
	[root@host ~]# vi /etc/sysconfig/i18n
	LANG="zh_CN.GBK"
	SUPPORTED="zh_CN.UTF-8:zh_CN:zh"
	SYSFONT="latarcyrheb-sun16"
	4) 执行如下命令或者重启即可生效。
	[root@host ~]# source /etc/sysconfig/i18n

![发送成功！](/images/centos-auto-mail/success-mail-qq.png)

## 脚本定时发送

### 发送邮件的脚本

新建一个脚本

	[root@host ~]# touch /root/test.sh
	[root@host ~]# chmod u+x /root/test.sh
	[root@host ~]# vi /root/test.sh

	#!/bin/csh
	SENDDATE=`date`
	echo "定时测试，每天7点" | /bin/mail -s "邮件主题 - $SENDDATE" 1460300366@qq.com

### 添加定时任务
让脚本定时自动运行，这个例子是每天7:00发送邮件

	[root@host ~]# echo "00 07 * * * root /root/test.sh" >> /etc/crontab
	[root@host ~]# echo >> /etc/crontab
	[root@host ~]# service crond reload

明天看下效果，然后就写实际应用脚本。

经检测执行命令前要加个sh，才能执行脚本，因为我那个开头写错了`/bin/csh`，应该是`/bin/bash`，否则会报错，不过用sh执行就不用管这个问题，并且也不需要确定有没有授权。

	[root@host ~]# /root/test.sh 
	-bash: /root/test.sh: /bin/csh: bad interpreter: 没有那个文件或目录

我用每分钟一次的测试还是不行，发现可能是没有设置生效，重启一下服务

	*/1 * * * * root sh /root/test.sh

重启服务

	/etc/init.d/crond restart

![测试结果](/images/centos-auto-mail/test-sendmail-auto.png)



