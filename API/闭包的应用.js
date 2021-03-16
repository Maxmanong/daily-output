/**
 * @description 闭包除了用作缓存， 还有哪些功能？
*/

// 什么是闭包
/**
 * @description 声明在函数内部， 可以访问函数的局部变量的函数
 * 
 * 
 * 1、 提升变量生命周期
 * 变量的生命周期： 从变量的声明到变量的回收。 局部变量是： 从声明这个变量到这个函数执行结束 
 * 全局变量： js代码从开始执行到执行结束 提升变量生命周期 本来要要回收， 结果没回收
 * 
 * 2、声明私有属性
 * 
 * 
 * 在javascript语言中， 闭包就是函数和该函数作用域的组合。
 * （词法作用域的基础规则： 函数被执行时(executed) 使用的作用域链(scope chain) 是被定义时的scope chain，
 * 而不是执行时的scope chain。）
 * 从这个概念上来讲， 在js中， 所有函数都是闭包
 * （ 函数都是对象并且函数都有和他们相关联的作用域链scope chain）。
 * 大多数函数被调用时(invoked)， 使用的作用域和他们被定义时(defined) 使用的作用域是同一个作用域， 
 * 这种情况下， 闭包神马的， 无关紧要。
 * 但是， 当他们被invoked的时候， 使用的作用域不同于他们定义时使用的作用域的时候， 闭包就会变的非常有趣，
 * 并且开始有了很多的使用场景， 这就是你之所以要掌握闭包的原因。
 * 闭包的神奇特性： 闭包可以捕获到局部变量和参数的外部函数绑定， 即便外部函数的调用已经结束。
 * 1、读取函数内部的变量。
 * 2、让这些变量的值始终保持在内存中。 不会在f1调用后被自动清除。
 * 3、方便调用上下文的局部变量。 利于代码封装
*/

// 1
var scope = "window scope";

function checkScope() {
    var scope = "local scope";

    function f() {
        return scope;
    }
    return f();
}
checkScope(); //=> "local scope"

// 2
var scope = "window scope";

function checkScope() {
    var scope = "local scope";

    function f() {
        return scope;
    }
    return f;
}
checkScope()(); //=> "local scope"

// 3
var scope = "window scope";

function checkScope() {
    var scope = "local scope";

    function f() {
        return this.scope;
    }
    return f;
}
checkScope()(); //=> "window scope"

//声明私有属性的构造函数
function Student(name) {
    let age = 20
    this.name = name
    //对age做操作的方法
    this.setAge = function (value) {
        if (value >= 0 && value <= 100) {
            age = value
        }
        this.getAge = function () {
            return '我的年龄不方便透露....'
        }
    }
}
//实例化一个学生对象：学生对象不能访问age,必须要通过setAge()和getAge()方法
let s2 = new Student('luck')
console.log(s2.name) //luck
console.log(s2.setAge()) //20

// 一、返回值（最常用）
function fn() {
    let name = 'hello'
    return function () {
        return name
    }
}
let fnc = fn()
// 二、函数赋值
var fn2;

function fn() {
    var name = "hello";
    //将函数赋值给fn2
    fn2 = function () {
        return name;
    }
}
fn() //要先执行进行赋值，
console.log(fn2()) //执行输出fn2
// 在闭包里面给fn2函数设置值， 闭包的形式把name属性记忆下来， 执行会输出 hello。

// 三、函数参数
function fn() {
    var name = "hello";
    return function callback() {
        return name;
    }
}
var fn1 = fn() //执行函数将返回值（callback函数）赋值给fn1，

function fn2(f) {
    //将函数作为参数传入
    console.log(f()); //执行函数，并输出
}
fn2(fn1) //执行输出fn2
// 用闭包返回一个函数， 把此函数作为另一个函数的参数， 在另一个函数里面执行这个函数， 最终输出 hello

// 四、IIFE（自执行函数）
(function () {
    var name = "hello";
    var fn1 = function () {
        return name;
    }
    //直接在自执行函数里面调用fn2，将fn1作为参数传入
    fn2(fn1);
})()

function fn2(f) {
    //将函数作为参数传入
    console.log(f()); //执行函数，并输出
}
// 直接在自执行函数里面将封装的函数fn1传给fn2， 作为参数调用同样可以获得结果 hello

// 五、循环赋值
//每秒执行1次，分别输出1-10
for (var i = 1; i <= 10; i++) {
    (function (j) {
        //j来接收
        setTimeout(function () {
            console.log(j);
        }, j * 1000);
    })(i) //i作为实参传入
}

// 六、getter和setter
function fn() {
    var name = 'hello'
    setName = function (n) {
        name = n;
    }
    getName = function () {
        return name;
    }

    //将setName，getName作为对象的属性返回
    return {
        setName: setName,
        getName: getName
    }
}
var fn1 = fn(); //返回对象，属性setName和getName是两个函数
console.log(fn1.getName()); //getter
fn1.setName('world'); //setter修改闭包里面的name
console.log(fn1.getName()); //getter
// 第一次输出 hello 用setter以后再输出 world， 这样做可以封装成公共方法， 防止不想暴露的属性和函数暴露在外部。

// 七、迭代器(执行一次函数往下取一个值)
var arr = ['aa', 'bb', 'cc'];

function incre(arr) {
    var i = 0;
    return function () {
        //这个函数每次被执行都返回数组arr中 i下标对应的元素
        return arr[i++] || '数组值已经遍历完';
    }
}
var next = incre(arr);
console.log(next()); //aa
console.log(next()); //bb
console.log(next()); //cc
console.log(next()); //数组值已经遍历完

// 八、首次区分（相同的参数，函数不会重复执行）
var fn = (function () {
    var arr = []; //用来缓存的数组
    return function (val) {
        if (arr.indexOf(val) == -1) { //缓存中没有则表示需要执行
            arr.push(val); //将参数push到缓存数组中
            console.log('函数被执行了', arr);
            //这里写想要执行的函数
        } else {
            console.log('此次函数不需要执行');
        }
        console.log('函数调用完打印一下，方便查看已缓存的数组：', arr);
    }
})();

fn(10);
fn(10);
fn(1000);
fn(200);
fn(1000);
// 可以明显的看到首次执行的会被存起来，再次执行直接取。

// 九、缓存
//比如求和操作，如果没有缓存，每次调用都要重复计算，
// 采用缓存已经执行过的去查找，查找到了就直接返回，不需要重新计算

var fn = (function () {
    var cache = {}; //缓存对象
    var calc = function (arr) { //计算函数
        var sum = 0;
        //求和
        for (var i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum;
    }

    return function () {
        var args = Array.prototype.slice.call(arguments, 0); //arguments转换成数组
        var key = args.join(","); //将args用逗号连接成字符串
        var result, tSum = cache[key];
        if (tSum) { //如果缓存有   
            console.log('从缓存中取：', cache) //打印方便查看
            result = tSum;
        } else {
            //重新计算，并存入缓存同时赋值给result
            result = cache[key] = calc(args);
            console.log('存入缓存：', cache) //打印方便查看
        }
        return result;
    }
})();
fn(1, 2, 3, 4, 5);
fn(1, 2, 3, 4, 5);
fn(1, 2, 3, 4, 5, 6);
fn(1, 2, 3, 4, 5, 8);
fn(1, 2, 3, 4, 5, 6);


/**
 * @description 一些概念
 * js的执行环境和作用域
 * 1、每个函数有一个执行环境， 一个执行环境关联一个变量对象， 变量对象的集合叫做作用域链。
 * 2、作用域链的前端是当前的执行代码所在的变量对象， 下一个对象是外部函数， 一直延续到全局变量。
 * 3、标识符解析是沿着作用域链从前端开始逐级回溯的过程。
 * 4、代码执行完毕后， 所在的环境会被销毁， web中全局执行环境是window对象， 
 *    全局环境会在应用程序退出时被销毁。
 */