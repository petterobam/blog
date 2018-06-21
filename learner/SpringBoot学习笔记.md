SpringBoot学习笔记
====================

## 环境支持

>JDK8+

## 学习基础

>Spring MVC
>Maven

## 部署SpringBoot

### SpringBoot支持

```
<parent>
	<groupld>org.springframework.boot</groupld>
	<artifactld>spring-boot-starter-parent</artifactld>
	<version>1.5.9.RELEASE</version>
</parent>
```

### 增加Web支持

```
<dependency>
	<groupid>org.springframework.boot</groupid>
	<artifactid>spring-boot-starter-web</artifactid>
</dependency>
```

### 热部署支持

```
<dependency>
	<groupid>org.springframework.boot</groupid>
	<artifactid>spring-boot-devtools</artifactid>
	<optional>true</optional>
</dependency>
```

### RESTFul支持

```
@RestController
```

### 服务器配置

|属性|描述|
|----|----|
|server.address |服务器E 绑定地址，如果你的主机上有多个网卡，可以绑定一个IP 地址|
|server.session.timeout |会话过期时间，以秒为单位|
|server.eηor.path |服务器出错后的处理路径le盯or ，我们在第4 章己经介绍过如何处理异常|
|server.servlet.contextpath |Spring Boot 应用的上下文|
|server.port Spring Boot |应用监听端口|

### 配置启动信息

resources目录下新建一个 banner.txt ，启动时候会输出 banner.txt 里面的内容。

浏览器显示的 logo 小图标 ，可以在顶层布局页面里添加:

```html
<link rel="shortcut icon" href="图片地址"/>
```

或在 resources/static 目录下添加 favicon.ico 图标文件，默认也会覆盖 spring boot 的默认图标

## 日志配置

application.properties 中加入以下代码：
```
logging.level.root=info
# org 包下的日志级别 指定默认的级别是 info ，但包名是 org 开头的类，日志级别是 warn 。 org 包名的类大多是第三方依赖库， 有时候没有必要显示 INFO 级别， com.xxx 开头的类使用 debug 。
logging.level.org=warn
logging.level.com.xxx=debug
# Spring Boot 默认井未输出日志到文件，可以指定日志输出
logging.file=my.log
# 日志输出到 my.log 中，位于 Spring Boot 应用运行的当前目录，比如项目工程目录下，也
可以指定日志存放的路径
logging.path=e:/temp/log
# Spring Boot 支持对控制台日志输出和文件输出进行格式控制，代码如下（仅使用内置的 logback )
logging.pattern.console=%level %date{HH:mm : ss} %logger{20}. %M %L:%m%n
logging.pattern.file=%level %date{IS08601} [%thread]%logger {20}.%M %L:%m%n

• %level ， 表示输出日志级别。
• %date ，表示日志发生时的时间， HH:mm：“输出时分秒，比较合适用于控制台查看，IS08601 则是标准日期输出 ，相当于 yyyy-MM-dd HH:mm:ss.SSS 。
• %logger ， 用于输出Logger 的名字，包名＋类名，{n} 限定了输出长度，如果输出长度不够，尽可能显示类名、压缩包名。
• %thread ，当前线程名。
• %L ，日志调用所在代码行，线上运行时不建议使用此参数，因为获取代码行对性能有消耗。
• %p ， 输出日志信息的优先级，即DEBUG，INFO，WARN，ERROR，FATAL。
• %d ， 输出日志时间点的日期或时间，默认格式为ISO8601，也可以在其后指定格式，如 ， %d{yyyy/MM/ddHH:mm:ss,SSS}。
• %r ， 输出自应用程序启动到输出该log信息耗费的毫秒数。
• %t ， 输出产生该日志事件的线程名。
• %l ， 输出日志事件的发生位置，相当于%c.%M(%F:%L)的组合，包括类全名、方法、文件名以及在代码中的行数。例如 ， test.TestLog4j.main(TestLog4j.java:10)。
• %c ， 输出日志信息所属的类目，通常就是所在类的全名。
• %M ， 输出产生日志信息的方法名。
• %F ， 输出日志消息产生时所在的文件名称。
• %m: ， 输出代码中指定的具体日志信息。
• %n ， 输出一个回车换行符，Windows平台为"\r\n"，Unix平台为"\n"。
• %x ， 输出和当前线程相关联的NDC(嵌套诊断环境)，尤其用到像 java servlets 这样的多客户多线程的应用中。
• %% ， 输出一个"%"字符。
• 另外，还可以在%与格式字符之间加上修饰符来控制其最小长度、最大长度、和文本的对齐方式。如 ，
	1) c ， 指定输出category的名称，最小的长度是20，如果category的名称长度小于20的话，默认的情况下右对齐。
	2)%-20c ， "-"号表示左对齐。
	3)%.30c ， 指定输出category的名称，最大的长度是30，如果category的名称长度大于30的话，就会将左边多出的字符截掉，但小于30的话也不会补空格。
```

也可以通过在 resources 目录下使用 logback.xml 或者 logback-spring.xml 来对 Logback 进行更详细的配置。

- org.apache.log4j.ConsoleAppender（控制台）
- org.apache.log4j.FileAppender（文件）
- org.apache.log4j.DailyRollingFileAppender（每天产生一个日志文件）
- org.apache.log4j.RollingFileAppender（文件大小到达指定尺寸的时候产生一个新的文件）
- org.apache.log4j.WriterAppender（将日志信息以流格式发送到任意指定的地方）

```
<?xml version="1.0" encoding="UTF-8"?>
<included>
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
    ​
    <springProperty scope="context" name="springAppName" source="spring.application.name"/>
    <springProperty scope="context" name="destination" source="logstash.destination"/>
    <springProperty scope="context" name="kafkadestination" source="kafka.destination"/>
    <conversionRule conversionWord="ip" converterClass="cn.xxx.IPLogConfig" />
    <!-- Example for logging into the build folder of your project -->
    <property name="LOG_FILE" value="${log_file_path:-build}/logs/${springAppName}/${hostname}/${springAppName}"/>​

    <!-- You can override this to have a custom pattern -->
    <property name="CONSOLE_LOG_PATTERN"
              value="%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint} %clr(${LOG_LEVEL_PATTERN:-%5p}) %clr(${PID:- }){magenta} %clr(---){faint} %clr([%15.15t]){faint} %clr(%-40.40logger{39}){cyan} %clr(:){faint} %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}"/>

    <!-- Appender to log to console -->
    <appender name="console" class="ch.qos.logback.core.ConsoleAppender">
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <!-- Minimum logging level to be presented in the console logs-->
            <level>DEBUG</level>
        </filter>
        <encoder>
            <pattern>${CONSOLE_LOG_PATTERN}</pattern>
            <charset>utf8</charset>
        </encoder>
    </appender>

    <!-- Appender to log to file -->​
    <appender name="flatfile" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_FILE}</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_FILE}.%d{yyyy-MM-dd}.gz</fileNamePattern>
            <maxHistory>7</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>${CONSOLE_LOG_PATTERN}</pattern>
            <charset>utf8</charset>
        </encoder>
    </appender>

    <!-- Appender to log to file in a JSON format -->
    <appender name="logstashFile" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_FILE}.json</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_FILE}.json.%d{yyyy-MM-dd}.gz</fileNamePattern>
            <maxHistory>7</maxHistory>
        </rollingPolicy>
        <encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder" charset="UTF-8">
            <!-- 使用自定义的JsonFactory的装饰器,禁用jackson对非ascii码字符进行escape编码 -->
            <jsonFactoryDecorator class="org.xxx.MyJsonFactoryDecorator"/>
            <providers>
                <timestamp>
                    <timeZone>UTC</timeZone>
                </timestamp>
                <pattern>
                    <pattern>
                        {
                        "createTime": "%d{yyyy-MM-dd HH:mm:ss.SSS}",
                        "severity": "%level",
                        "service": "${springAppName:-}",
                        "trace": "%X{X-B3-TraceId:-}",
                        "span": "%X{X-B3-SpanId:-}",
                        "parent": "%X{X-B3-ParentSpanId:-}",
                        "exportable": "%X{X-Span-Export:-}",
                        "pid": "${PID:-}",
                        "restUrl":"%X{restUrl}",
                        "thread": "%thread",
                        "class": "%logger{40}",
                        "line_number": "%line",
                        "info": "%message",
                        "stack_trace": "%exception{5}",
                        "host":"%ip"
                        }
                    </pattern>
                </pattern>
                <stackTrace>
                    <throwableConverter class="net.logstash.logback.stacktrace.ShortenedThrowableConverter">
                        <maxDepthPerThrowable>2</maxDepthPerThrowable>
                        <maxLength>2048</maxLength>
                        <rootCauseFirst>true</rootCauseFirst>
                    </throwableConverter>
                </stackTrace>
            </providers>
        </encoder>
    </appender>

    <!-- Appender to log to file in a JSON format -->
    <appender name="logstash" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
        <destination>${destination}</destination>
        <encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder" charset="UTF-8">
            &lt;!&ndash; 使用自定义的JsonFactory的装饰器,禁用jackson对非ascii码字符进行escape编码 &ndash;&gt;
            <jsonFactoryDecorator class="org.xxx.MyJsonFactoryDecorator"/>
            <providers>
                <timestamp>
                    <timeZone>UTC</timeZone>
                </timestamp>
                <pattern>
                    <pattern>
                        {
                        "createTime": "%d{yyyy-MM-dd HH:mm:ss.SSS}",
                        "severity": "%level",
                        "service": "${springAppName:-}",
                        "trace": "%X{X-B3-TraceId:-}",
                        "span": "%X{X-B3-SpanId:-}",
                        "parent": "%X{X-B3-ParentSpanId:-}",
                        "exportable": "%X{X-Span-Export:-}",
                        "pid": "${PID:-}",
                        "restUrl":"%X{restUrl}",
                        "thread": "%thread",
                        "clazz": "%logger{40}",
                        "linenumber": "%line",
                        "info": "%message",
                        "stacktrace": "%exception{5}",
                        "host":"%ip"
                        }
                    </pattern>
                </pattern>
            </providers>
        </encoder>
    </appender>

    <!-- This is the kafkaAppender -->
    <appender name="kafkaAppender" class="com.github.danielwegener.logback.kafka.KafkaAppender">
        <encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder" charset="UTF-8">
            <!-- 使用自定义的JsonFactory的装饰器,禁用jackson对非ascii码字符进行escape编码 -->
            <jsonFactoryDecorator class="org.xxx.MyJsonFactoryDecorator"/>
            <providers>
                <timestamp>
                    <timeZone>UTC</timeZone>
                </timestamp>
                <pattern>
                    <pattern>
                        {
                        "createTime": "%d{yyyy-MM-dd HH:mm:ss.SSS}",
                        "severity": "%level",
                        "service": "${springAppName:-}",
                        "trace": "%X{X-B3-TraceId:-}",
                        "span": "%X{X-B3-SpanId:-}",
                        "parent": "%X{X-B3-ParentSpanId:-}",
                        "exportable": "%X{X-Span-Export:-}",
                        "pid": "${PID:-}",
                        "restUrl":"%X{restUrl}",
                        "thread": "%thread",
                        "clazz": "%logger{40}",
                        "linenumber": "%line",
                        "info": "%message",
                        "stacktrace": "%exception{5}",
                        "host":"%ip"
                        }
                    </pattern>
                </pattern>
            </providers>
        </encoder>
        <topic>logs</topic>
        <keyingStrategy class="com.github.danielwegener.logback.kafka.keying.NoKeyKeyingStrategy"/>
        <deliveryStrategy class="com.github.danielwegener.logback.kafka.delivery.AsynchronousDeliveryStrategy"/>

        <!-- Optional parameter to use a fixed partition -->
        <!-- <partition>0</partition> -->

        <!-- Optional parameter to include log timestamps into the kafka message -->
        <!-- <appendTimestamp>true</appendTimestamp> -->

        <!-- each <producerConfig> translates to regular kafka-client config (format: key=value) -->
        <!-- producer configs are documented here: https://kafka.apache.org/documentation.html#newproducerconfigs -->
        <!-- bootstrap.servers is the only mandatory producerConfig -->
        <producerConfig>bootstrap.servers=${kafkadestination}</producerConfig>

        <!-- this is the fallback appender if kafka is not available. -->
        <appender-ref ref="flatfile"/>
    </appender>

    <appender name="ASYNC" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="kafkaAppender" />
    </appender>

    <!--生产环境-->
    <logger name="druid.sql.Statement" level="DEBUG"/>
    <root level="INFO">
        <appender-ref ref="console"/>
        <appender-ref ref="ASYNC"/>
    </root>
    <jmxConfigurator/>
</included>
```

## 打包配置

1.以 jar 文件运行

```
<build>
	<plugins>
		<plugin>
		<groupid>org.springframework.boot</groupid>
		<artifactid>spring-boot-maven-plugin</artifactid>
		<configuration>
			<executable>true</executable>
		</configuration>
		</plugin>
	</plugins>
</build>
```

2.以 war 方式部署

```
<project ...>
	<artifactid>ch8.deploy</artifactid>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>war</packaging>
</project>

<dependencies >
	< !--…-->
	<dependency>
		<groupid>org.springframework.boot</groupid>
		<artifactid>spring-boot-starter-tomcat</artifactid>
		<scope>provided</scope>
	</dependency>
	<!--...-->
</dependencies>
```

另外 启动类还要实现 SpringBootServletinitializer

```java
@SpringBootApplication
public class Ch8Application extends SpringBootServletinitializer {
	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(Ch8Application.class) ;
	}
	public static void main(String[] args) {
		SpringApplication.run(Ch8Application.class, args) ;
	}
}
```

## 多环境部署

需要在 resource 下创建 application-{profile}.properties 的配置文件， 其中 profile 可以是任意名字，比如：

* test ， 表示测试环境
* prod ，表示线上环境
* pre-prod ， 预发布环境
* demo1.0 ， 1.0 版本演示环境


在环境变量中， spring.profiles.active 指定使用哪个profile ， 比如：

>java -jar -Dspring.profiles.active=prod target/ch8.deploy-0.0.1-SNAPSHOT.jar

以上配置启动后， Spring Boot 将读取 resources/application-prod.properties 配置文件，覆盖默认的application. properties 选项。application. properties 的内容如下：

>server . port=8080

application-prod.properties 的内容如下：

>server.port=9000

如果使用war 方式部署， 添加系统属性是比较好的方式，下面以Tomcat 为例进行说明。编辑 catalina . sh ， 在sh 文件的开头部分添加如下内容：

>JAVA_OPTS ="-Dspring.profiles.active=prod"

在多环境部署中，通常 resources 目录下可能没有目标环境的配置文件 ，这主要是为了安全考虑，开发环境不应该有线上环境的各种配置信息。可以将配置文件放到特定的目录中，并用 spring.config.location 指定配置文件的目录：

>java -jar -Dspring.config.location=file:env/ -Dspring.profiles.active=test target/ch8.deploy-0.0.1-SNAPSHOT.jar

@Profile 搭配 @Bean 、@Configuration 等自动执行配置可以定义在不同环境下是否生效，例如：

- @Profile({"test", "prod"}) ，测试环境和线上环境生效
- @Profile({"test", "!prod"}) ，测试环境和非线上环境生效

## 测试用例

```
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-test</artifactId>
</dependency>
```

```java
@RunWith(SpringRunner.class)
// 需要测试的Controller
@WebMvcTest(UserController.class)
public class UserControllerTest{
	@Autowired
	private MockMvc mvc ;
	@MockBean
	UserService userService ;
	@Test
	public void testMvc() throws Exception {
		int userid = 10 ;
		int expectedCredit = 100 ;
		// 模拟userService
		given(this.userService.getCredit(userid)).wil1Return(l00);
		// mvc 调用
		mvc.perform(get("user/{Id}", userid)).andExpect(content().string(String.valueOf(expectedCredi t)));
	}
}
```

### mockMvc模拟请求
1.模拟－个Post请求：
```java
mockMvc.perform(get("/hotels?foo={foo}","bar"));
```

2.模拟－个Post请求：
```java
mockMvc.perform(post("/hotels/{id}", 42) ;
```

3.模拟文件上传：
```java
mockMvc.perform(multipart("/doc").file("file","文件内容".getBytes("UTF-8")));
```

4.模拟请求参数：
```java
//模拟提交message 参数
mvc.perform(get("/user/{id}/{name}", userid, name).param("message","hello"));
//模拟一个checkbox提交
mvc.perform(get("/user/{id}/{name}",userid,name).param("job"，"IT"，"gov").param(...));
//直接使用MultiValueMap 构造参数
LinkedMul ti ValueMap pa rams = new LinkedMul ti ValueMap () ;
pararns.put("message","hello");
pararns.put("job","IT");
pararns.put("job","gov");
mvc.perforrn(get("/user/{id)/{narne}",user!d,name).param(params));
```

5.模拟Session和Cookie:
```java
mvc.perforrn(get("/user.html").sessionAttr(name,value));
mvc.perforrn(get("/user.html").cookie(new Cookie(name, value))) ;
```

6.设置HTTP Body 内容，比如提交的JSON:
```java
String json = mvc.perforrn(get("/user.html").content(json));
```

7.设置HTTP Header:
```java
mvc.perforrn(get("/user/{id}/{narne}",userid,narne)
	.contentType("application/x-www-forrn-urlencoded")//HTTP提交内容
	.accept("application/json")//期望返回内容
	.header(headerl,valuel)) //设直HTTP头
```

### Mockito模拟数据

```java
@RunWith(MockitoJUnitRunner.class)
public class CreditServiceMockTest{
	@Test
	public void test(){
		int userid = 10;
		//创建Mock 对象
		CreditSystemService creditService= mock(CreditSystemService.class);
		//模拟Mock 对象调用，传入任何 int 位都将返回1000 积分
		when(creditServrice.getUserCredit(anyInt())).thenReturn(1000);
		//when(creditService.getUserCredit(any(int.class))).thenReturn(lOOO);
		//实际调用
		int ret = creditService . getUserCredit(lO);
		// 比较期望值和返回佳
		assertEquals(1000 , ret);
	}
}
```

## 集成Swagger

### Swagger2

1.Maven依赖添加
```
<dependency>
	<groupId>io.springfox</groupId>
	<artifactId>springfox-swagger2</artifactId>
	<version>2.6.1</version>
</dependency>

<dependency>
	<groupId>io.springfox</groupId>
	<artifactId>springfox-swagger-ui</artifactId>
	<version>2.6.1</version>
</dependency>
```
2.配置添加
```
@Configuration
@EnableSwagger2
public class Swagger2 {
    @Bean
    public Docket createRestApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.forezp.controller"))
                .paths(PathSelectors.any())
                .build();
    }
    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("SpringBoot利用Swagger构建Api文档")
                .description("简单优雅的Restfun风格，http://blog.csdn.net/forezp")
                .termsOfServiceUrl("http://blog.csdn.net/forezp")
                .version("1.0")
                .build();
    }
}
```
3.添加文档描述
- @Api：修饰整个类，描述Controller的作用
- @ApiOperation：描述一个类的一个方法，或者说一个接口
- @ApiParam：单个参数描述
- @ApiModel：用对象来接收参数
- @ApiProperty：用对象接收参数时，描述对象的一个字段
- @ApiResponse：HTTP响应其中1个描述
- @ApiResponses：HTTP响应整体描述
- @ApiIgnore：使用该注解忽略这个API
- @ApiError ：发生错误返回的信息
- @ApiParamImplicitL：一个请求参数
- @ApiParamsImplicit 多个请求参数
