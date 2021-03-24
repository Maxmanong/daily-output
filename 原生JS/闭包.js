/**
 * @description 原生--JS闭包
 * 闭包是指有权访问另外一个函数作用域中的变量的函数（红宝书）
 * 闭包是指那些能够访问自由变量的函数。（MDN）
 * （其中自由变量， 指在函数中使用的， 但既不是函数参数arguments也不是函数的局部变量的变量，
 *  其实就是另外一个函数作用域中的变量。）
 * */

/**
 * @description 作用域
 * ES5种只存在两种作用域：1、函数作用域。2、全局作用域
 * 当访问一个变量时， 解释器会首先在当前作用域查找标示符，
 * 如果没有找到， 就去父作用域找， 直到找到该变量的标示符或者不在父作用域中， 这就是作用域链，
 * 每一个子函数都会拷贝上级的作用域， 形成一个作用域的链条。
 * */
let a = 1;

function f1() {
    var a = 2

    function f2() {
        var a = 3;
        console.log(a); //3
    }
}
/**
 * 在这段代码中， f1的作用域指向有全局作用域(window) 和它本身，
 * 而f2的作用域指向全局作用域(window)、 f1和它本身。
 * 而且作用域是从最底层向上找， 直到找到全局作用域window为止，
 * 如果全局还没有的话就会报错。
 * 闭包产生的本质就是， 当前环境中存在指向父级作用域的引用。
 * */
function f2() {
    var a = 2

    function f3() {
        console.log(a); //2
    }
    return f3;
}
var x = f2();
x();
// 这里x会拿到父级作用域中的变量， 输出2。 因为在当前环境中， 
// 含有对f3的引用， f3恰恰引用了window、 f3和f3的作用域。 因此f3可以访问到f2的作用域的变量。

// 那是不是只有返回函数才算是产生了闭包呢？
// 回到闭包的本质，只需要让父级作用域的引用存在即可，
var f4;

function f5() {
    var a = 2
    f4 = function () {
        console.log(a);
    }
}
f5();
f4();
// 让f5执行，给f4赋值后，等于说现在f4拥有了window、f5和f4本身这几个作用域的访问权
// 还是自底向上查找，最近是在f5中找到了a,因此输出2。
// 在这里是外面的变量f4存在着父级作用域的引用， 因此产生了闭包，形式变了，本质没有改变。


// 在真实的场景中， 究竟在哪些地方能体现闭包的存在？
/**
 * 1、返回一个函数。
 * 2、作为函数参数传递。
 * 3、 在定时器、 事件监听、 Ajax请求、 跨窗口通信、 Web Workers或者任何异步中，
 *  只要使用了回调函数， 实际上就是在使用闭包。
 * 4、IIFE(立即执行函数表达式) 创建闭包, 保存了全局作用域window和当前函数的作用域， 因此可以全局的变量。
 * */
var b = 1;

function foo() {
    var b = 2;

    function baz() {
        console.log(b);
    }
    bar(baz);
}

function bar(fn) {
    // 这就是闭包
    fn();
}
// 输出2，而不是1
foo();


// 以下的闭包保存的仅仅是window和当前作用域。
// 定时器
setTimeout(function timeHandler() {
        console.log('111');
    }, 100)

// 事件监听
// $('#app').click(function () {
//     console.log('DOM Listener');
// })

// 立即执行函数
var c = 2;
(function IIFE() {
    // 输出2
    console.log(c);
})();

// 经典的一道题
for (var i = 1; i <= 5; i++) {
    setTimeout(function timer() {
        console.log(i)
    }, 0)
}  // 6 6 6 6 6 6
// 为什么会全部输出6？ 如何改进， 让它输出1， 2， 3， 4， 5？(方法越多越好)
/**
 * @description 解析
 * 因为setTimeout为宏任务， 由于JS中单线程eventLoop机制， 在主线程同步任务执行完后才去执行宏任务，
 * 因此循环结束后setTimeout中的回调才依次执行， 但输出i的时候当前作用域没有，
 * 往上一级再找， 发现了i, 此时循环已经结束， i变成了6。 因此会全部输出6。
 * */

// 1、利用IIFE(立即执行函数表达式)当每次for循环时，把此时的i变量传递到定时器中
for (var i = 0; i < 5; i++) {
    (function (j) {
        setTimeout(() => {
            console.log(j)
        }, 1000);
    })(i)
}
// 2、给定时器传入第三个参数, 作为timer函数的第一个函数参数
for (var i = 0; i < 5; i++) {
    setTimeout(function (j) {
        console.log(j)
    }, 1000, i);
}
// 3、使用ES6中的let
// let使JS发生革命性的变化， 让JS有函数作用域变为了块级作用域，
// 用let后作用域链不复存在。 代码的作用域以块级为单位，
for (let i = 1; i <= 5; i++) {
    setTimeout(function timer() {
        console.log(i)
    }, 2000)
}