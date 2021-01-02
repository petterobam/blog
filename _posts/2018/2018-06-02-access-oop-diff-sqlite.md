---
layout: post
title: "Access 封装之与 Sqlite 封装的差异"
author: "petterobam"
description: "Access 封装之与 Sqlite 封装的差异"
categories: [Access, 面向对象封装，Java]
tags: [Access, 差异]
redirect_from:
  - /2018/06/02/
---

## 前情提要

[Microsoft Office Access](https://baike.baidu.com/item/Microsoft%20Office%20Access/7748166?fromtitle=ACCESS%E6%95%B0%E6%8D%AE%E5%BA%93&fromid=7894751&fr=aladdin) 是一个关系数据库管理系统，因为出自 Microsoft Office 家族，所以除了数据库属性外，还自带 Office 属性，也就是有对应的图形界面软件。但是，我更倾向于她文件数据库的功能，简直和 Sqlite 太像了，一个文件就能存储很多关系数据。因此，本人就打算抄袭之前我对 Sqlite 封装思路，对 Access 进行一个快速的封装。不过，照搬还是有很多问题的，毕竟名字不同，还是会有很多差异的，这里我将一一介绍其中的差异。

## 功能清单

1. ~~自动建库~~
1. ~~自动建表~~
1. ~~增删查改等基本功能~~
1. ~~数量查询功能~~
1. ~~分表分库~~
1. ~~自定义配置加载~~
1. ~~**批量操作（事务）**~~
1. **缓存库基础功能类实现**
1. 缓存库和文件库混用实现
1. ~~**连接池实现**~~
1. 查询分页功能实现
1. 备份工具实现
1. 密码连接实现
1. 带密码数据库生成实现

由于 Access 没有什么控制台命令，这里去掉 Access 封装中 [控制台功能类]。相比 Sqlite 其优势更多的是在 图形界面软件上，就算完全不懂编程（非编程人员开发利器），也能 [开发一套管理软件](http://www.accessoft.com/announce.asp?Id=23)，不过貌似仅限于 [单击版 Window 软件](http://www.accessoft.com/accsoft.asp)。Access 自带强大的数据处理、统计分析能力，利用 Access 的查询功能，可以方便地进行各类汇总、平均等统计，并可灵活设置统计的条件。管理人员貌似可以借助 Access 实现开发出软件的 “梦想” ，从而转型为 “懂管理+会编程” 的复合型人才。

不过这些都跟本封装没有半毛钱关系，这里只对 Access 库文件做操作。比如，有需要从其他类型数据库导出 Access 库文件，然后给那些管理人员自己去统计分析的类似需求，借助该封装功能还是很容易实现的，不用几分钟就能轻松完成编码；需要用 Java 开发小型网站的，而且自己会用 Access 分析的管理人才的类似需求，可以借助该封装完成。如果没有场景需要借助 Access 软件做数据分析，又只需要非服务式的文件库的存在，请选择 Sqlite 数据库，性能和存储量方面， Sqlite 关系数据库绝对更加优秀。

## Access JDBC

由于封装原则是尽量减少框架类的 Maven 依赖，所以是基于 JDBC 的基础上进行的。可是， Access 这种数据库的 JDBC 貌似挺难找，。

1. ```sun.jdbc.odbc.JdbcOdbcDriver```，直接连接
  - ```jdbc:odbc:driver={Microsoft Access Driver (*.mdb)};DBQ=D:\Access\XXX.mdb```
  - Window 平台限制，不满足要求
  - 这种 Office2003 以下的用户不用特殊驱动，默认都有的，Office2007 以上的用户则组要下载对应的驱动（ODBC 驱动程序管理器）进行安装，例如 64 位系统则安装：AccessDatabaseEngine_X64.exe，故弃用。

2. JDBC ODBC 桥连接
  - ```jdbc:odbc:XXX ```，```XXX``` 为添加的数据源
  - Window 平台限制，不满足要求
  - 这种方式就必须安装 ODBC 驱动程序管理器，而且还要把 mdb 这类 Access 文件路径注册成为数据源才行，完全变麻烦了有没有，弃用。

3. 驱动文件连接
  - ```jdbc:Access:///C:\Access\XXX.mdb```
  - 需要下载 [驱动文件](http://www.hxtt.com/access.zip)，而且试用版的，有使用次数限制，正式版要付费，弃用。

4. UCanAccess
  - ```jdbc:ucanaccess:///D:/Access/XXX.mdb```，一种开源 Java JDBC 驱动程序实现，它允许 Java 开发人员和 JDBC 客户端程序读取/写入 Microsoft Access 数据库
  - 有 Maven ，跨平台，可以在 Windows 和非 Windows 操作系统上运行，不需要 ODBC
  - [UCanAccess](http://ucanaccess.sourceforge.net/site.html) 使用 [Jackcess](http ://jackcess.sourceforge.net) （建库和连接作用，支持带密码的）作为 Access 输入/输出库； 使用 [HSQLDB](http：//hsqldb.org) 同步 DBMS
  - 还有各种比较完善的特征，详情请访问 http://ucanaccess.sourceforge.net/site.html

## 多种文件格式

Microsoft Access 库文件有很多种，所以需要在连接的时候对应上版本，这里是与 Sqlite 不同的。版本决定着数据库的连接方式，优先根据使用者配置的 ```access.file.format``` ，如果没有配置，一般会根据文件后缀默认选择对应的版本，如若在没有找上，默认用 Office 2003 的版本。

```
V1997(".mdb")，貌似只支持读的功能
GENERIC_JET4(".mdb")
V2000(".mdb")
V2003(".mdb")，这种后缀默认的版本
V2007(".accdb")
V2010(".accdb")，这种后缀默认的版本
V2016(".accdb")
MSISAM(".mny")，带密码的版本
```

```java
/**
 * 获取 库版本格式
 *
 * @param dbPath 库文件地址
 * @return
 */
public static Database.FileFormat getAccessFormat(String dbPath) {
    String accessFormat = AccessConfig.getAccessFormat();
    if (!AccessUtils.isBlank(accessFormat)) {
        return AccessFormatEnum.getFileFormatByName(accessFormat);
    } else if (!AccessUtils.isBlank(dbPath)) {
        int extIndex = dbPath.indexOf(".");
        if (extIndex <= 0) {
            return Database.FileFormat.V2003;
        }
        String ext = dbPath.substring(extIndex);
        if (".mdb".equals(ext)) {
            return Database.FileFormat.V2003;
        } else if (".accdb".equals(ext)) {
            return Database.FileFormat.V2010;
        } else if (".mny".equals(ext)) {
            return Database.FileFormat.MSISAM;
        } else {
            return Database.FileFormat.V2003;
        }
    } else {
        return Database.FileFormat.V2003;
    }
}
```

## 字段类型

几乎大部分数据库都对通用的 SQL 支持，要说 SQL 本地方言的体现的话，主要一点就是存储数据的字段类型，当然 Access 也有自己的方言字段。

```sql
CREATE TABLE 测试表 (
    文本 255 VARCHAR NOT NULL,
    文本 20 VARCHAR(20) NOT NULL,
    日期时间 DATETIME,
    数字 1 BYTE,
    数字 2 SMALLINT,
    数字 4 INTEGER,
    布尔 BIT,
    自动编号 COUNTER(10, 5) CONSTRAINT PK_TVIPLevel26 PRIMARY KEY,
    小数 NUMERIC,
    单精度 REAL,
    双精度 FLOAT DEFAULT 0 NOT NULL,
    备注 MEMO,
    货币 CURRENCY,
    OLE 对象 IMAGE
)

在 Access 的查询设计器中，该语句不能执行 DEFAULT 0；
其中：COUNTER(10,5) 表明初始值从 10 开始，每次递增 5，如果没有 (10,5)，则是从 1 开始，每次递增 1；
NUMERIC 表示小数，可以用 NUMERIC(18,2) 指定有 2 位小数；
```

### 常用类型

1. char、varchar、text 和 nchar、nvarchar、ntext
  - char 和 varchar 的长度都在 1 到 8000 之间，它们的区别在于 char 是定长字符数据，而 varchar 是变长字符数据。所谓定长就是长度固定的，当输入的数据长度没有达到指定的长度时将自动以英文空格在其后面填充，使长度达到相应的长度；而变长字符数据则不会以空格填充。
  - text 存储可变长度的非 Unicode 数据，最大长度为 2^31-1(2,147,483,647) 个字符。
  - 后面三种数据类型和前面的相比，从名称上看只是多了个字母"n"，它表示存储的是 Unicode 数据类型的字符。写过程序的朋友对 Unicode 应该很了解。字符中，英文字符只需要一个字节存储就足够了，但汉字众多，需要两个字节存储，英文与汉字同时存在时容易造成混乱，Unicode 字符集就是为了解决字符集这种不兼容的问题而产生的，它所有的字符都用两个字节表示，即英文字符也是用两个字节表示。
      * nchar、nvarchar 的长度是在 1 到 4000 之间，不论是英文还是汉字
      * char、varchar 最多能存储 8000 个英文，4000 个汉字。

2. datetime 和 smalldatetime
  - datetime：从 1753 年 1 月 1 日到 9999 年 12 月 31 日的日期和时间数据，精确到百分之三秒。
  - smalldatetime：从 1900 年 1 月 1 日到 2079 年 6 月 6 日的日期和时间数据，精确到分钟。

3. bitint、int、smallint、tinyint 和 bit
  - bigint：从-2^63(-9223372036854775808) 到 2^63-1(9223372036854775807) 的整型数据。
  - int：从-2^31(-2,147,483,648) 到 2^31-1(2,147,483,647) 的整型数据。
  - smallint：从-2^15(-32,768) 到 2^15-1(32,767) 的整数数据。
  - tinyint：从 0 到 255 的整数数据。
  - bit：1 或 0 的整数数据。

4. decimal 和 numeric
  - 这两种数据类型是等效的。都有两个参数：p（精度）和 s（小数位数）。
      * p 指定小数点左边和右边可以存储的十进制数字的最大个数，p 必须是从 1 到 38 之间的值。
      * s 指定小数点右边可以存储的十进制数字的最大个数，s 必须是从 0 到 p 之间的值，默认小数位数是 0。

5. float 和 real
  - float：从-1.79^308 到 1.79^308 之间的浮点数字数据。
  - real：从-3.40^38 到 3.40^38 之间的浮点数字数据。在 SQL Server 中，real 的同义词为 float(24)。

### 9 大类型

1. 文本（Text(n)）
这种类型允许最大 255 个字符或数字，Access 默认的大小是 50 个字符，而且系统只保存输入到字段中的字符，而不保存文本字段中未用位置上的空字符。可以设置“字段大小”属性控制可输入的最大字符长度。

2. 备注（Memo）
这种类型用来保存长度较长的文本及数字，它允许字段能够存储长达 64000 个字符的内容。但 Access 不能对备注字段进行排序或索引，却可以对文本字段进行排序和索引。在备注字段中虽然可以搜索文本，但却不如在有索引的文本字段中搜索得快。

3. 数字
这种字段类型可以用来存储进行算术计算的数字数据，用户还可以设置“字段大小”属性定义一个特定的数字类型，任何指定为数字数据类型的字型可以设置成“字节”、“整数”、“长整数”、“单精度数”、“双精度数”、“同步复制 ID”、“小数”五种类型。在 Access 中通常默认为“双精度数”。

4. 日期/时间 (Time)
这种类型是用来存储日期、时间或日期时间一起的，每个日期/时间字段需要 8 个字节来存储空间。
货币：这种类型是数字数据类型的特殊类型，等价于具有双精度属性的数字字段类型。向货币字段输入数据时，不必键入人民币符号和千位处的逗号，Access 会自动显示人民币符号和逗号，并添加两位小数到货币字段。当小数部分多于两位时，Access 会对数据进行四舍五入。精确度为小数点左方 15 位数及右方 4 位数。

5. 自动编号 (Counter)
这种类型较为特殊，每次向表格添加新记录时，Access 会自动插入唯一顺序或者随机编号，即在自动编号字段中指定某一数值。自动编号一旦被指定，就会永久地与记录连接。如果删除了表格中含有自动编号字段的一个记录后，Access 并不会为表格自动编号字段重新编号。当添加某一记录时，Access 不再使用已被删除的自动编号字段的数值，而是重新按递增的规律重新赋值。

6. 是/否
这种字段是针对于某一字段中只包含两个不同的可选值而设立的字段，通过是/否数据类型的格式特性，用户可以对是/否字段进行选择。

7. OLE 对象
这个字段是指字段允许单独地“链接”或“嵌入”OLE 对象。添加数据到 OLE 对象字段时，可以链接或嵌入 Access 表中的 OLE 对象是指在其他使用 OLE 协议程序创建的对象，例如 WORD 文档、EXCEL 电子表格、图像、声音或其他二进制数据。OLE 对象字段最大可为 1GB，它主要受磁盘空间限制。

8. 超级链接
这个字段主要是用来保存超级链接的，包含作为超级链接地址的文本或以文本形式存储的字符与数字的组合。当单击一个超级链接时，WEB 浏览器或 Access 将根据超级链接地址到达指定的目标。超级链接最多可包含三部分：一是在字段或控件中显示的文本；二是到文件或页面的路径；三是在文件或页面中的地址。在这个字段或控件中插入超级链接地址最简单的方法就是在“插入”菜单中单击“超级链接”命令。

9. 查阅向导
这个字段类型为用户提供了一个建立字段内容的列表，可以在列表中选择所列内容作为添入字段的内容。

## 库文件

与 Sqlite 的 JDBC 不同，这里的库文件不会自动生成，需要手动的去控制库文件的生成，而且如果涉及到多库文件（分库功能），还需要记录下来，免去一些耗时的判断。

```java
/**
 * Access 数据库工具类
 *
 * @author 欧阳洁
 * @since 2018-05-31 9:52
 */
public class AccessDatabaseUtils {
    /**
     * 记录以及创建了的数据库链接
     */
    private static String EXIST_DB_PATHS = "";
    /**
     * 创建 Access 库文件
     *
     * @param dbPath
     * @return
     */
    public static boolean createDatabaseFile(String dbPath) {
        return createDatabaseFile(dbPath, null);
    }
    /**
     * 创建带密码的 Access 库文件
     *
     * @param dbPath
     * @param password
     * @return
     */
    public static boolean createDatabaseFile(String dbPath, String password) {
        if (AccessDatabaseUtils.isExistDbPath(dbPath)) {
            return true;
        }
        File file = new File(dbPath);
        if (!file.exists()) {
            Database db = null;
            try {
                Database.FileFormat fileFormat = AccessDatabaseUtils.getAccessFormat(dbPath);
                DatabaseBuilder dbd = new DatabaseBuilder(file);
                dbd.setAutoSync(false);
                dbd.setFileFormat(fileFormat);
                dbd.setReadOnly(false);
                if (!AccessUtils.isBlank(password)) {
                    dbd.setCodecProvider(new CryptCodecProvider(password));
                }
                db = dbd.create();
                AccessDatabaseUtils.addExistDbPath(dbPath);
                return true;
            } catch (IOException e) {
                e.printStackTrace();
                return false;
            } finally {
                if (null != db) {
                    try {
                        db.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        } else {
            AccessDatabaseUtils.addExistDbPath(dbPath);
        }
        return true;
    }
    /**
     * 是否已经存在了
     * @param dbPath
     * @return
     */
    public static boolean isExistDbPath(String dbPath) {
        return EXIST_DB_PATHS.indexOf(dbPath) >= 0;
    }
    /**
     * 判断库中表是否存在
     * @param dbPath
     * @param tableName
     * @return
     */
    public static boolean isTableExist(String dbPath, String tableName) {
        return AccessDatabaseUtils.isTableExist(dbPath,tableName,null);
    }
    /**
     * 添加已经存在的数据库
     *
     * @param dbPath
     */
    public static void addExistDbPath(String dbPath) {
        EXIST_DB_PATHS = EXIST_DB_PATHS + "|" + dbPath;
    }
}
```

### 密码库生成

通过上面的语句，想必看到 Jackcess 对 Access 库支持密码建库（PS：Sqlite 传说中好像也支持密码连接，但是目前我还没找到相关资料，所以那个功能至今不知道怎么划掉）。密码连接的时候，只用对连接 uri 中附上对 JackcessOpenerInterface 类的实现类路径即可。

>jdbc:ucanaccess:///D/Access/XXX.mny;jackcessOpener=oop.access.opener.AccessCryptCodecOpener

```java
/**
 * 加密文件开启
 *
 * @author 欧阳洁
 * @since 2018-05-31 10:21
 */
public class AccessCryptCodecOpener implements JackcessOpenerInterface {
    /**
     * 打开有密码的连接
     * @param fl
     * @param pwd
     * @return
     * @throws IOException
     */
    public Database open(File fl, String pwd) throws IOException {
        DatabaseBuilder dbd = new DatabaseBuilder(fl);
        dbd.setAutoSync(false);
        dbd.setCodecProvider(new CryptCodecProvider(pwd));
        dbd.setReadOnly(false);
        return dbd.open();
    }
}
```

## 表存在判断

一般情况下，服务启动会将可以确定的表建好，然后标记一下即可，但是如果是动态表的话（分表功能），就需要在做插入操作之前建表。 Sqlite 自动建表的时候，我们可以方便的 ``` create table if not exists ...``` 做到检查的同时做保证有表，然而 Access 数据库貌似没有 ```if``` 语法支持，就是说，这个方法不能用了，所以需要手动判断是否存在该表先，然后才能进行 ``` create table ...```，达到自动建表的功能。
当然，分库功能也会涉及动态建表，于是分库分表双动态，自然不能通过 ```try catch``` 创建表格（ ```create table``` ) 的语句来逃避这个问题，这里根据 Jackcess 暂时解决这个问题。

```java
/**
 * 判断库中表是否存在
 * @param dbPath
 * @param tableName
 * @param password
 * @return
 */
public static boolean isTableExist(String dbPath, String tableName, String password) {
    if(AccessUtils.isBlank(tableName) || AccessUtils.isBlank(dbPath)){
        return false;
    }
    File file = new File(dbPath);
    if (file.exists()) {
        Database db = null;
        try {
            Database.FileFormat fileFormat = AccessDatabaseUtils.getAccessFormat(dbPath);
            DatabaseBuilder dbd = new DatabaseBuilder(file);
            dbd.setAutoSync(false);
            dbd.setFileFormat(fileFormat);
            dbd.setReadOnly(false);
            if (!AccessUtils.isBlank(password)) {
                dbd.setCodecProvider(new CryptCodecProvider(password));
            }
            db = dbd.open();
            return db.getTable(tableName) != null;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        } finally {
            if (null != db) {
                try {
                    db.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
    return true;
}
```

## 后记

Access 数据库作为微软的收费产品，自然有其独到特性，暂时还没有发现其他的，感兴趣的可以去学习深入，这里就不做扩展。后续如果有其他的封装和扩展，会持续记录。
