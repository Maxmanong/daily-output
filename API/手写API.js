// new 做了什么
/* 
 * 1、把函数编程一个对象
 * 2、实例原型链和构造函数原型对象绑定
 * 3、this指向实例 
*/


function _new(fn) {
    // 获取除 fn 以外的所有参数 arguments
    // 使用 slice 删除 arguments 的第一个元素 就拿到其他的 参数
    const args = Array.prototype.slice.call(arguments, 1)
    // 新建一个对象用于函数变对象
    // const newObj = {}
    const newObj = Object.create(fn.prototype)
    // 原型链被赋值为原型对象
    newObj.__proto__ = fn.prototype
    // this指向新对象
    const value = fn.apply(newObj, args)
    // 返回这个对象
    return value instanceof Object ? value : newObj
}

/* 
 * @description new 到底做了什么 思考
 * 1、在内存中创造一个新对象。
 * 2、将新对象的内部属性[[prototype]]赋值为构造函数的prototype
 * 3、将构造函数内部的this赋值指向新对象
 * 4、执行构造函数内部代码，为新对象增添属性
 * 5、如果构造函数返回非空对象，则返回该对象，否则返回刚创建的新对象。
 * 
*/


// call、apply、bind 区别
/**
 * @description 
 * 1、call的参数除了第一个是this外，其他的可以是无限个
 * 2、apply是call的语法糖，第二个参数是一个数组，里面是所有的参数集合
 * 3、bind不会改变原对象，call和apply会改变
 * 4、bind绑定后不会执行，call和apply会执行
 */

Function.prototype.myCall = function(context) {
    // context 是 希望绑定的 this
    let context = context || window
    context.fn = this
    // 实现传递参数
    let args = []
    for (let i = 1, len = arguments.length; i < len; i++) {
        args.push('arguments[' + i + ']');
    }
    // 会自动调用args.toSting()，比如["arguments[1]","arguments[2]"]
    // 会转化成 arguments[1], arguments[2]
    var result = eval('context.fn(' + args + ')');
    // 删除为其添加的属性
    delete context.fn
    return result;
}

Function.prototype.apply2 = function (context, arr) {
    var context = Object(context) || window;
    context.fn = this;

    var result;
    if (!arr) {
        result = context.fn();
    } else {
        var args = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            args.push('arr[' + i + ']');
        }
        result = eval('context.fn(' + args + ')')
    }

    delete context.fn
    return result;
}

Function.prototype.call2 = function(obj) {
    let obj = obj || window
    // 谁调用call2谁就是this this是一个函数
    // 将函数添加到传入的obj中 也就是将函数设为对象的属性
    obj.fn = this
    // 取参数，第一个参数是要绑定的this 所以不取
    let args = [...arguments].slice(1)
    // 调用对象的属性fn 就是Object 因为call以后 要立即执行一次
    let result = obj.fn(args)
    delete obj.fn
    return result

}


