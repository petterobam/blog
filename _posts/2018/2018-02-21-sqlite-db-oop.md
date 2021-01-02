---
layout: post
title: "数据库面向对象封装【干货】"
description: "数据库面向对象封装实战分享"
categories: [体会，sqlite, 数据库，Java]
tags: [数据库，封装，面向对象，sqlite]
redirect_from:
  - /2018/02/21/
---

## 前情提要

大部分应用都是由程序和数据两个部分构成的，而数据除了少部分是通过配置等写死的外，大部分总是都是通过特殊格式的文件（xml、access 或 sqlite）或独立的系统（oracle、mysql、sql server 或 elasticsearch、mongodb 等）承载的。因此，程序和数据的无缝联结，对应用的扩展和迭代尤为重要，对程序的高可用和可维护性非常关键。故今天需要讨论的是对数据，主要是对数据库的封装，而习惯 OOP 的个人，则是对数据库的面向对象的封装。

## 我的思路

众所周知，我们与数据库沟通用的是数据库的语言 SQL，就像我们编程的语言是 Java、C#、JavaScript 一样，不同的语言是不能直接沟通的，需要一个翻译层，所以这一层就是面向数据库封装，而这一层 jdk 里面早就实现了（jdbc），本文个人以最接近的实际数据库的文件数据库 sqlite（org.sqlite.JDBC）来做代码实验。

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
```
```xml
<!-- maven:sqlite 数据库操作 -->
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>${sqlite.version}</version> 
</dependency>
```

```sql
#java 所用的 sql 语言也是通用的 sql 预处理语言，通过占位符（?）接收各种类型的变量，可以说即安全又优美。

[oracle 语法]：select * from table where 1=1 and column1=? and column2>? or column3 like '%'||?||'%' 
```

当前的很多框架已经完美的封装了数据库，mybatis、hibernate 这些对数据库的语言做了非常灵活的处理，也有一套各自自己的语法。但是，个人认为 xml 文件还是属于配置文件，如果能实现零配置的面向对象封装就好了。面向对象封装需要达到的程度就是通过一个对象的信息可以直接自动的产生数据库相关的 sql，然后将对象的变量属性值对应 sql 的占位符，并且在基类上实现基本的功能。

```java
public abstract class SqliteBaseDao<T extends SqliteBaseEntity> {
    public int insert(String sql){...}
    public int update(String sql){...}
    public int delete(String sql){...}
    public List<T> query(String sql){...}
    // 通过对象信息实现增删查改
    public int insert(T entity){...}
    public int update(T entity){...}
    public int delete(T entity){...}
    public int deleteById(Object id){...}
    public List<T> query(T entity){...}
    public T queryById(Object id){...}
    // 自定义 SQL 的实现，模仿 mybatis 的 xml 动态 SQL，但是不是用 xml 文件的方式
    public List<T> excuteQuery(T entity) {...}
    public List<T> excuteQuery(Object... params) {...}
    public int excute(T entity) {...}
    public int excute(Object... params) {...}
}
```

### 一个类信息收集器

想要做到面向对象的数据库封装，就要把数据的最小单元和程序的最小单元关联起来，这两个单元都是独立的整体，再分割就会出现信息失真或不对称的情况。数据的最小单元就是表的单行记录，程序最小单元是实体类的单个对象，但是数据不一定有，对象需要实例化，需要运行起来才能提供信息。因此，这个最小单元要静态化，那就是数据库的表结构和实体类的信息关联起来。

表结构能提供的信息有表名、表列名、列属性（类型、是否为空、默认值），实体类能提供的信息有类名、类变量名、类变量名属性（变量类型），似乎大部分都能对应上，但是属性部分还不能对应上，比如是否为空、默认值，而且为了良好的 Java 编码规范，有些东西和数据库的一些信息是不能完全对应的，比如通常 java 的命名规范一般不允许带下划线，而是用驼峰命名，而数据库的表和字段确经常用下划线分割单词（主要由于很多数据库不区分表名和字段名的大小写，甚至有些数据库不支持表名和字段名的大写）这就非常尴尬了，所以，这种差异化的对应就需要配置。并且，为了增加扩展性，程序单元的实体类的信息往往要比数据单元的表结构信息多一些，比如可能会有非表字段的属性（占位符中非表字段的传入属性和结果集中非表字段的接收属性），

ibatis、hibernate 就用到了这些，但是用的是 xml 文件，而且一旦配置出错还非常容易影响编译，并且不容易定位问题。mybatis+spring 的 xml 和 java 注解让系统变得非常灵活，但是依然不能彻底的去掉 xml 文件，而且 xml 中如果出现一个小小的分号或空格都有可能引发问题，要是只用 java 注解就能解决掉的话就完美了。
    
综上，想要实现这些适配，需要几个基础的注解：表名注解、主键注解、表字段注解、非表字段标识注解、自定义 SQL 注解（多种）。

```java
/**
 * 表名注解类
 * @author 欧阳洁
 * @create 2017-09-30 11:16
 */
@java.lang.annotation.Target(value = {java.lang.annotation.ElementType.TYPE})
@java.lang.annotation.Retention(value = java.lang.annotation.RetentionPolicy.RUNTIME)
public @interface SqliteTable {
    String name() default "";
}
```

```java
/**
 * Sqlite 的 ID 注解类
 * @author 欧阳洁
 * @create 2017-09-30 11:20
 */
@java.lang.annotation.Target(value = {java.lang.annotation.ElementType.FIELD})
@java.lang.annotation.Retention(value = java.lang.annotation.RetentionPolicy.RUNTIME)
public @interface SqliteID {
    /* 主键列名，默认空*/
    String name() default "";
    /* 主键默认类型，默认 integer 类型 */
    String type() default "integer";
    /* 主键是否自增长，默认是 true */
    boolean autoincrement() default true;
}
```

```java
/**
 * Sqlite 的表（列）字段注解类
 * @author 欧阳洁
 * @create 2017-09-30 11:20
 */
@java.lang.annotation.Target(value = {java.lang.annotation.ElementType.FIELD})
@java.lang.annotation.Retention(value = java.lang.annotation.RetentionPolicy.RUNTIME)
public @interface SqliteColumn {
    /* 列名，默认空 */
    String name() default "";
    /* 主键默认类型，默认最大 20 位长度的字符串 */
    String type() default "char(20)";
    /* 主键是否自增长，默认是 true */
    boolean notNull() default true;
}
```

```java
/**
 * 非表字段注解
 * @author 欧阳洁
 */
@java.lang.annotation.Target(value = {java.lang.annotation.ElementType.FIELD})
@java.lang.annotation.Retention(value = java.lang.annotation.RetentionPolicy.RUNTIME)
public @interface SqliteTransient {
}
```

```java
/**
 * 自定义 SQL 注解类
 * @author 欧阳洁
 */
@java.lang.annotation.Target(value = {java.lang.annotation.ElementType.METHOD})
@java.lang.annotation.Retention(value = java.lang.annotation.RetentionPolicy.RUNTIME)
public @interface SqliteSql {
    /* 自定义的 Sql 语句，带占位符的 Sql */
    String sql();
    /* 占位符顺序对应的参数顺序，默认不带参数 */
    String[] params() default "";
}
```

在上述的这些注解中，主键注解、表字段注解、非表字段标识注解其实都可以归为表字段注解，只要稍微添加某些属性就可以实现其他两个注解的功能，但是为了使用的方便性和程序的可读性，我牺牲了顶层代码的简易性，对这三个注解都做了区分和处理。而自定义 SQL 注解应该类似于 mybatis 里面的 xml 标签，@SqliteSql 这个注解类只是实现了基本的（select、insert、delete、update）标签，搭配 SqliteBaseDao 里面的基本方法就可以轻松实现简单的 mapper 功能，而那些复杂的 if else、choose when 标签则需要例外些其他的辅助标签搭配使用，比如需求最多的动态 where，可以定义类似于@SqliteSqlWhereIf，这样就可以简单的实现 if 标签，并且通过 testId 和 parentTestId 还可以实现 if 标签的嵌套功能，然后利用 java8 的新特性@Repeatable 实现重复注解，或者直接定义一个集合注解（这个看着不是特别美观）就可轻松的实现判断条件非嵌套动态生成各种 sql。

```java
public abstract class SqliteBaseDao<T extends SqliteBaseEntity> {
    ...
    // 自定义 SQL 的实现，模仿 mybatis 的 xml 动态 SQL，但是不是用 xml 文件的方式
    public List<T> excuteQuery(T entity) {...}  //对应 select 标签
    public List<T> excuteQuery(Object... params) {...}  //对应 select 标签
    public int excute(T entity) {...}   //对应 insert、update、delete 标签
    public int excute(Object... params) {...}   //对应 insert、update、delete 标签
}
```

```java
/**
 * 自定义 SQL 注解类，实现 SqliteSqlWhereIf 的重复注解
 * @author 欧阳洁
 */
@java.lang.annotation.Target(value = {java.lang.annotation.ElementType.METHOD})
@java.lang.annotation.Retention(value = java.lang.annotation.RetentionPolicy.RUNTIME)
public @interface SqliteSqlWhereIfs {
    SqliteSqlWhereIf[] value();
}
/**
 * 自定义 SQL 注解类，条件判断注解，用于生成动态 SQL
 * @author 欧阳洁
 */
@java.lang.annotation.Target(value = {java.lang.annotation.ElementType.METHOD})
@java.lang.annotation.Retention(value = java.lang.annotation.RetentionPolicy.RUNTIME)
@java.lang.annotation.Repeatable(SqliteSqlWhereIfs.class)
public @interface SqliteSqlWhereIf {
    /* 判断条件标识 ID */
    int testId();
    /* 所属层级，默认 0，最外层 */
    int parentTestId() default 0;
    /* 判断条件类型，==、>、<、>=、<=、eq、ne */
    String testType() default "eq";
    /* 判断字段名 */
    String testName();
    /* 符合条件的值 */
    String[] testTrueValue();
    /* 符合条件对应的动态 SQL */
    String[] testTrueSql() default "";
    /* 占位符顺序对应的参数顺序，默认不带参数 */
    String[] params() default "";
}

例如：
@SqliteSql(sql = "select * from this.tableName where 1=1")
@SqliteSqlWhereIf(testId=1,testType="eq",testName="searchType",testTrueValue={"2"},testTrueSql=" and create_time>datetime('now') ")
@SqliteSqlWhereIf(testId=2,testType="ne",testName="name",testTrueValue={""},testTrueSql=" and name like '%'||?||'%' ",parentTestId=1,params={"name"})
@SqliteSqlWhereIf(testId=3,testType="eq",testName="author",testTrueValue={""},testTrueSql=" and author=? or name=? ",parentTestId=1,params={"author","author"})
public List<XXX> method1(XXX entity){ return super.excuteQuery(entity); }
```

于是，类信息收集器能做成静态的吗，不能。因为每个表的信息不同，就会对应不同的类信息，如果我们做成静态的，那么就会产生很多无意义的重复代码，我们要用对象存储他，并且是一个表用一个对象去存储。这样，我们就可以准确定义一个类信息收集器的收集内容了，如下所示：

```java
/**
 * 实体类 T 的信息收集器
 * Sqlite 的 Sql 语句生成器
 * @author 欧阳洁
 * @create 2017-09-30 10:56
 */
public class SqliteSqlHelper<T extends SqliteBaseEntity> {
    private Class<T> targetClass;//实体类
    private String tableName;//表名
    private String idName;//主键名
    private Field idField;//主键变量属性
    List<Field> columnFields;//表列名对应的变量属性集合
    Map<String, String> columnMap;//表列名和字段映射 map

    /**
     * 构造函数
     * @param targetClass
     */
    public SqliteSqlHelper(Class<T> targetClass) {
        this.tableName = this.getTableNameForClass(targetClass);
        this.targetClass = targetClass;
        this.columnFields = new Vector<Field>();
        this.columnMap = new HashMap<String, String>();
        this.getColumnFields();//表列名对应的变量属性相关信息，包括表列名和字段映射
    }
    ...
}
```

### 一个 SQL 生成器

和数据库沟通就需要使用相应的 SQL 语言，而通用的关系型数据库（oracle、mysql、sql server 等），甚至是非关系型的数据库 NOSQL（elasticsearch、mongodb 等），绝大部分交互无非就是增删查改，而 SQL 的增删查改语言几乎是通用的。

```sql
# 建表
    create table t_test_table(
        id integer primary key autoincrement not null,
        name char(100) not null,
        author char(100) not null,
        article text,
        create_time char(20) not null
    );
# 新增
    insert into t_test_table(name,author, article,create_time)
        values ("test11","petter","article1","2017-09-29 17:01:22");
# 查询
    select * from t_test_table;
    select * from t_test_table where id=1;
# 修改
    update t_test_table
        set name = "test11_修改", article = "article1_修改", create_time = "2017-09-29 17:01:27"
            where id=1;
# 删除
    delete from t_test_table where id = 1;
```

这里多了个建表 SQL，这里是为了实现自动化部署数据库用的，相当于程序驱动数据，让更多主动层面转移到程序代码这一层。当我们为我们的业务新增一个数据实体时候，程序就能自动的去生成规范的数据库，免去了繁琐的手动创建以及容易弄错的字段类型方面的细节，如果封装的好的话，迭代更新就能免去 SQL 脚本了。扩展一下的话，在表名注解里面添加数据库的链接属性还可以实现平滑分库的功能（这个可以，对于 sqlite 这种小型数据库，如果能实现分库的话，那就不再是小型数据库了，当然本文的例子还是以单数据库为例）。
        
而且建表的 sql 生成比较简单，只要单独的根据实体类的信息就能直接生成，如下：

```java
# SqliteSqlHelper.java
public class SqliteSqlHelper<T extends SqliteBaseEntity> {
    /**
     * 创建创建表的 sql 语句
     */
    public String createTableSql() {
        StringBuffer sql = new StringBuffer("create table if not exists ");
        sql.append(this.tableName).append("(");
        boolean useCumma = false;
        for (Field field : this.columnFields) {
            if (useCumma) {
                sql.append(",");//第一次不用逗号
            }else{
                useCumma = true;
            }
            
            String columnName = field.getName();
            String columnType = "char(20)";
            String notNull = "";
            SqliteID id = field.getAnnotation(SqliteID.class);
            if (id != null) {
                columnName = SqliteUtils.isBlank(id.name()) ? field.getName() : id.name();
                columnType = id.type();
                //主键默认不为空，如果自增长默认自增长
                notNull = id.autoincrement() ? " primary key autoincrement not null" : " primary key not null";
            } else {
                SqliteColumn column = field.getAnnotation(SqliteColumn.class);
                if (null != column) {
                    columnName = SqliteUtils.isBlank(column.name()) ? field.getName() : column.name();
                    columnType = column.type();
                    notNull = column.notNull() ? " not null" : "";
                }
            }
            sql.append(columnName.toLowerCase()).append(" ").append(columnType.toLowerCase()).append(" ").append(notNull);
        }
        sql.append(")");
        return sql.toString();
    }
    ...
}

# SqliteBaseDao.java
public abstract class SqliteBaseDao<T extends SqliteBaseEntity> {
    private String tableName;
    private Class entityClazz;
    private SqliteSqlHelper sqlHelper;

    public SqliteBaseDao(Class<T> entityClass) {
        this.sqlHelper = new SqliteSqlHelper(entityClass);
        this.tableName = this.sqlHelper.getTableName();
        this.entityClazz = entityClass;
        //调用该方法就能在使用时检查和创建表，可以通过配置信息判断是否执行，达到开关控制的效果
        this.existOrCreateTable();
    }
    /**
     * 检查表是否存在，不存在则创建
     */
    public void existOrCreateTable() {
        String sql = this.sqlHelper.createTableSql();
        SqliteHelper.execute(sql);
    }
    ...
}
```

同理，增删查改，也是通过类的信息进行 sql 的组装，但是却依赖调用入参实现动态 sql 生成。就以查询为例，默认的动态 sql 生成，基于传入的实体类对象里面的值，一般为空的不做处理，不为空的条件用 and 做连接起来形成动态的查询 SQL。

```java
# SqliteSqlHelper.java
public class SqliteSqlHelper<T extends SqliteBaseEntity> {
    /**
     * 创建查询语句
     */
    public void createSelect(T target) {
        List<Object> param = new Vector<Object>();
        StringBuffer sqlBuffer = new StringBuffer();
        sqlBuffer.append("SELECT * FROM ").append(this.tableName);
        finishWhereOfAnd(sqlBuffer, param, target);
    
        target.setCurrentSql(sqlBuffer.toString());
        target.setCurrentParam(param);
    }
    /**
     * 补全用 and 连接的 sql 语句
     * @param sqlBuffer
     * @param param
     * @param target
     */
    private void finishWhereOfAnd(StringBuffer sqlBuffer, List<Object> param, T target) {
        sqlBuffer.append(" WHERE 1=1 ");
        Object idValue = null;
        if (null != this.idField) {
            idValue = readField(this.idField, target);
        }
        if (idValue != null) {
            sqlBuffer.append(" and ").append(this.idName).append("=?");
            param.add(idValue);
        } else {
            for (Field field : this.columnFields) {
                if (!Modifier.isStatic(field.getModifiers())) {
                    Object currentValue = readField(field, target);
                    if (null != currentValue && !SqliteUtils.equals(this.idName, field.getName())) {
                        String columnName = field.getName();
                        SqliteColumn sqliteColumn = field.getAnnotation(SqliteColumn.class);
                        if (null != sqliteColumn) {
                            columnName = SqliteUtils.isBlank(sqliteColumn.name()) ? field.getName() : sqliteColumn.name();
                        }
                        sqlBuffer.append(" and ").append(columnName.toLowerCase()).append("=?");
                        param.add(currentValue);
                    }
                }
            }
        }
    }
    ...
}
```

对于自定义 SQL 的获取和动态组装生成，它相对其他类的 SQL 就要复杂一些，因为这个注解不是在实体类中，而是在 Dao 类中，而且是一种用于方法的注解。想要知道如何获取这类注解的信息，就需要了解 java 程序的一些运行原理。

> 线程栈区的方法栈：简而言之，就是每个运行中的程序会有一个线程，而调用的方法、调用方法调用的方法、调用方法调用的方法调用的方法。.. 他们会形成该线程的方法栈，进行中的方法都会放入这个栈中，这样我们就可以在运行时候获取到对应的方法了。

然而，我们要使得注解和编码更加简洁易懂，我们需要把这部分获取的代码放到 Dao 类继承的基类（SqliteBaseDao）中，通过基类获取子类的某个方法的注解信息。虽然基类获取子类方法信息与常规程序设计有较大差异，但是只有这样才能实现优美的封装。下面为自定义查询部分代码（增删改同理）：

```java
# SqliteSqlHelper.java
public class SqliteSqlHelper<T extends SqliteBaseEntity> {
    /**
     * 创建自定义查询语句
     */
    public void convertSelfSql(StackTraceElement daoMethodInfo, T target) {
        if (null == daoMethodInfo) {//为空用默认的查询语句
            createSelect(target);
            return;
        }
        Method method = getMethod(daoMethodInfo.getClassName(), daoMethodInfo.getMethodName(), target.getClass());
        if (null == method) {//为空用默认的查询语句
            createSelect(target);
            return;
        }
        SqliteSql sqliteSql = method.getAnnotation(SqliteSql.class);
        if (null != sqliteSql) {
            List<Object> param = new Vector<Object>();
            String[] paramNameArr = sqliteSql.params();
            if (null != paramNameArr && paramNameArr.length > 0) {
                Field[] fieldArray = this.targetClass.getDeclaredFields();
                for (String paramName : paramNameArr) {
                    Object value = null;
                    for (Field field : fieldArray) {
                        if (paramName.equalsIgnoreCase(field.getName())) {
                            value = readField(field, target);
                            break;
                        }
                    }
                    param.add(value);
                }

            }
            String sql = SqliteUtils.replace(sqliteSql.sql(), "this.tableName", this.tableName);
            //TODO 此处可以读取自定义 SQL 的辅助注解，像上面提到的 SqliteSqlWhereIf 注解，实现动态 SQL
            target.setCurrentSql(sql);
            target.setCurrentParam(param);
        }
    }
    /**
     * 创建自定义查询语句，参数随机
     */
    public String convertSelfSql(StackTraceElement daoMethodInfo, Object... params) {
        if (null == daoMethodInfo) {//为空不做处理
            System.out.println("未获取到自定义的语句！");
            return null;
        }
        Class<?>[] classArr = null;
        if (null != params && params.length > 0) {
            classArr = new Class<?>[params.length];
            for (int i = 0; i < params.length; i++) {
                classArr[i] = params[i].getClass();
            }
        }
        Method method = getMethod(daoMethodInfo.getClassName(), daoMethodInfo.getMethodName(), classArr);
        if (null == method) {//为空不做处理
            System.out.println("未获取到自定义的语句！");
            return null;
        }
        SqliteSql sqliteSql = method.getAnnotation(SqliteSql.class);
        //TODO 此处可以读取自定义 SQL 的辅助注解，像上面提到的 SqliteSqlWhereIf 注解，实现动态 SQL
        String sql = SqliteUtils.replace(sqliteSql.sql(), "this.tableName", this.tableName);
        return sql;
    }
    ...
}

# SqliteBaseDao.java
public abstract class SqliteBaseDao<T extends SqliteBaseEntity> {
    /**
     * 通过自定义注解执行查询的语句
     */
    public List<T> excuteQuery(T entity) {
        //[0] 为 getStackTrace 方法，[1] 当前的 excuteQuery 方法，[2] 为调用 excuteQuery 方法的方法
        StackTraceElement parrentMethodInfo = Thread.currentThread().getStackTrace()[2];
        this.sqlHelper.convertSelfSql(parrentMethodInfo, entity);
        String jsonStr = SqliteHelper.query(entity.getCurrentSql(), entity.getCurrentParam(), this.getColumMap());
        if (jsonStr == null) return null;
        List<T> result = SqliteUtils.getInstance(jsonStr, entity.getClass());
        if (SqliteUtils.isNotEmpty(result)) {
            return result;
        } else {
            return null;
        }
    }
    /**
     * 通过自定义注解执行查询的语句
     */
    public List<T> excuteQuery(Object... params) {
        //[0] 为 getStackTrace 方法，[1] 当前的 excuteQuery 方法，[2] 为调用 excuteQuery 方法的方法
        StackTraceElement parrentMethodInfo = Thread.currentThread().getStackTrace()[2];
        String sql = this.sqlHelper.convertSelfSql(parrentMethodInfo, params);
        List<Object> paramList = new Vector<Object>();
        if (null != params && params.length > 0) {
            for (Object o : params) {
                paramList.add(o);
            }
        }
        String jsonStr = SqliteHelper.query(sql, paramList, this.getColumMap());
        if (jsonStr == null) return null;
        List<T> result = SqliteUtils.getInstance(jsonStr, this.entityClazz);
        if (SqliteUtils.isNotEmpty(result)) {
            return result;
        } else {
            return null;
        }
    }
    ...    
}

# 实体 DAO 中使用如下
public class TestTableDao extends SqliteBaseDao<TestTable> {
    @SqliteSql(sql = "select t.create_time publish_time,t.* from this.tableName t where name like '%'||?||'%'", params = {"name"})
    public List<TestTable> getByName(TestTable entity) {
        //List<T> super.excuteQuery(T entity)，通过 params 上的参数顺序在 entity 中获取，并依次填充占位符
        return super.excuteQuery(entity);
    }
    @SqliteSql(sql = "select * from this.tableName where name like '%'||?||'%' or id=?")
    public List<TestTable> getByNameOrId(String name, Integer id) {
        //List<T> super.excuteQuery(Object... params)，这里的参数顺序对应自定义的 SQL 的占位符顺序
        return super.excuteQuery(name, id);
    }
    ...
}
```

另外，自定义 SQL 注解对于像 oracle 这样的存储过程和函数占比较大的数据库，调用存储过程可是无往不利，不过就不知道占位符返回集合的存储过程或函数，方不方便数据的填充组装（TODO）。

### 一个数据组装器

上面说到数据的组装，这也是比较关键的一个环节，只有这一步 OK 了，这个封装才算 OK。总所周知，数据库表字段类型五花八门，想要很好的和 java 的类型对应上，确实要花费一点精力。这里为了节省时间和篇幅，个人取了个巧，将数据统一转化为 JSON，然后统一通过 json 转对象。从代码上省去了复杂的类型对应，也摒弃了一个个取值，然后通过反射对应写值到对象属性里面的不安全操作及不确定异常，然而代价可能会对转化效率有影响。所以，关键就是需要一种不影响速度的 json 转化，fastjson 基本满足条件。

```java
# SqliteHelper.java
/**
 * 根据结果集返回数据 json
 */
public static String getDataJson(ResultSet rs, Map<String, String> columnMap) throws SQLException {
    String[] nameArr = null;
    List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
    int rows = 1;
    while (rs.next()) {
        if (rows++ == 1) {
            nameArr = getNameArr(rs);// 获取列名
        }

        Map<String, Object> one = new LinkedHashMap<String, Object>();
        for (int i = 0; i < nameArr.length; i++) {
            String nameKey = null == columnMap ? nameArr[i] : columnMap.get(nameArr[i]);
            nameKey = null == nameKey ? nameArr[i] : nameKey;
            one.put(nameKey, rs.getObject(i + 1));
        }
        result.add(one);
    }
    String dataStr = SqliteUtils.getJsonList(result);
    System.out.println("执行查询语句结果==> " + dataStr);
    return dataStr;
}
```

```java
# SqliteUtils.java
/**
 * 转换 List<Object> 为 Json 字符串
 */
public static String getJsonList(List list) {
    if (list == null) return "[]";
    StringBuffer jsonBuf = new StringBuffer("[");
    boolean flag = false;
    for (Object obj : list) {
        if (flag) {
            jsonBuf.append(",");
        }else{
            flag = true;
        }
        String jsonOne = getJsonObject(obj);
        jsonBuf.append(jsonOne);
    }
    jsonBuf.append("]");
    return jsonBuf.toString();
}
public static String getJsonObject(Object object) {
    try {
        String json = SqliteUtils.toString(JSONObject.fromObject(object));
        return json;
    } catch (Exception e) {
        e.printStackTrace();
        return "{}";
    }
}
/**
 * json 字符串转对象，转对集合
 * @param jsonString json 字符串
 * @param clazz 对象 class，如果要转化为 List<ObjectA> 传入 ObjectA.class
 * @return Object [返回类型说明]
 * @throws throws [违例类型] [违例说明]
 * @see [类、类#方法、类#成员]T
 */
public static <T> T getInstance(String jsonString, Class clazz) {
    if (SqliteUtils.isBlank(jsonString)) return null;
    if ("[]".equals(SqliteUtils.trim(jsonString))) return null;
    Object json = new JSONTokener(jsonString).nextValue();//字符串 转 json 类型对象
    if (json instanceof JSONObject) {  //这种   {"XXX": "101",{},[]} 对象
        return (T) SqliteJsonMapper.nonDefaultMapper().fromJson(json.toString(), clazz);
    } else {
        //如果集合不为 null 则是返回成功，则需要修改数据的时间
        //创建转换 json 的需要转换的集合类型   [{},{}]
        JavaType javaType = SqliteJsonMapper.nonDefaultMapper().contructCollectionType(List.class, clazz);
        return SqliteJsonMapper.nonDefaultMapper().fromJson(jsonString, javaType);//反序列化复杂 List
    }
}
```

## 验证和测试

### 定义表结构实体

```java
/**
 * 测试表对应实体类
 * @author 欧阳洁
 * @create 2017-09-30 9:44
 **/
@SqliteTable(name = "t_test_table")
public class TestTable extends SqliteBaseEntity {
    /**
     * 主键
     */
    @SqliteID
    private Integer id;
    /**
     * 名称
     */
    @SqliteColumn(type = "char(100)", notNull = true)
    private String name;
    /**
     * 作者
     */
    @SqliteColumn(notNull = true)
    private String author;
    /**
     * 正文
     */
    @SqliteColumn(type = "text")
    private String article;
    /**
     * 创建时间
     */
    @SqliteColumn(name = "create_time",type = "char(20)", notNull = true)
    private String createTime;
    /**
     * 查询类型 （非表字段）
     */
    @SqliteTransient
    private String searchType;
    /**
     * 发布时间 （非表字段）
     * 注：这里不使用 SqliteColumn 主键，默认的列名为 publishtime
     */
    @SqliteTransient
    @SqliteColumn(name = "publish_time")
    private String publishTime;

    //get、set 此处省略
}
```

### 定义实体对应的 Dao

```java
/**
 * Sqlite[t_test_table] 的 dao
 * @author 欧阳洁
 * @create 2017-09-29 17:17
 */
public class TestTableDao extends SqliteBaseDao<TestTable> {
    /**
     * 构造函数
     */
    public TestTableDao() {// 必须要对应实现父类的构造方法
        super(TestTable.class);// 表实体对应类
    }

    /**
     * 根据名称模糊查找数据
     * @param entity
     * @return
     */
    @SqliteSql(sql = "select t.create_time publish_time,t.* from this.tableName t where name like '%'||?||'%'", params = {"name"})
    public List<TestTable> getByName(TestTable entity) {
        //List<T> super.excuteQuery(T entity)，通过 params 上的参数顺序在 entity 中获取，并依次填充占位符
        return super.excuteQuery(entity);
    }

    /**
     * 根据名称模糊查找数据并包含 id 查找
     * @param name
     * @param id
     * @return
     */
    @SqliteSql(sql = "select * from this.tableName where name like '%'||?||'%' or id=?")
    public List<TestTable> getByNameOrId(String name, Integer id) {
        //List<T> super.excuteQuery(Object... params)，这里的参数顺序对应自定义的 SQL 的占位符顺序
        return super.excuteQuery(name, id);
    }
}
```

### 定义 Dao 对应的 Service

```java
/**
 * Sqlite[t_test_table] 的 service
 * @author 欧阳洁
 * @create 2017-09-30 15:16
 */
@Service
public class TestTableService extends SqliteBaseService<TestTable, TestTableDao> {
    public TestTableService() {// 必须要对应实现父类的构造方法
        super(TestTableDao.class);// 对应的 Dao 类
    }
    public List<TestTable> getByName(String name) {
        TestTable entity = new TestTable();
        entity.setName(name);
        return this.getBaseDao().getByName(entity);
    }
    public List<TestTable> getByNameOrId(String name, Integer id) {
        return this.getBaseDao().getByNameOrId(name, id);
    }
}
```

### 单元测试

```java
//默认的方法测试，包括初始化检查表是否存在并构建、对象插入、对象查询（主键穿透查询）
————————————————————————————————————————<SqliteTest.java>—————————————————————————————————————
@Test
public void test2() {
    TestTableService sqliteService = new TestTableService();//没有使用 spring 注入，暂时自己构建
    TestTable entity = new TestTable();
    entity.setName("test1");
    entity.setAuthor("petter");
    entity.setArticle("article1");
    entity.setCreateTime(MyDate.getStringDate());
    sqliteService.insert(entity);
    entity.setName("title2");
    entity.setAuthor("bob");
    entity.setArticle("article2");
    entity.setCreateTime(MyDate.getStringDate());
    sqliteService.insert(entity);

    TestTable queryEntity = new TestTable();
    sqliteService.query(queryEntity);
    queryEntity.setAuthor("petter");
    sqliteService.query(queryEntity);
    queryEntity.setName("test");
    sqliteService.query(queryEntity);
    queryEntity.setId(1);
    sqliteService.query(queryEntity);
}
```

test2() 测试结果：
> 执行非查询语句==> create table if not exists t_test_table(id integer  primary key autoincrement not null,name char(100)  not null,author char(20)  not null,article text ,<font color='red'>create_time</font> char(20)  not null)
执行非查询语句影响行数==> 0
执行非查询语句==> INSERT INTO t_test_table(name,author,article,create_time)values(?,?,?,?)
执行非查询语句影响行数==> 1
执行非查询语句==> INSERT INTO t_test_table(name,author,article,create_time)values(?,?,?,?)
执行非查询语句影响行数==> 1
执行查询语句==> SELECT * FROM t_test_table WHERE 1=1 
执行查询语句结果==> [{"id":1,"name":"test1","author":"petter","article":"article1","<font color='red'>createTime</font>":"2018-02-20 22:54:32"},{"id":2,"name":"title2","author":"bob","article":"article2","<font color='red'>createTime</font>":"2018-02-20 22:54:32"}]
执行查询语句==> SELECT * FROM t_test_table WHERE 1=1  and author=?
执行查询语句结果==> [{"id":1,"name":"test1","author":"petter","article":"article1","<font color='red'>createTime</font>":"2018-02-20 22:54:32"}]
执行查询语句==> SELECT * FROM t_test_table WHERE 1=1  and name=? and author=?
执行查询语句结果==> []
执行查询语句==> SELECT * FROM t_test_table WHERE 1=1  and id=?
执行查询语句结果==> [{"id":1,"name":"test1","author":"petter","article":"article1","<font color='red'>createTime</font>":"2018-02-20 22:54:32"}]

------------------------------------------------------------------------------------------------

```java
//自定义的 SQL 查询测试，包含自定义 SQL、结果集中额外列对应填充和查询对象属性值定位获取
——————————————————————————————————————<SqliteTest.java>——————————————————————————————————————
@Test
public void test3() {
    TestTableService sqliteService = new TestTableService();//没有使用 spring 注入，暂时自己构建
    List<TestTable> list = sqliteService.getByName("test");
}
```

test3() 测试结果：
> 执行非查询语句==> create table if not exists t_test_table(id integer  primary key autoincrement not null,name char(100)  not null,author char(20)  not null,article text ,create_time char(20)  not null)
执行非查询语句影响行数==> 0
执行查询语句==> select t.create_time publish_time,t.* from t_test_table t where name like '%'||?||'%'
执行查询语句结果==> [{"<font color='red'>publishTime</font>":"2018-02-20 22:36:18","id":1,"name":"test1","author":"petter","article":"article1","createTime":"2018-02-20 22:36:18"}]

------------------------------------------------------------------------------------------------

```java
//自定义的 SQL 查询测试，这里直接撇开了实体类，可以任意的传参了，甚至调用存储过程或函数只需要一行注解就够了
———————————————————————————————————————<SqliteTest.java>—————————————————————————————————————
@Test
public void test4() {
    TestTableService sqliteService = new TestTableService();//没有使用 spring 注入，暂时自己构建
    List<TestTable> list = sqliteService.getByNameOrId("title", 1);
}
```

> 执行非查询语句==> create table if not exists t_test_table(id integer  primary key autoincrement not null,name char(100)  not null,author char(20)  not null,article text ,create_time char(20)  not null)
执行非查询语句影响行数==> 0
执行查询语句==> select * from t_test_table where name like '%'||?||'%' or id=?
执行查询语句结果==> [{"id":1,"name":"test1","author":"petter","article":"article1","createTime":"2018-02-20 22:36:18"},{"id":2,"name":"title2","author":"bob","article":"article2","createTime":"2018-02-20 22:36:19"}]

## 源码

* Git 地址：[https://github.com/petterobam/my-sqlite](https://github.com/petterobam/my-sqlite)
* Git-wiki：[https://github.com/petterobam/my-sqlite/wiki/](https://github.com/petterobam/my-sqlite/wiki/)
* Git 检出地址：https://github.com/petterobam/my-sqlite.git
* 源码下载：[点击下载](http://www.oyjie.cn/upload/2018/02/rpdd0gs1vkhrvr3rlhh4khq8i6.rar)
