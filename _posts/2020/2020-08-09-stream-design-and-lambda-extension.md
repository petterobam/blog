---
layout: post
title: "Stream 深入分析到 Lambda 扩展使用"
description: "Stream 深入分析到 Lambda 扩展使用"
categories: [整理，Stream,Lambda]
tags: [Lambda,Stream]
redirect_from:
  - /2020/08/09/
---

# Stream 启发之流式编程

流式编程是一种外表优美，逻辑自洽的一种编程范式，Jdk 很早就在做尝试。
```java
// Stream 出来之前就有很多流式编程实现，比如
String sql = new StringBuilder("select * from ").append(table).(" where 1=1 ").append(queryStr).toString();
// 自定义实现的构造者
JavaBean obj = JavaBeanBuilder.new().arg1(param1).arg2(param2).argN(paramN).bulid();
```

## 故事性
故事性：如果简单的单行代码表示单词或短语，多行代码完成一个闭环功能，我称其描述了一个故事。
```
流式编程天然有一个故事模板：
Start -> [Self Create] -> [Self Do 1] -> ... -> [Self Do n] -> [Output] -> End
就酱，一行语句描述一个代码故事~
```

## 范式
流式编程的 [流对象] 至少有两种方法：
1. 过程方法 -> 消费 Data 或 Function，返回 this
2. 结果方法 -> 返回目标对象（或消费流结果）

```java
// 用故事模板讲述一个故事
String story = new StringBuffer("Story:").append(man).append(action).append(woman).toString();

// Stream 常见示例
List<student> result = students.stream().sorted(Comparator.comparing(Student::getSex)).collect(Collectors.toList());

Map<String, String> res = Stream.of(objs).collect(Collectors.toMap(Obj::getId, Obj::getName);
Map<String, List<Student>> classStudentsMap = students.stream().collect(Collectors.groupingBy(Student::ClassId));
Map<Long,List<Long>> result = list.stream().collect(Collectors.groupingBy(JavaBean::getKeyId, Collectors.mapping(JavaBean::getValue, Collectors.toList())));

List<String> ids = orders.stream().map(o -> o.getUserId()).distinct().collect(Collectors.toList());
long count = datas.stream().filter(d -> d.getScore() > 80).count();
String output = strs.stream().distinct().collect(Collectors.joining(","));
Optional<Book> thickBook = books.parallelStream().max(Comparator.comparing(Book::getPages));
datas.stream().forEach(JavaBean::doSomthing);

过程方法：filter、map、sorted、distinct...
结果方法：collect、count、max、min、forEach...
```

# Stream 深入之语法糖

语法糖，底层语法衍生出的新的语法。

## 常见语法糖

反编译揭秘一些语法糖：
```java
// 自动拆装箱
Integer i = 2;
int t = i;
i++;
↓
Integer i = Integer.valueOf(2);
int t = i.intValue();
i = Integer.valueOf(i.intValue() + 1)
// 数字加下划线自动去下划线
int num = 1000_0_0000;
long nums = 1000_0000000_0_0_0L;
↓
int num = 100000000;
long nums = 10000000000000L;
// 字符串相加
String str1 = "A" + "B";
String str5 = 4 + str1;
↓
String str1 = "AB";
(new StringBuilder()).append(4).append(str1).toString();
// while、for 循环底层基础语法
while (i < 5) {
    i++;
}
↓
for (; i.intValue() < 5; i = Integer.valueOf(i.intValue() + 1)) ;
// case 语句
String str = "2";
switch (str) {
    case "2":
        g = 5;
        break;
    case "5":
        g = 10;
        break;
    default:
        g = 2;
}
↓
String str = "2";
Object integer = str; 
int i1 = -1; 
switch (((String)integer).hashCode()) { 
    case 50:
        if (((String)integer).equals("2")) i1 = 0; break;
    case 53:
        if (((String)integer).equals("5")) i1 = 1; break; 
} 
switch (i1) {
    case 0:
        g = 5;
        break;
    case 1:
        g = 10;
        break;
    default:
        g = 2;
}
// 枚举
public static enum TestEnum {
    V1,V2
}
↓
public final class TestEnum extends Enum {
    private TestEnum(String s, int i) {
        super(s, i); 
    } 
    public static TestEnum[] values() { 
        TestEnum at[]; 
        int i; 
        TestEnum at1[]; 
        System.arraycopy(at = ENUM$VALUES, 0, at1 = new T[i = at.length], 0, i); 
        return at1; 
    }
    public static TestEnum valueOf(String s) { 
        return (TestEnum)Enum.valueOf(TestEnum.class, s); 
    } 
 
    public static final TestEnum V1;
    public static final TestEnum V2; 
    private static final TestEnum ENUM$VALUES[]; 
    static { 
        V1 = new TestEnum("V1", 0); 
        V2 = new TestEnum("V2", 1); 
        ENUM$VALUES = (new TestEnum[] { 
            V1, V2
        }); 
    }
}
```

## Lambda 语句语法糖

Lambda 语句语法糖分析
```java
public static void main(String[] args) {
    Supplier supplier = () -> 3;
    Object a = supplier.get();
    Function function = (t) -> 4;
    Object b = function.apply(a);
    Consumer consumer = (t) -> {};
    consumer.accept(b);
    Predicate predicate = (t) -> false;
    predicate.test(a == b);
}

↓

public static void main(final String[] args) {
    final Supplier supplier = () -> Integer.valueOf(3);
    final Object a = supplier.get();
    final Function function = t -> Integer.valueOf(4);
    final Object b = function.apply(a);
    final Consumer consumer = t -> {};
    consumer.accept(b);
    final Predicate predicate = t -> false;
    predicate.test(Boolean.valueOf(a == b));
}
private static /* synthetic */ boolean lambda$main$3(final Object t) {
    return false;
}
private static /* synthetic */ void lambda$main$2(final Object t) {
}
private static /* synthetic */ Object lambda$main$1(final Object t) {
    return Integer.valueOf(4);
}
private static /* synthetic */ Object lambda$main$0() {
    return Integer.valueOf(3);
}

↓

查看反编译 main 函数的 TypeCode
javap -c LambdaSyntaxSugar
public static void main(java.lang.String[] args);
    Flags: PUBLIC, STATIC
    Code:
                linenumber      17
            0: invokedynamic   BootstrapMethod #0, get:()Ljava/util/function/Supplier;
            5: astore_1        /* supplier */
                linenumber      18
            6: aload_1         /* supplier */
            7: invokeinterface java/util/function/Supplier.get:()Ljava/lang/Object;
            12: astore_2        /* a */
                linenumber      20
            13: invokedynamic   BootstrapMethod #1, apply:()Ljava/util/function/Function;
            18: astore_3        /* function */
                linenumber      21
            19: aload_3         /* function */
            20: aload_2         /* a */
            21: invokeinterface java/util/function/Function.apply:(Ljava/lang/Object;)Ljava/lang/Object;
            26: astore          b
                linenumber      23
            28: invokedynamic   BootstrapMethod #2, accept:()Ljava/util/function/Consumer;
            33: astore          consumer
                linenumber      24
            35: aload           consumer
            37: aload           b
            39: invokeinterface java/util/function/Consumer.accept:(Ljava/lang/Object;)V
                linenumber      26
            44: invokedynamic   BootstrapMethod #3, test:()Ljava/util/function/Predicate;
            49: astore          predicate
                linenumber      27
            51: aload           predicate
            53: aload_2         /* a */
            54: aload           b
            56: if_acmpne       63
            59: iconst_1       
            60: goto            64
            63: iconst_0       
            64: invokestatic    java/lang/Boolean.valueOf:(Z)Ljava/lang/Boolean;
            67: invokeinterface java/util/function/Predicate.test:(Ljava/lang/Object;)Z
            72: pop            
                linenumber      28
            73: return

↓

查看常量池：
javap -v LambdaSyntaxSugar

// 截取部分 BootstrapMethods 部分
BootstrapMethods:
  0: #56 invokestatic java/lang/invoke/LambdaMetafactory.metafactory:(Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invok
e/MethodType;)Ljava/lang/invoke/CallSite;
    Method arguments:
      #57 ()Ljava/lang/Object;
      #58 invokestatic syntax/LambdaSyntaxSugar.lambda$main$0:()Ljava/lang/Object;
      #57 ()Ljava/lang/Object;
  1: #56 invokestatic java/lang/invoke/LambdaMetafactory.metafactory:(Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invok
e/MethodType;)Ljava/lang/invoke/CallSite;
    Method arguments:
      #62 (Ljava/lang/Object;)Ljava/lang/Object;
      #63 invokestatic syntax/LambdaSyntaxSugar.lambda$main$1:(Ljava/lang/Object;)Ljava/lang/Object;
      #62 (Ljava/lang/Object;)Ljava/lang/Object;
  2: #56 invokestatic java/lang/invoke/LambdaMetafactory.metafactory:(Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invok
e/MethodType;)Ljava/lang/invoke/CallSite;
    Method arguments:
      #67 (Ljava/lang/Object;)V
      #68 invokestatic syntax/LambdaSyntaxSugar.lambda$main$2:(Ljava/lang/Object;)V
      #67 (Ljava/lang/Object;)V
  3: #56 invokestatic java/lang/invoke/LambdaMetafactory.metafactory:(Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodType;Ljava/lang/invoke/MethodHandle;Ljava/lang/invok
e/MethodType;)Ljava/lang/invoke/CallSite;
    Method arguments:
      #72 (Ljava/lang/Object;)Z
      #73 invokestatic syntax/LambdaSyntaxSugar.lambda$main$3:(Ljava/lang/Object;)Z
      #72 (Ljava/lang/Object;)Z
```

默认情况下生成的方法都是静态方法，只有在非静态方法里面使用 Lambda 且 Lambda 方法体里面使用了非静态成员方法或变量，才生成成员方法。

```java
public class LambdaSyntaxSugar {
    private String str;
    public void not_main() {
        Supplier supplier = () -> 3;
        Supplier supplier2 = () -> this.str;
    }
}

↓

public class LambdaSyntaxSugar {
    private String str;
    public LambdaSyntaxSugar() {
        /*SL:14*/super();
    }
    public void not_main() {
        final Supplier supplier = /*EL:17*/() -> Integer.valueOf(3);
        final Supplier supplier2 = /*EL:18*/() -> this.str;
    }
    private /* synthetic */ Object lambda$not_main$1() {
        /*SL:18*/return this.str;
    }
    private static /* synthetic */ Object lambda$not_main$0() {
        /*SL:17*/return Integer.valueOf(3);
    }
}
```

综上：
```
1. 编译器会为每一个 lambda 表达式生成一个方法。
        方法名是 lambda$所在函数名$0,1,2,...，但方法引用的表达式不会生成方法。
2. 在 lambda 地方会产生一个 invokeDynamic 指令，这个指令会调用
        bootstrap（引导）方法，bootstrap 方法会指向自动生成的 lambda$所在函数名$0 方法或者方法引用的方法。
3. bootstrap 方法使用上是调用了 LambdaMetafactory.metafactory 静态方法
        该方法返回了 CallSite （调用站点），里面包含了 MethodHandle （方法句柄）也就是最终调用的方法。
4. 如果函数体里面没有使用 this，那么就是 static 方法，否则就是成员方法
```

出色的反编译工具：

1. [JD-GUI（要注意支持的 Jdk 版本）](http://java-decompiler.github.io/)
2. [Luyten（推荐）](https://github.com/deathmarine/Luyten)
3. [CFR](http://www.benf.org/other/cfr/)

# Lambda 之函数式编程

万物可对象的原则的话，Lambda 表达式都可以对应一种函数式接口实现，而语法里也通过语法糖封装实现了 Lambda 和函数式接口对象自动匹配和转化。

## 函数式接口

特征：

1. 接口只有一个未实现的方法。
2. 接口上添加了 @FunctionalInterface 注解。

```
Jdk 提供了一系列默认的函数式接口（java.util.function.*），主要包含四大类：
1、Supplier<T>：T get()；无输入，“生产”一个 T 类型的返回值。
2、Consumer<T>：void accept(T t)；输入类型 T，“消费”掉，无返回。
3、Function<T, R>：R apply(T t)；输入类型 T 返回类型 R。
4、Predicate<T>：boolean test(T t)；输入类型 T，并进行条件“判断”，返回 true|false。特殊的 Function<T, Boolean>
```

Lambda 表达式自动识别变成接口函数的实现对象：

```
参数 -> 方法体

无参数+无返回值：() -> {...} 无接收类型，作为变量传输需要自定义类型，虽然 Runnable 就是这种函数式接口，不建议直接使用。
无参+有返回值：() -> {...;return x;} 为 Supplier<T> 实现接收
有参+无返回值：(Object..) -> {...} 为 Consumer/BiConsumer<T..> 实现接收，至多两个参数，更多参数需要自己定义 Consumer
有参+有返回值：(Object) -> {...;return x;} 为 Function<T, R> 实现接收
```

## 函数参数化后

1、【性能提升】不用生成额外的匿名类，通过把函数式接口的匿名内部类方法的调用改成类静态方法调用来完成。

2、【编程方式更灵活】将方法传输后，能携带更多的信息。

1. 普通参数 可以转变成 生产者 Supplier<T> 传入，对象工厂表示：我们不再生产产品，我们只提供专利。
2. 多态或重载 可以转变成 动态 Lambda 策略，参照 [Collectors（Lambda 转化者编程分析）](#heading-lambda-转化者编程分析)
3. 转化业务可以策略化封装，参照 [Collectors（Lambda 转化者编程分析）](#heading-lambda-转化者编程分析)

# 函数式编程思维扩展

思考模式：生产者 and 消费者 + 粒度细化到函数
```
函数参数：入参、出参
1. 入参：无、有（数据、服务）
2. 出参：void、有（数据、服务）

排列组合：
1. 无入参+有出参：纯生产者
2. 有入参+无出参：纯消费者
3. 无入参+无出参：自产自销（best 稳定）
4. 有入参+有出参：交易者

【异常】扮演的角色？  ->  淘汰机制。
```

## 应用分析

应用方向：学会将函数看成一种类型的参数，可以解锁很多玩法。

## Lambda 生产者编程分析

```java
// 定义一个生产者
@FunctionalInterface
public interface Supplier<T> {
    T get();
}
由于 Java 里面只能返回一个对象，所以纯生产者一般只有一种定义和变化。

对于我们日常的编程，任何参数可以的演变方向：
method1(int a);
method2(JavaBean b);
method3(int a, JavaBean b);
↓
method1(Supplier<Integer> a);
method2(Supplier<JavaBean> b);
method3(Supplier<Integer> a, Supplier<JavaBean> b);
```

### 示例：多数场景下的代码收束利器

```java
Message msg = new Message();
// do something1
// do something2
// do something3
msg.setArg1(arg1);
msg.setArg2(arg3);
// do something4
msg.setArg3(arg3);
sender.send(msg);

↓

// do something1
// do something2
// do something3
// send msg
sender.send(() -> {
    Message msg = new Message();
    msg.setArg1(arg1);
    msg.setArg2(arg3);
    // do something4
    msg.setArg3(arg3);
    return msg;
});

默认构造器是一个天然的 Supplier<T>：
Supplier<JavaBean> supplier = JavaBean::new
JavaBean bean = supplier.get();

如果将构造器参数化，会有什么好玩的东西呢？
没想出来。..
```

## Lambda 消费者编程分析

```java
// 定义一个消费者接口，一个参数可能的组合
@FunctionalInterface
public interface Consumer<T> {
    void accept(T t);
}
↓
(t) -> t.doSomthing();
(t) -> [lambda$]doSomthing(t);

// 定义一个消费者接口，两个参数可能的组合
@FunctionalInterface
public interface Consumer<T, U> {
    void accept(T t, U u);
}
↓
(t, u) -> t.doSomthing(u);
(t, u) -> [lambda$]doSomthing(t, u);

// 定义一个消费者接口，三个参数可能的组合

依次类推，取决于传入的方法是与第一个参数是否相关，规律总结如下：
Comsumer<T, 其他类型。.> -> accept(T t, 其他参数。.)
1、[类 T]:: 方法 -（其他参数），第一个参数 t 类型 T，则调用：t. 方法（其他参数）
2、[类 A]:: 静态方法 -(t, 其他参数）, 第一个参数 t 类型 T，则调用：类 A. 静态方法 (t, 其他参数）
3、[对象 obj-类 T/A]:: 方法 -(t, 其他参数），调用：obj. 方法 (t, 其他参数）
4、(t, 其他参数） -> {...} ，自动生成的匿名函数：[static] lambda$当前函数名$1(t, 其他参数）
```

### 示例：通用 Builder 实现

函数式编程前的传统实现：
```java
public class JavaBeanBuilder {
    private JavaBean instant;
    public JavaBeanBuilder(JavaBean instant) {
        this.instant = instant;
    }
    public static JavaBeanBuilder builder() {
        return new JavaBeanBuilder(new JavaBean());
    }
    public JavaBeanBuilder arg1(Long value) {
        this.instant.setArg1(value);
        return this;
    }
    public JavaBeanBuilder arg2(String value) {
        this.instant.setArg2(value);
        return this;
    }
    ...
    public JavaBean build() {
        JavaBean result = this.instant;
        this.instant = null;
        return result;
    }

    public static void main(String[] args) {
        JavaBean bean = JavaBeanBuilder.builder().arg1(1L).arg2("2")...build();
        System.out.println(bean.getArg1());
    }
}
```

基于函数式编程的通用 Builder 实现：
```java
public class Builder<T> {
    private T instant;
    public Builder(Supplier<T> supplier) {
        this.instant = supplier.get();
    }
    public static <T> Builder<T> of(Supplier<T> supplier) {
        return new Builder(supplier);
    }
    public <D> Builder<T> with(BiConsumer<T, D> consumer, D value) {
        consumer.accept(this.instant, value);
        return this;
    }
    public T build() {
        T result = this.instant;
        this.instant = null;
        return result;
    }
    public static void main(String[] args) {
        JavaBean bean = Builder.of(JavaBean::new).with(JavaBean::setArg1, 1L).with(JavaBean::setArg2, "2")...build();
        System.out.println(bean.getKeyId());
    }
}
```

## Lambda 转化者编程分析

Function<T, R> 转化者是生产者和消费者特征的集合体，在 JDK 中表现最明显的就是 Stream 编程中的 Collertors

Collertors 提供一系列静态方法生成策略用于数据转化，策略的通式如下：

```java
static class CollectorImpl<T, A, R> implements Collector<T, A, R> {
    private final Supplier<A> supplier;
    private final BiConsumer<A, T> accumulator;
    private final BinaryOperator<A> combiner;
    private final Function<A, R> finisher;
    private final Set<Characteristics> characteristics;

    CollectorImpl(Supplier<A> supplier,
                    BiConsumer<A, T> accumulator,
                    BinaryOperator<A> combiner,
                    Function<A,R> finisher,
                    Set<Characteristics> characteristics) {
        this.supplier = supplier;
        this.accumulator = accumulator;
        this.combiner = combiner;
        this.finisher = finisher;
        this.characteristics = characteristics;
    }

    CollectorImpl(Supplier<A> supplier,
                    BiConsumer<A, T> accumulator,
                    BinaryOperator<A> combiner,
                    Set<Characteristics> characteristics) {
        this(supplier, accumulator, combiner, castingIdentity(), characteristics);
    }

    @Override
    public BiConsumer<A, T> accumulator() {
        return accumulator;
    }

    @Override
    public Supplier<A> supplier() {
        return supplier;
    }

    @Override
    public BinaryOperator<A> combiner() {
        return combiner;
    }

    @Override
    public Function<A, R> finisher() {
        return finisher;
    }

    @Override
    public Set<Characteristics> characteristics() {
        return characteristics;
    }
}

【元数据】接口元数据含义：
T：输入的元素类型
A：累积结果的容器类型
R：最终生成的结果类型

【范式】各方法用途：
supplier： 创建新的结果容器
accumulator：将输入元素合并到结果容器中
combiner：合并两个结果容器（并行流使用，将多个线程产生的结果容器合并）
finisher：将结果容器转换成最终的表示

↓

<R, A> R collect(Collector<? super T, A, R> collector);

例如：
...stream()...collect(Collectors.toList());

public static <T> Collector<T, ?, List<T>> toList() {
    return new CollectorImpl<>((Supplier<List<T>>) ArrayList::new, List::add,
                                (left, right) -> { left.addAll(right); return left; },
                                // i -> (R) i
                                CH_ID);
}

...stream()....collect(Collectors.toCollection(TreeSet::new));

public static <T, C extends Collection<T>> Collector<T, ?, C> toCollection(Supplier<C> collectionFactory) {
    return new CollectorImpl<>(collectionFactory, Collection<T>::add,
                                (r1, r2) -> { r1.addAll(r2); return r1; },
                                CH_ID);
}

...stream().....collect(Collectors.joining(","));

public static Collector<CharSequence, ?, String> joining() {
    return new CollectorImpl<CharSequence, StringBuilder, String>(
            StringBuilder::new, StringBuilder::append,
            (r1, r2) -> { r1.append(r2); return r1; },
            StringBuilder::toString, CH_NOID);
}

...stream()...collect(Collectors.groupingBy
...stream()...collect(Collectors.partitioningBy
```

### 启发应用

```
业务通用转化范式？

例如通用 Feed 流组装业务：
Collector<T, A, R>  ->  BusinessCollector<DTO, List<Feed>, PageVO>
* supplier： 创建新的 List<Feed>
* accumulator：将输入元素合并到结果容器中 DTO -> Feed
* combiner：合并两个结果容器（并行流使用，将多个线程产生的结果容器合并） Feeds -> NewFeeds
* finisher：将结果容器转换成最终的表示  Feeds -> PageVO
【扩展】
* filters：过滤器 List<Function> 额外过滤器，链式过滤处理，可插拔
* maps：通用业务映射器，实现不同场景的不同组装

show me code ? TODO...
```

### 示例：Feed 流组装范式 【2020-08-21】补充

Feed 流类结构：

```json
{
    hasMore
    List<FeedResource> {
        ResourceType -> 视频、MV、Mlog、广告、直播、话题、圈子
        ...
        RelateResource.. {
            创作者
            艺人
            歌曲
            标签
            权限
            评论
            ...
        }
    }
    msg
    ...
}
```

组装流程：

```
FeedResourceIdWithType[]
↓
 ← GroupBy ResourceType
↓
Map<ResourceType, ResourceId[]>
↓
 ← ResourceConverter<ResourceId[],FeedResource(RelateResourceId[])[]> []
↓
FeedResource(RelateResourceId[])[] -> Map<RelateResourceType, RelateResourceId[]>
↓
 ← RelateResourceConverter<RelateResourceId[], Map<RelateResourceId, RelateResource>> []
↓
Map<RelateResourceId, RelateResource>[]
↓
 ← FeedResourceFiller<FeedResource(RelateResourceId[]), Map<RelateResourceId, RelateResource>[]>
↓
FeedResource(RelateResource[])[]
↓
 ← Rejust List and Package
↓
FeedResourcePage<FeedResource>(
    hasMore
    FeedResource(RelateResource[])[]
    msg
    ...
)
```

编码伪代码：

```java
// 为了方便书写，T[] 等价于 List<T>
class FeedResourceCollector<Map<ResourceType, ResourceId[]>, FeedResource(RelateResource[])[], FeedResourcePage> {
    private Map<ResourceType, FeedResourceFunction<ResourceId[], FeedResource(RelateResource[])[]>> feedResourceConvertors;
    private Map<ResourceType, FeedRelateResourceIdFunction<FeedResource, Map<RelateResourceType, RelateResourceId[]>>> feedResourceRelateIdConverts;
    private Map<RelateResourceType, RelateResourceFunction<RelateResourceId[], Map<RelateResourceId, RelateResource>>> relateResourceConvertors;
    private FeedResourceFillConsumer<FeedResource(RelateResource[])[], Map<RelateResourceType, Map<RelateResourceId, RelateResource>>> feedResourceFiller;
    private FeedResourcePackageFunction<FeedResource(RelateResource[])[], FeedResourcePage<FeedResource>> feedPackager;

    private void init() {
        // loading feedResourceConvertors
        feedResourceConvertors.put(VideoType, videoService::getByIds);
        feedResourceConvertors.put(MvType, mvService::getByIds);
        feedResourceConvertors.put(MlogType, mlogService::getByIds);
        feedResourceConvertors.put(AdType, adService::getByIds);
        feedResourceConvertors.put(LiveRoomType, liveRoomService::getByIds);
        feedResourceConvertors.put(TalkType, talkService::getByIds);
        feedResourceConvertors.put(CircleType, circleService::getByIds);
        ...
        // loading feedResourceRelateIdConverts
        relateResourceConvertors.put(VideoType, VideoResourceBean::getRelateIdsMap);
        relateResourceConvertors.put(MvType, MvResourceBean::getRelateIdsMap);
        relateResourceConvertors.put(MlogType, MlogResourceBean::getRelateIdsMap);
        relateResourceConvertors.put(AdType, AdResourceBean::getRelateIdsMap);
        relateResourceConvertors.put(LiveRoomType, LiveRoomResourceBean::getRelateIdsMap);
        relateResourceConvertors.put(TalkType, TalkResourceBean::getRelateIdsMap);
        relateResourceConvertors.put(CircleType, CircleResourceBean::getRelateIdsMap);
        // loading relateResourceConvertors
        relateResourceConvertors.put(CreatorType, creatorService::getByIds);
        relateResourceConvertors.put(ArtistType, artistService::getByIds);
        relateResourceConvertors.put(SongType, songService::getByIds);
        relateResourceConvertors.put(TagType, tagService::getByIds);
        relateResourceConvertors.put(PriviligeType, priviligeService::getByIds);
        relateResourceConvertors.put(CommentType, commentService::getByIds);
        ...
        // link feedResourceFiller
        feedResourceFiller = FillFeedResourceFiller::apply
        // link feedPackager
        feedPackager = NewFeedPackager::package
    }

    public FeedResourcePage<FeedResource> renderFeedPage(Map<ResourceType, ResourceId[]> resourceIdMap) {
        FeedResource(RelateResource[])[] feeds = new ArrayList<>();
        // 1、得到 主 feed 集合（关联资源未填充，只有相关 ID）
        feedResourceConvertors.forEach(convertor -> {
            feeds.addAll(convertor.getValue().apply(resourceIdMap.get(convertor.getKey())));
        });
        // 2、提取 关联资源 ID，按 资源分类聚合
        Map<RelateResourceType, RelateResourceId[]> relateResourceIdsMap = new HashMap<>();
        feeds.forEach(feed -> {
            Map<RelateResourceType, RelateResourceId[]> tempIdsMap = feedResourceRelateIdConverts.get(feed.getResourceType()).apply(feed);
            // combine
            tempIdsMap.forEach(entry -> {
                relateResourceIdsMap.computeIfAbsent(entry.getKey(), ArrayList::new).addAll(entry.getValue());
            });
        });
        // 3、查询关联资源，按资源分类聚合
        Map<RelateResourceType, Map<RelateResourceId, RelateResource>> relateResourceMaps = new HashMap<>();
        relateResourceIdsMap.forEach(entry -> {
            relateResourceMaps.put(entry.getKey(), relateResourceConvertors.get(entry.getKey()).apply(entry.getValue()));
        });
        // 4、填充关联资源到 主 feed 集合
        feedResourceFiller.apply(feeds, relateResourceMaps);
        // 5、打包 到 结果集
        return feedPackager.apply(feeds);
    }
}

```

# 扩展思维

如果随着操作系统（CPU 愈发小巧廉价，单机可以装上千个）或 JDK 的发展（并发的最小粒度不再是进程线程，而是方法栈），编程模式又会有怎样的变化？

1. 参照 GPU 图计算模式，JDK 编译器自动优化，分析出函数语句入参出参的依赖性，形成执行图模型，实现方法栈并行执行。

2. 参照 Serverless 和容器模型，当方法栈数据无状态化后，实现函数分发执行。