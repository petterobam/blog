---
layout: post
title: "JAVA WEB 注解相关规范速查表"
description: "JAVA WEB 注解经验分享"
categories: [整理]
tags: [Java, 注解]
redirect_from:
  - /2019/02/09/
---

## Spring 服务相关 Bean

- `@Service` 在业务逻辑层使用（service 层）
- `@Repository` 在数据访问层使用（dao 层）
- `@Component` 组件（以上都不是时使用）

### 服务 Bean 注入

- 统一使用 `@Autowired`（Spring 支持） 注入
- <span style="color:red;">【不推荐】再使用</span> `@Inject`（JSR-330）或`@Resource`（JSR-250）注入

## MVC 相关注解

### 基本注解

- `@Controller` 在控制器的声明（controller 层）
- `@RequestMapping` 用于映射 Web 请求，包括访问路径和参数（类或方法上）
- `@ResponseBody` 支持将返回值放在 response 内，而不是一个页面，通常用户返回 json 数据（返回值旁或方法上）
- `@RequestBody` 允许 request 的参数在 request 体中，而不是在直接连接在地址后面。（放在参数前）
- 【*】`@PathVariable` 用于接收路径参数，比如 @RequestMapping(“/hello/{name}”) 申明的路径，将注解放在参数中前，即可获取该值，通常作为 Restful 的接口实现方法（放在参数前）
- 【*】`@RestController` 该注解为一个组合注解，相当于 @Controller 和 @ResponseBody 的组合，注解在类上，意味着，该 Controller 的所有方法都默认加上了 @ResponseBody。

### 全局相关

- `@ExceptionHandler` （方法上）用于全局处理控制器里的异常
- `@InitBinder` （方法上）用来设置 WebDataBinder，WebDataBinder 用来自动绑定前台请求参数到 Model 中。
- `@ModelAttribute` （方法上）本来的作用是绑定键值对到 Model 里，在 @ControllerAdvice 中是让全局的 @RequestMapping 都能获得在此处设置的键值对。
- `@ControllerAdvice` （类上）通过该注解单独的配置类，我们可以将对于所有控制器的全局配置放置在同一个位置，注解了 @ControllerAdvice 的类的方法可使用 @ExceptionHandler、@InitBinder、@ModelAttribute 注解到方法上， 这对所有注解了 @RequestMapping 的控制器内的方法有效。

## 配置类注解

- `@Configuration` 声明当前类为配置类 （非 bean)，相当于 xml 形式的 Spring 配置（类上）
- `@Bean` 注解在方法上，声明当前方法的返回值为一个 bean，替代 xml 中的 `<bean id="xxxx">...</bean>` 方式（方法上）
- 【不推荐】`@Configuration + @Component` 注解，表明这个类是一个 bean，建议直接用服务注解（类上）
- 【不推荐】`@ComponentScan` 用于对 Component 进行扫描，相当于 xml 中的 `<context:component-scan .../>`（类上）
- 【不推荐】`@WishlyConfiguration` 为 @Configuration 与 @ComponentScan 的组合注解，可以替代这两个注解

### `@Scope` （类上 或 方法上->得有 @Bean） 

设置 Spring 容器如何新建 Bean 实例，其设置类型包括：

- Singleton （单例，一个 Spring 容器中只有一个 bean 实例，默认模式）
- Protetype （每次调用新建一个 bean）
- Request （web 项目中，给每个 http request 新建一个 bean）
- Session （web 项目中，给每个 http session 新建一个 bean）
- GlobalSession（给每一个 global http session 新建一个 Bean 实例）

## 配置属性值注入

### @PropertySource 加载配置文件（类上）

@PropertySource("classpath:resource/test.propertie")

### @Value 注解（非静态属性上）

- 【常用】注入配置文件

```java
@Value("${book.name}")
String bookName;
```

- 【*】注入表达式结果（一次性）

```java
@Value("#{ T(java.lang.Math).random() * 100 }")
String randomNumber;
```

- 【*】注入操作系统属性

```java
@Value("#{systemProperties['os.name']}")
String osName;
```

- 【*】注入其它 bean 属性

```java
@Value("#{domeClass.name}")
String name;
```

- 【*】注入文件资源

```java
@Value("classpath:com/baidu/baihui/test/test.txt")
String Resource file;
```

- 【不推荐】注入网站资源

```java
@Value("http://www.cznovel.com")
Resource url;
```

- 【不推荐】注入普通字符

```java
@Value("Michael Jackson")
String name;
```

## Hibernate 注解

### 类级别的注解

- `@Entity` （类上）@Entity(name = "tableName") - 必须，将映射到指定的数据库表，属性： name - 写 HQL 时候用的，默认类名
- `@Table` （类上） @Table(name = "", catalog = "", schema = "")  - 可选，通常和@Entity 配合使用，只能标注在实体的 class 定义处，表示实体对应的数据库表的信息，属性：name - 可选，表示表的名称，默认的表名和实体名称一致，只有在不一致的情况下才需要指定表名

### 属性级别的注解

属性级别的注解，放在属性上或放在其对应的 getter 前

- `@Id` 映射生成主键
- `@GeneratedValue` 定义主键生成策略
- `@SequenceGenerator` 声明了一个数据库序列
- `@Column` 映射表的列
- `@Transient` 定义暂态属性，非表字段
- `@Version` 定义乐观锁
- `@Basic` 声明属性的存取策略

#### 主键相关注解

- @Id - 必须，定义了映射到数据库表的主键的属性，一个实体只能有一个属性被映射为主键

- @GeneratedValue(strategy = GenerationType , generator="") - 可选，用于定义主键生成策略
	* strategy - 表示主键生成策略，取值有：
	* GenerationType.AUTO 根据底层数据库自动选择（默认），若数据库支持自动增长类型，则为自动增长
	* GenerationType.INDENTITY 根据数据库的 Identity 字段生成，支持 DB2、MySQL、MS、SQL Server、SyBase 与 HyperanoicSQL 数据库的 Identity 类型主键
	* GenerationType.SEQUENCE 使用 Sequence 来决定主键的取值，适合 Oracle、DB2 等支持 Sequence 的数据库，一般结合@SequenceGenerator 使用（Oracle 没有自动增长类型，只能用 Sequence）
	* GenerationType.TABLE  使用指定表来决定主键取值，结合@TableGenerator 使用
	* generator - 表示主键生成器的名称，这个属性通常和 ORM 框架相关 , 例如：Hibernate 可以指定 uuid 等主键生成方式
	
- @SequenceGenerator — 注解声明了一个数据库序列
	* name - 表示该表主键生成策略名称，它被引用在@GeneratedValue 中设置的“gernerator”值中
	* sequenceName - 表示生成策略用到的数据库序列名称
	* initialValue - 表示主键初始值，默认为 0
	* allocationSize - 每次主键值增加的大小，例如设置成 1，则表示每次创建新记录后自动加 1，默认为 50

#### 非主键相关注解

- @Version - 可以在实体 bean 中使用@Version 注解，通过这种方式可添加对乐观锁定的支持，[见参考](https://www.cnblogs.com/xiluhua/p/4381056.html)

- @Basic - 用于声明属性的存取策略：
	* @Basic(fetch=FetchType.EAGER) 即时获取（默认的存取策略）
	* @Basic(fetch=FetchType.LAZY) 延迟获取
	
- @Column - 可将属性映射到列，使用该注解来覆盖默认值，@Column 描述了数据库表中该字段的详细定义
	* name - 可选，表示数据库表中该字段的名称，默认情形属性名称一致
	* nullable - 可选，表示该字段是否允许为 null，默认为 true
	* unique - 可选，表示该字段是否是唯一标识，默认为 false
	* length - 可选，表示该字段的大小，仅对 String 类型的字段有效，默认值 255
	* insertable - 可选，表示在 ORM 框架执行插入操作时，该字段是否应出现 INSETRT 语句中，默认为 true
	* updateable - 可选，表示在 ORM 框架执行更新操作时，该字段是否应该出现在 UPDATE 语句中，默认为 true。对于一经创建就不可以更改的字段，该属性非常有用，如对于 birthday 字段
	* columnDefinition - 可选，表示该字段在数据库中的实际类型。通常 ORM 框架可以根据属性类型自动判断数据库中字段的类型，但是对于 Date 类型仍无法确定数据库中字段类型究竟是 DATE,TIME 还是 TIMESTAMP. 此外 ,String 的默认映射类型为 VARCHAR, 如果要将 String 类型映射到特定数据库的 BLOB 或 TEXT 字段类型，该属性非常有用
	
- @Transient - 可选，表示该属性并非一个到数据库表的字段的映射，ORM 框架将忽略该属性，如果一个属性并非数据库表的字段映射，就务必将其标示为@Transient，否则 ORM 框架默认其注解为 @Basic

### 映射实体类的关联关系注解

<span style="color:red;">不推荐使用</span>，特别是多对多关系的注解，使用的时候最好都设置为 Fetch.LAZY 延迟加载

1. 单向一对多：一方有集合属性，包含多个多方，而多方没有一方的引用。
2. 单向多对一：多方有一方的引用，一方没有多方的引用。
3. 双向一对多：两边都有多方的引用，方便查询。
4. 双向多对一：两边都有多方的引用，方便查询。
5. 单向多对多：需要一个中间表来维护两个实体表。
6. 单向一对一：数据唯一，数据库数据也是一对一。
7. 主键相同的一对一：使用同一个主键，省掉外键关联。

3.3.1 关联映射的一些共有属性

- `@JoinColumn` - 可选，用于描述一个关联的字段。@JoinColumn 和@Column 类似，描述的不是一个简单字段，而是一个关联字段，例如描述一个 @ManyToOne 的字段。
	* 即用来定义外键在我们这个表中的属性名，例如实体 Order 有一个 User user 属性来关联实体 User，则 Order 的 user 属性为一个外键
	* name - 该字段的名称，由于@JoinColumn 描述的是一个关联字段，如 ManyToOne, 则默认的名称由其关联的实体决定

- `@OneToOne、@OneToMany、@ManyToOne、ManyToMany` 的共有属性：
	* fetch - 配置加载方式。取值有：
		* Fetch.EAGER -  及时加载，多对一默认是 Fetch.EAGER 
		* Fetch.LAZY - 延迟加载，一对多默认是 Fetch.LAZY
	* cascade - 设置级联方式，取值有：
		* CascadeType.PERSIST - 保存  - 调用 JPA 规范中的 persist()，不适用于 Hibernate 的 save() 方法
		* CascadeType.REMOVE - 删除  - 调用 JPA 规范中的 remove() 时，适用于 Hibernate 的 delete() 方法
		* CascadeType.MERGE - 修改  - 调用 JPA 规范中 merge() 时，不适用于 Hibernate 的 update() 方法 
		* CascadeType.REFRESH - 刷新  - 调用 JPA 规范中的 refresh() 时，适用于 Hibernate 的 flush() 方法
		* CascadeType.ALL - 全部  - JPA 规范中的所有持久化方法
	* targetEntity - 配置集合属性类型，如：@OneToMany(targetEntity=Book.class)

#### 一对一

```
@OneToOne – 表示一个一对一的映射

1. 主表类 A 与从表类 B 的主键值相对应。

主表：
 
@OneToOne(cascade = CascadeType.ALL)
@PrimaryKeyJoinColumn
private B b;
 
从表：无

2. 主表 A 中有一个从表属性是 B 类型的 b

主表：

@OneToOne(cascade = CascadeType.ALL) 
@JoinColumn(name="主表外键")   //这里指定的是数据库中的外键字段。
private B b;

从表：无

3. 主表 A 中有一个从表属性是 B 类型的 b，同时，从表 B 中有一个主表属性是 A 类型的 a

主表：
@OneToOne(cascade = CascadeType.ALL)
@JoinColumn(name="主表外键")   //这里指定的是数据库中的外键字段。
private B b;

从表：

@OneToOne(mappedBy = "主表类中的从表属性")
private 主表类 主表对象；

注意：@JoinColumn 是可选的。默认值是从表变量名+"_"+从表的主键（注意，这里加的是主键。而不是主键对应的变量）。
```

#### 多对一

```
@ManyToOne - 表示一个多对一的映射，该注解标注的属性通常是数据库表的外键。

1. 单向多对一：多方有一方的引用，一方没有多方的引用。

在多方

@ManyToOne(targetEntity=指定关联对象。class)
@JoinColumn(name="指定产生的外键字段名")

2. 双向多对一（不推荐）：容易引起循环依赖，比如 fastjson 序列化时候

1）在多方

@ManyToOne
@JoinColumn(name="自己的数据库外键列名")

2）在一方

@OneToMany(mappedBy="多端的关联属性名")
@JoinColumn(name="对方的数据库外键列名")
```

#### 一对多

```
@OneToMany - 描述一个一对多的关联，该属性应该为集合类型，在数据库中并没有实际字段。

1. 单向一对多：一方有集合属性，包含多个多方，而多方没有一方的引用。

@OneToMany  默认会使用连接表做一对多关联
添加@JoinColumn(name="xxx_id") 后，就会使用外键关联，而不使用连接表了。

2. 双向一对多（不推荐）：容易引起循环依赖，比如 fastjson 序列化时候

1）在多方

@ManyToOne
@JoinColumn(name="自己的数据库外键列名")

2）在一方

@OneToMany(mappedBy="多端的关联属性名")
@JoinColumn(name="对方的数据库外键列名")
```

#### 多对多

```
@ManyToMany - 可选，描述一个多对多的关联。

属性：

targetEntity - 表示多对多关联的另一个实体类的全名，例如：package.Book.class
mappedBy - 用在双向关联中，把关系的维护权翻转。

 

1. 单向多对多关联：

    在主控方加入 @ManyToMany 注解即可。

2. 双向多对多关联（不推荐）：容易引起循环依赖，比如 fastjson 序列化时候

    两个实体间互相关联的属性必须标记为 @ManyToMany，并相互指定 targetEntity 属性。有且只有一个实体的 @ManyToMany 注解需要指定 mappedBy 属性，指向 targetEntity 的集合属性名称。
```

### 其他注解

 @DiscriminatorValue - <span style="color:red;">不推荐使用</span>，一张表对应一整棵类继承树时，该类别对应的“表 part”

首先参考这篇文章，很重要：[hibernate 映射继承关系](https://my.oschina.net/jawava/blog/59064)：一张表对应一整棵类继承树，从文中可以知道，用一个表来存储对应的整个类别的数据，比如有 Cat 和 Animal，Cat 是 Animal 的子类，我仅用 Animal 一个表来存储 Animal 和 Cat 的字段和数据，而不是分成两个表。那么当我进行映射关系的时候，假如我要 Cat 类映射到 Animal 中 Cat 的部分，如何处理？在 Animal 中定义一个字段用来区分不同的表，比如 Animal 表中我额外增加字段名为 Type，那么在 Animal 这一张表中，我们本属于 Animal 表内容的，该字段我们设置为 animal，本属于 Cat 表的，该字段我们设置为 cat。你可以理解为，新增加字段来用以在同一个表中区分不同类别的内容。

所以对应在注解上的使用的一个映射关系表示，就是这样的：对于”父类“，即准备用来囊括所有内容的那个表，我们需要定义这个对应的类为 

@DiscriminatorColumn(name = "xxx", discriminatorType = DiscriminatorType.xxx) 

这里的 name 就是指定表中用来区别各类内容的字段，而对于”子类“，我们需要注解标明@DiscriminatorValue(xxx)，这里的 xxx 即对应了父类中的 “区别用字段” 里的标识。

举例来说，就是假如我们希望将 Animal 和 Cat 的内容都只存储在 Animal 这张表里，那么为了区分内容，我们对于 Animal 这个表新增某字段如 type；Animal 的类，注解为

@DiscriminatorColumn(name = "type", discriminatorType = DiscriminatorType.STRING) ，同时设置@DiscriminatorValue("animal")；

Cat extends Animal，Cat 的类，注解为@DiscriminatorValue(“cat")；那么 Animal 这个表中，字段 type 中，为 animal 的元组映射 Animal 类，为 cat 的元组映射 Cat 类。

而这种方式，多用于数据库字典概念。

@Transient

如果某个属性不需要被持久化，可以加上 @javax.persistence.Transient 注解或者使用 java 的 transient 关键字

@Lob

实体 BLOB（<span style="color:red;">不建议</span>）、CLOB 类型的注解：

```
BLOB 类型的属性声明为 byte[] 或者 java.sql.Blob，多用来直接将文件存储在数据库字段中（如图片）

@Lob 
@Basic(fetch=FetchType.LAZY)
@Column(name="IMGS", columnDefinition="BLOB", nullable=true)
private byte[] imgs;

CLOB 类型的属性声明为 String 或 java.sql.Clob

@Lob 
@Basic(fetch = FetchType.EAGER) 
@Column(name="REMARK", columnDefinition="CLOB", nullable=true)
private String remark;
```

详见参考 [Hibernate 的 Annotation 实体 BLOB、CLOB 类型注解](http://blog.sina.com.cn/s/blog_4f925fc30102eaio.html)

## 切面（AOP）相关注解

<span style="color:red;">不建议</span>在业务代码中使用，如果有需要请使用代理模式或装饰模式实现

- `@Aspect` 声明一个切面（类上） 使用 `@After`、`@Before`、`@Around` 定义建言（advice），可直接将拦截规则（切点）作为参数。
	* `@After` 在方法执行之后执行（方法上） 
	* `@Before` 在方法执行之前执行（方法上） 
	* `@Around` 在方法执行之前与之后执行（方法上）
- `@PointCut` 声明切点 在 java 配置类中使用 `@EnableAspectJAutoProxy` 注解开启 Spring 对 AspectJ 代理的支持（类上）

## 定时任务相关

<span style="color:red;">不建议</span>使用，定时任务请参照统一的定时任务做法

- `@EnableScheduling` 在配置类上使用，开启计划任务的支持（类上）
- `@Scheduled` 来申明这是一个任务，包括 cron,fixDelay,fixRate 等类型（方法上，需先开启计划任务的支持）

## 异步相关

<span style="color:red;">不建议</span>随便使用

- `@EnableAsync` 配置类中，通过此注解开启对异步任务的支持，叙事性 AsyncConfigurer 接口（类上）
- `@Async` 在实际执行的 bean 方法使用该注解来申明其是一个异步任务（方法上或类上所有的方法都将异步），需要 @EnableAsync 开启异步任务

## `@Enable*` 注解说明

这些注解主要用来开启对 xxx 的支持，<span style="color:red;">不建议</span>随便使用
 
- `@EnableAspectJAutoProxy` 开启对 AspectJ 自动代理的支持
- `@EnableAsync` 开启异步方法的支持
- `@EnableScheduling` 开启计划任务的支持
- `@EnableWebMvc` 开启 Web MVC 的配置支持
- `@EnableConfigurationProperties` 开启对 @ConfigurationProperties 注解配置 Bean 的支持
- `@EnableJpaRepositories` 开启对 SpringData JPA Repository 的支持
- `@EnableTransactionManagement` 开启注解式事务的支持
- `@EnableCaching` 开启注解式的缓存支持

## 测试相关注解

- @RunWith 运行器，Spring 中通常用于对 JUnit 的支持 

```java
@RunWith(SpringJUnit4ClassRunner.class)
```
	
- @ContextConfiguration 用来加载配置 ApplicationContext，其中 classes 属性用来加载配置类 

```java
@ContextConfiguration(classes={TestConfig.class})
```

## 环境切换

<span style="color:red;">不推荐</span>使用

- `@Profile` 通过设定 Environment 的 ActiveProfiles 来设定当前 context 需要使用的配置环境。（类或方法上）
- `@Conditional` Spring4 中可以使用此注解定义条件话的 bean，通过实现 Condition 接口，并重写 matches 方法，从而决定该 bean 是否被实例化。（方法上）