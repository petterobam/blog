---
title: "thymeleaf学习笔记"
---

## 基础认识

1. thymeleaf 为 ```*.html```文档

	[源码地址](https://github.com/thymeleaf)
	[中文文档PDF](https://cdn.jsdelivr.net/gh/petterobam/picture-bucket@main/blog/learner/thymeleaf/thymeleaf_3.0.5_zh_guide.pdf)

2. 定义为thymeleaf文档时候，html标签上添加如下自定义属性：

	```html
	<html xmlns:th="http://www.thymeleaf.org">
	```

3. 如上，我们定义 ```xmlns:th```，下面就可以用 ```th``` 作为 thymeleaf 的标识属性 ```th``` 标签主要有：

	```html 
	th:id		替换id	<input th:id="'xxx' + ${collect.id}"/>
	th:text		文本替换	<p th:text="${collect.description}">description</p>
	th:utext	支持html的文本替换	<p th:utext="${htmlcontent}">conten</p>
	th:object	替换对象	<div th:object="${session.user}">
	th:value	属性赋值	<input th:value="${user.name}" />
	th:with		变量赋值运算	<div th:with="isEven=${prodStat.count}%2==0"></div>
	th:style	设置样式	th:style="'display:' + @{(${sitrue} ? 'none' : 'inline-block')} + ''"
	th:onclick	点击事件	th:onclick="'getCollect()'"
	th:each		属性赋值	tr th:each="user,userStat:${users}">
	th:if		判断条件	<a th:if="${userId == collect.userId}" >
	th:unless	和th:if判断相反	<a th:href="@{/login}" th:unless=${session.user != null}>Login</a>
	th:href		链接地址	<a th:href="@{/login}" th:unless=${session.user != null}>Login</a> />
	th:switch	多路选择 配合th:case 使用	<div th:switch="${user.role}">
	th:case		th:switch的一个分支	<p th:case="'admin'">User is an administrator</p>
	th:fragment	布局标签，定义代码片段，方便其它地方引用	<div th:fragment="alert">
	th:include	布局标签，替换内容到引入的文件	<head th:include="layout :: htmlhead" th:with="title='xx'"></head>
	th:replace	布局标签，替换整个标签到引入的文件	<div th:replace="fragments/header :: title"></div>
	th:selected	selected选择框 选中	th:selected="(${xxx.id} == ${configObj.dd})"
	th:src		图片类地址引入	<img th:src="@{/img/logo.png}" />
	th:inline	定义js脚本可以使用变量	<script type="text/javascript" th:inline="javascript">
	th:action	表单提交的地址	<form action="subscribe.html" th:action="@{/subscribe}">
	th:remove	删除某个属性	<tr th:remove="all"> 1.all:删除包含标签和所有的孩子。
	th:attr		th:attr="src=@{/image/aa.jpg},title=#{logo}"，此标签不太优雅，一般用的比较少。
	```
