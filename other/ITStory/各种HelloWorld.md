
“Hello”和“World”一起使用的程序最早出现于1972年，出现在贝尔实验室成员 Brian Kernighan 撰写的内部技术文件《Introduction to the Language B》

```b
main(){
    extern a,b,c;
    putchar(a);putchar(b);putchar(c);putchar('!*n');
}
a'hell';
b'o,w';
c'orld';
```

其他语言的Hello World写法：

## `VB`

```vb
Module MainFrm
    Sub Main()
        System.Console.WriteLine("Hello, World!")
    End Sub
End Module
```

## `C`

```c
#include <stdio.h>
int main()
{
    printf("Hello, World!");
    return 0;
}
```

## `Swift`

```swift
print("Hello, World!")
```

## `Go`

```go
package main
func main() {
    println("Hello, World!")
}
```

## `BATCH`

```batch
@echo off
echo Hello, World!
pause
```

## `Java`

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

## `C++`

```cpp
#include <iostream>
using namespace std;
int main()
{
    cout<<"Hello, World!"<<flush;
    return 0;
}
```

## `C#`

```csharp
namespace HelloWorld
{
    class Program
    {
        static void Main(string[] args)
        {
            System.Console.Write("Hello, World!");
        }
    }
}
```

## `PHP`

```php
echo "Hello, World!";
```

## `JavaScript`

```javascript
console.log("Hello, World!")
```

## `Python 2`

```python
print "Hello, World!"
```

## `Python 3`

```python
print("Hello, World!")
```

## `LaTeX`

```latex
\documentclass{article}

\begin{document}
    Hello, World!

\end{document}
```


## `Mathematica`

方法一：基于Wolfram 底层语言（进入表达式界面使用）

```mathematica
Cell["Hello, World!"]
```

方法二：直接使用数学输出函数

```mathematica
CellPrint[Cell["Hello, World!"]]
```

## `Ruby`

```ruby
def hello()
    return "Hello, World"
end
```

## `Kotlin`

```kotlin
fun main(args: Array<String>) {
    println("Hello, world!")
}
```
