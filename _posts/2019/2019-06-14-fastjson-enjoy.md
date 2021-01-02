---
layout: post
title: "Fastjson 的使用研究"
description: "Fastjson 的使用经验分享"
categories: [整理]
tags: [Fastjson, 泛型，Swagger]
redirect_from:
  - /2019/06/14/
---

## 泛型转化：TypeReference

常规的使用：

```java
Result<T> obj = (Result<T>) JSON.parseObject(js, Result.class);
```

这样会发生类型转化错误，因为这里的 T 相关的变量，T 默认对应的是 Map 类型。

泛型的对象转化方法：

```java
Result<T> obj = (Result<T>) JSON.parseObject(js, new TypeReference<Result<T>>(){});
```

MVC 参数接收的时候，针对泛型参数如何处理？

自定义参数注解和相关的参数拦截器

```xml
<!--web 层注解拦截器-消息转化器定义-->
<bean class="org.springframework.web.servlet.mvc.annotation.AnnotationMethodHandlerAdapter">
    <property name="customArgumentResolvers">
        <list>
            <!--泛型参数转化器-->
            <ref bean="genericsJsonResolver"/>
        </list>
    </property>
    <property name="messageConverters">
        <list>
            <!--json 消息转化器-->
            <ref bean="jsonConverter"/>
            <!--html 数据-->
            <ref bean="simpleStringConverter"/>
        </list>
    </property>
</bean>
```

自定义泛型注解类和转化器：

```java
/**
 * 文件描述 含有泛型对象参数注解
 *
 * @author ouyangjie
 * @Title: GenericsRequestBody
 * @date 2019/5/20 11:17 PM
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.PARAMETER)
@Documented
public @interface GenericsRequestBody {
}

/**
 * 文件描述 含有泛型对象参数 json 转对象
 *
 * @author ouyangjie
 * @Title: WebGenericsParamArgumentResolver
 * @date 2019/5/20 10:59 PM
 */
public class WebGenericsParamArgumentResolver implements HandlerMethodArgumentResolver {

    public static final Charset UTF8 = Charset.forName("UTF-8");

    private static final String CONTENT_TYPE = "application/json";

    private final Logger logger = LoggerFactory.getLogger(WebGenericsParamArgumentResolver.class);

    public WebGenericsParamArgumentResolver() {}

    @Override
    public boolean supportsParameter(MethodParameter methodParameter) {
        return methodParameter.hasParameterAnnotation(GenericsRequestBody.class);
    }

    @Override
    public Object resolveArgument(MethodParameter methodParameter, ModelAndViewContainer modelAndViewContainer,
                   NativeWebRequest nativeWebRequest, WebDataBinderFactory webDataBinderFactory) throws Exception {
        try {
            // 获取 JSON 字符串
            String jsonStr;
            // 判断 content-type 是否是 application/json 的数据类型
            String contentType = nativeWebRequest.getHeader("content-type");
            if (StringUtils.isNotBlank(contentType) && contentType.contains(CONTENT_TYPE)) {
                jsonStr = WebRequestUtil.getJSONParam(nativeWebRequest);
            } else {
                jsonStr = WebRequestUtil.parseParamToJSONStr(nativeWebRequest);
            }
            Object result;
            Type originType = methodParameter.getGenericParameterType();
            if (originType instanceof ParameterizedType) {
                ParameterizedType type = (ParameterizedType) originType;
                ParameterizedTypeImpl fastjsonType = new ParameterizedTypeImpl(type.getActualTypeArguments(), type.getOwnerType(), type.getRawType());
                result = JSON.parseObject(jsonStr, fastjsonType);
            } else {
                result = JSON.parseObject(jsonStr, originType);
            }
            return result;
        } catch (JSONException e) {
            logger.error("resolveArgument 中 JSON.parseObject 方法出错：" + e.getMessage(), e);
            return UNRESOLVED;
        }
    }
}
```

## 转化策略：SerializerFeature

定义转化的策略和特征，详细策略清单如下

```java
package com.alibaba.fastjson.serializer;
public enum SerializerFeature {
    1. QuoteFieldNames,//输出 key 时是否使用双引号，默认为 true
    2. UseSingleQuotes,//使用单引号而不是双引号，默认为 false
    3. WriteMapNullValue,//是否输出值为 null 的字段，默认为 false
    4. WriteEnumUsingToString,//Enum 输出 name() 或者 original, 默认为 false
    5. UseISO8601DateFormat,//Date 使用 ISO8601 格式输出，默认为 false
    6. WriteNullListAsEmpty,//List 字段如果为 null, 输出为 [], 而非 null
    7. WriteNullStringAsEmpty,//字符类型字段如果为 null, 输出为"", 而非 null
    8. WriteNullNumberAsZero,//数值字段如果为 null, 输出为 0, 而非 null
    9. WriteNullBooleanAsFalse,//Boolean 字段如果为 null, 输出为 false, 而非 null
    10. SkipTransientField,//如果是 true，类中的 Get 方法对应的 Field 是 transient，序列化时将会被忽略。默认为 true
    11. SortField,//按字段名称排序后输出。默认为 false
    12. WriteTabAsSpecial,//把、t 做转义输出，默认为 false
    13. PrettyFormat,//结果是否格式化，默认为 false
    14. WriteClassName,//序列化时写入类型信息，默认为 false。反序列化是需用到
    15. DisableCircularReferenceDetect,//消除对同一对象循环引用的问题，默认为 false
    16. WriteSlashAsSpecial,//对斜杠'/'进行转义
    17. BrowserCompatible,//将中文都会序列化为、uXXXX 格式，字节数会多一些，但是能兼容 IE 6，默认为 false
    18. WriteDateUseDateFormat,//全局修改日期格式，默认为 false。JSON.DEFFAULT_DATE_FORMAT = "yyyy-MM-dd";JSON.toJSONString(obj, SerializerFeature.WriteDateUseDateFormat),
    19. NotWriteRootClassName,//暂不知，求告知
    20. DisableCheckSpecialChar,//一个对象的字符串属性中如果有特殊字符如双引号，将会在转成 json 时带有反斜杠转移符。如果不需要转义，可以使用这个属性。默认为 false
    21. BeanToArray; //暂不知，求告知
}
```

## Fastjson 解析器兼容 Swagger 数据接口

对于 MVC 项目正常接入 Swagger 之后，由于 Swagger 用的是 Jackson 转化器，使用 Fastjson 无法兼容 Swagger 自带的接口。

主要是这两个接口：

```
/swagger-resources/configuration/ui
/v2/api-docs
```

这两个接口被 FastJsonHttpMessageConverter 转化器拦截获取到的不是对象，而是一个 Json 字符串，
所以解析返回参数 `JSON.toJSONString(obj, features);` 返回值会是一个 `{}`

因此需要重新定义 Fastjson 消息转化器：

```java
/**
 * 文件描述 Web 层转化器 Json 转对象，对象转 Json
 *
 * @author ouyangjie
 * @Title: WebJsonHttpMessageConverter
 * @ProjectName xxx
 * @date 2019/5/2 04:26 PM
 */
public class WebJsonHttpMessageConverter extends FastJsonHttpMessageConverter {
    /**
     * jackson 解析工具
     */
    private ObjectMapper mapper = new ObjectMapper();

    public WebJsonHttpMessageConverter() {
        super();
        // this.getFastJsonConfig().getSerializeConfig().put(Json.class, SwaggerJsonSerializer.instance);
    }

    @Override
    protected void writeInternal(Object obj, HttpOutputMessage outputMessage)
            throws IOException, HttpMessageNotWritableException {
        if (obj instanceof springfox.documentation.spring.web.json.Json
                || obj instanceof springfox.documentation.swagger.web.UiConfiguration) {
            writeJsonStrToJson(obj, outputMessage);
        } else {
            super.writeInternal(obj, outputMessage);
        }
    }

    /**
     * 将 json 字符串转化成 json
     *
     * @param obj
     * @param outputMessage
     *
     * @throws IOException
     */
    private void writeJsonStrToJson(Object obj, HttpOutputMessage outputMessage) throws IOException {
        HttpHeaders headers = outputMessage.getHeaders();
        ByteArrayOutputStream outnew = new ByteArrayOutputStream();
        mapper.writeValue(outnew, obj);
        outnew.flush();
        headers.setContentLength(outnew.size());
        OutputStream out = outputMessage.getBody();
        outnew.writeTo(out);
        outnew.close();
    }
}
```

### MVC 正常接入 Swagger

对于如何接入 Swagger，请自行百度，这里对 MVC 工程接入做个简单介绍。

#### SwaggerApiConfig 定义 Docket

```java
@EnableSwagger2
@ComponentScan(basePackages = {"com.xxx.xxx"})
@EnableWebMvc
@EnableSwaggerBootstrapUI
public class SwaggerApiConfig {
    @Value("#{config['system.url']}")
    private String systemUrl;

    /**
     * 根据配置读取是否开启 swagger 文档，针对测试与生产环境采用不同的配置
     */
    @Value("#{config['swagger.enable']}")
    private boolean isSwaggerEnable;

    @Bean
    public Docket api() {
        if (!isSwaggerEnable) {
            return new Docket(DocumentationType.SWAGGER_2).enable(false)
                    .apiInfo(apiInfoOnline())
                    .select()
                    // 如果是线上环境，添加路径过滤，设置为全部都不符合
                    .paths(PathSelectors.none())
                    .build();
        }
        Set<String> defaultProduces = new HashSet<String>();
        defaultProduces.add("application/json");
        defaultProduces.add("text/plain");
        defaultProduces.add("*/*");
        return new Docket(DocumentationType.SWAGGER_2).enable(isSwaggerEnable).apiInfo(apiInfo())
                .produces(defaultProduces)
                .consumes(defaultProduces)
                .useDefaultResponseMessages(false).pathProvider(new CustRelativePathProvider())
                .select()
                // 接口太多，导致内存溢出
                // .apis(RequestHandlerSelectors.basePackage("com.xxx.xxx.web"))
                .apis(RequestHandlerSelectors.withMethodAnnotation(ApiOperation.class))
                .paths(PathSelectors.any())
                .build();
    }

    /**
     * 自定义生成的 RestFul 接口链接带的后缀，如 .do、.api、.json 等
     */
    public class CustRelativePathProvider extends AbstractPathProvider {
        public static final String ROOT = "/";

        @Override
        public String getOperationPath(String operationPath) {
            UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromPath("/");
            String uri = removeAdjacentForwardSlashes(uriComponentsBuilder.path(operationPath).build().toString());
            return uri + ".json";
        }

        @Override
        protected String applicationPath() {
            return ROOT;
        }

        @Override
        protected String getDocumentationPath() {
            return ROOT;
        }
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("系统接口平台-仅开发测试环境")
                .description("开发、测试环境专属。")
                .termsOfServiceUrl("")
                .contact(new Contact("欧阳洁", systemUrl, "ouyangjie@email.com"))
                .version("1.0.0")
                .build();
    }

    /**
     * 生产环境
     * @return
     */
    private ApiInfo apiInfoOnline() {
        return new ApiInfoBuilder()
                .title("生产环境屏蔽接口文档")
                .description("生产环境屏蔽接口文档")
                .license("")
                .licenseUrl("")
                .termsOfServiceUrl("")
                .version("")
                .contact(new Contact("欧阳洁", systemUrl, "ouyangjie@email.com"))
                .build();
    }
}
```

#### spring-servlet.xml 配置

```xml
...
<!--swagger 扫包配置 可以不需要，如果你要自定义 Swagger 对 Api 的扫描加载规则的话-->
<!--<context:component-scan base-package="springfox" />-->
<!-- 添加 Swagger2 的 java config 作为 SpringMVC 的 bean -->
<bean class="com.xxx.xxx.swagger.SwaggerApiConfig"/>

<!--swagger 相关配置-->
<!-- 配置 Swagger 相关静态资源 -->
<mvc:resources location="classpath:/META-INF/resources/" mapping="swagger-ui.html"/>
<mvc:resources location="classpath:/META-INF/resources/" mapping="doc.html"/>
<mvc:resources location="classpath:/META-INF/resources/webjars/" mapping="/webjars/**"/>

<!--访问日志拦截器-->
<mvc:interceptors>
    <mvc:interceptor>
        <mvc:mapping path="/**"/>
        <!-- 排除对 Swagger 相关资源请求的拦截 -->
        <mvc:exclude-mapping path="/swagger*/**"/>
        <mvc:exclude-mapping path="/v2/**"/>
        <mvc:exclude-mapping path="/webjars/**"/>
        <!--访问日志记录-->
        <bean class="com.xxx.xxx.web.util.aop.LogInterceptorAdapter"></bean>
    </mvc:interceptor>
</mvc:interceptors>
...
```

#### web.xml 配置

```xml
...
<!--swagger 专用的-->
<servlet-mapping>
    <servlet-name>dispatcherServlet</servlet-name>
    <url-pattern>/swagger-resources</url-pattern>
</servlet-mapping>
<servlet-mapping>
    <servlet-name>dispatcherServlet</servlet-name>
    <url-pattern>/swagger-resources/configuration/ui</url-pattern>
</servlet-mapping>
<servlet-mapping>
    <servlet-name>dispatcherServlet</servlet-name>
    <url-pattern>/swagger-resources/configuration/security</url-pattern>
</servlet-mapping>
<servlet-mapping>
    <servlet-name>dispatcherServlet</servlet-name>
    <url-pattern>/v2/api-docs</url-pattern>
</servlet-mapping>
<servlet-mapping>
    <servlet-name>dispatcherServlet</servlet-name>
    <url-pattern>/v2/api-docs-ext</url-pattern>
</servlet-mapping>
<servlet-mapping>
    <servlet-name>dispatcherServlet</servlet-name>
    <url-pattern>/csrf</url-pattern>
</servlet-mapping>
...
```

### 让自定义的泛型注解也被 Swagger 解析成 json 请求参数

#### 那么问题来了 1

上面的泛型注解 `@GenericsRequestBody` 貌似被 Swagger 解析成了 FormData 的参数形式，不是 json 请求参数

只要对该参数同时使用 `@GenericsRequestBody` 和 `@RequestBody` 就可以被 Swagger 解析成 json 请求参数 `~\(≧▽≦)/~` 啦啦啦

#### 那么问题来了 2

虽然被 Swagger 解析成了 json 请求，说明 Jackson 还是对泛型很友好哒，但是接口自身不能精准解析泛型参数了

原来，同时使用 `@GenericsRequestBody` 和 `@RequestBody` 优先被 FastJsonHttpMessageConverter 解析了

自定义的东西优先级就是差一些，难道要用 Jackson 解析器解析 json 吗？

众所周知，Jackson 参数解析器没法优雅的解决实体里面参数的相互依赖问题，需要一个个屏蔽循环依赖的参数解析，这样感 jio 是无止境的工作量

所以，只需要将自定义的参数拦截器 WebGenericsParamArgumentResolver 优先级调到最高，至少要比系统默认的 RequestResponseBodyArgumentResolver
要高才行，于是：

```java
/**
 * 文件描述 将泛型注解放到最高优先级解析
 *
 * @author ouyangjie
 * @Title: ConfigFirstGenericsParamArgumentResolver
 * @ProjectName xxx
 * @date 2019/6/13 11:52 PM
 */
public class ConfigFirstGenericsParamArgumentResolver {

    @Autowired
    private RequestMappingHandlerAdapter requestMappingHandlerAdapter;

    @Autowired
    private WebGenericsParamArgumentResolver genericsJsonResolver;

    @PostConstruct
    public void injectSelfMethodArgumentResolver() {
        List<HandlerMethodArgumentResolver> argumentResolvers = new ArrayList<>();
        argumentResolvers.add(genericsJsonResolver);
        argumentResolvers.addAll(requestMappingHandlerAdapter.getArgumentResolvers());
        requestMappingHandlerAdapter.setArgumentResolvers(argumentResolvers);
    }
}
```

对应 xml

```xml
...
<!-- 启动 Spring MVC 的注解功能，完成请求和注解 POJO 的映射 -->
<bean name="requestMappingHandlerAdapter"
      class="org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter">
    <property name="messageConverters">
        <list>
            <ref bean="jsonConverter"/>
            <ref bean="simpleStringConverter"/>
            <ref bean="mappingJacksonHttpMessageConverter"/>
        </list>
    </property>
</bean>

<!--含有泛型的请求参数 json 转对象-->
<bean id="genericsJsonResolver" class="com.xxx.xxx.web.util.handler.argument.WebGenericsParamArgumentResolver"/>
<!--将泛型注解放到最高优先级解析-->
<bean class="com.xxx.xxx.web.util.handler.argument.ConfigFirstGenericsParamArgumentResolver"/>
...
```

## 待续