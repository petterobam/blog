---
title: "Docker学习笔记"
---

## Docker安装

官网下载安装

```cmd
docker version

Client:
 Version:      18.03.1-ce
 API version:  1.37
 Go version:   go1.9.5
 Git commit:   9ee9f40
 Built:        Thu Apr 26 07:12:48 2018
 OS/Arch:      windows/amd64
 Experimental: false
 Orchestrator: swarm

Server:
 Engine:
  Version:      18.03.1-ce
  API version:  1.37 (minimum version 1.12)
  Go version:   go1.9.5
  Git commit:   9ee9f40
  Built:        Thu Apr 26 07:22:38 2018
  OS/Arch:      linux/amd64
  Experimental: false
```

## Docker部署MySQL

```cmd
docker pull mysql

docker images

docker run --name first-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=111111 -d mysql

docker ps

docker ps -a

docker ps -q

用Navicat等客户端连接试试

docker exec -it first-mysql /bin/bash

root@17f262428195:/## mysql -uroot -p
Enter password:
mysql> select user,host,password from mysql.user;
ERROR 1054 (42S22): Unknown column 'password' in 'field list'
mysql> select user,host,authentication_string from mysql.user;
+------------------+-----------+------------------------------------------------------------------------+
| user             | host      | authentication_string                                                  |
+------------------+-----------+------------------------------------------------------------------------+
| root             | %         | $A$005$~5l<oK■3♠w|x↕↓Kb▼"B&DWiM2vU56iRdVsCQYZZ/YjO3JjLVUCF5D8j8miag7GC |
| mysql.infoschema | localhost | *THISISNOTAVALIDPASSWORDTHATCANBEUSEDHERE                              |
| mysql.session    | localhost | *THISISNOTAVALIDPASSWORDTHATCANBEUSEDHERE                              |
| mysql.sys        | localhost | *THISISNOTAVALIDPASSWORDTHATCANBEUSEDHERE                              |
| root             | localhost | $A$005$eIeeny;▲.NJ\86=>RZTjiT2Vl1GvBdICEP7O3E/9HftqxGJR5enw8WOZPH3 |
+------------------+-----------+------------------------------------------------------------------------+
5 rows in set (0.00 sec)

搞一波授权没成功，这个mysql版本为8.0的，有些sql执行有问题。

docker stop first-mysql

docker rm first-mysql

docker pull mysql-57-centos7

docker pull tomcat

docker pull nginx
```
