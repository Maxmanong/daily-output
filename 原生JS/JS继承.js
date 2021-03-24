// JS实现继承的方式

// 1、借助call

function Parents(age, live) {
    this.name = '借助call方式实现继承'
    this.age = age
    this.live = live
}
function Child() {
    Parents.call(this, ...arguments)
}
let child = new Child(18, true)

console.log('child: ', child)
// 这样写的时候子类虽然能够拿到父类的属性值， 但是问题是父类原型对象中一旦存在方法那么子类无法继承。


// 2、借助原型链
function Parents1(age) {
    this.name = "借助原型链实现继承"
    this.age = age
}
function Child1() {
    this.type = 'Child1'
}
Child1.prototype = new Parents1()


let child1 = new Child1()

console.log("child1: ", child1.name)
// 改变实例的属性会影响到父类的属性，因为共用一个原型对象（引用类型）

// 3、将前两中组合 

function Parents2(age) {
    this.name = '借助组合式实现继承'
    this.age = age
    this.arr = [1, 2, 3]
}
function Child2() {
    this.type = 'Child2'
    Parents2.call(this, ...arguments)
}
Child2.prototype = new Parents2()

let child2 = new Child2(12)
let anthorChild2 = new Child2(13)
child2.arr.push(4)
console.log('child2: ', child2)
console.log('anthorChild2: ', anthorChild2)
// 这种继承的问题 那就是Parent2的构造函数会多执行了一次（Child2.prototype = new Parent2();）

// 4、组合继承的优化1
function Parents3(age) {
    this.age = age
    this.name = '组合继承的优化1'
}
function Child3() {
    Parents.call(this, ...arguments)
    this.type = 'Child3'
}
// 这里让将父类原型对象直接给到子类，父类构造函数只执行一次，
// 而且父类属性和方法均能访问
Child2.prototype = Parents3.prototype
// 这种继承的问题是： 子类实例的构造函数是Parent3，显然这是不对的，应该是Child3。

// 5、寄生组合式继承
function Parents4(age) {
    this.age = age
    this.name = '寄生组合式继承'
}
function Child4() {
    Parents.apply(this, [...arguments])
    this.type = 'Child4'
}
Child4.prototype = Object.create(Parents4.prototype)
Child4.prototype.constructor = Child4
// 这是最推荐的一种方式， 接近完美的继承， 它的名字也叫做寄生组合继承。

// 6、ES6的extends
// 它用的就是寄生组合式继承，但是加了一个Object.setPrototypeOf(subClass, superClass)
// 是用来继承父类的静态方法。这也是原来的继承方式疏忽掉的地方。


// 扩展：面向对象继承的问题
// 无法决定继承哪些属性， 所有属性都得继承。
/**
 * 一方面父类是无法描述所有子类的细节情况的， 为了不同的子类特性去增加不同的父类， 代码势必会大量重复
 * 另一方面一旦子类有所变动， 父类也要进行相应的更新， 代码的耦合性太高， 维护性不好。
 * 
 * 用组合， 这也是当今编程语法发展的趋势， 比如golang完全采用的是面向组合的设计方式。
 * 面向组合就是先设计一系列零件， 然后将这些零件进行拼装， 来形成不同的实例或者类。
 */

function drive(){
    console.log("wuwuwu!");
}

function music() {
    console.log("lalala!")
}

function addOil() {
    console.log("哦哟！")
}

 let car = compose(drive, music, addOil);
 let newEnergyCar = compose(drive, music);