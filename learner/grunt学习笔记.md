Grunt学习笔记
=============

## 概念

>搭建自动化web前端开发环境

## 安装

1. 前提依赖nodejs

2. 全局安装grunt命令工具：```npm install -g grunt-cli```

## 文件目录

```
/package.json    #必备，可以通过npm init 创建
/Gruntfile.js     #必备，可以参照https://github.com/gruntjs/grunt-init-gruntfile
```

`package.json` 初始内容如下：

```javascript
{
	"name": "grunt-test",
	"version": "1.0.0",
	"devDependencies": {

	}
}
```

`Gruntfile.js` 初始内容如下：

```javascript
module.exports = function(grunt) {
	//任务配置
	grunt.initConfig({
	//获取package.json信息
	    pkg: grunt.file.readJSON('package.json')
	});
	//输入grunt默认执行什么
	grunt.registerTask(‘default’,[]);
};
```

## 插件安装

1. 通过 npm install -g grunt-init 命令安装 grunt-init
2. 通过 git clone git://github.com/gruntjs/grunt-init-gruntplugin.git ~/.grunt-init/gruntplugin 命令安装grunt插件模版。
3. 在一个空的目录中执行 grunt-init gruntplugin 。
4. 执行 npm install 命令以准备开发环境。
5. 为你的插件（任务）书写代码。
6. 执行 npm publish 命令将你创建的 Grunt 插件（任务）发布到npm！


## 文档

[http://www.gruntjs.net/getting-started](http://www.gruntjs.net/getting-started)
