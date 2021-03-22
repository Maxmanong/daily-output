// FunctionalRenderContext // 创建一个包含渲染要素的函数
// createFunctionalComponent



/**
 * Vue提供了一种可以让组件变为无状态、 无实例的函数化组件。
 * 从原理上说， 一般子组件都会经过实例化的过程， 而单纯的函数组件并没有这个过程，
 * 它可以简单理解为一个中间层， 只处理数据， 不创建实例， 也是由于这个行为，它的渲染开销会低很多。
 * 实际的应用场景是， 当我们需要在多个组件中选择一个来代为渲染， 
 * 或者在将children, props, data等数据传递给子组件前进行数据处理时， 我们都可以用函数式组件来完成， 
 * 它本质上也是对组件的一个外部包装。
 */


/**
 * 函数式组件会在组件的对象定义中， 将functional属性设置为true， 这个属性是区别普通组件和函数式组件的关键。
 * 同样的在遇到子组件占位符时， 会进入createComponent进行子组件Vnode的创建。 
 * 由于functional属性的存在， 代码会进入函数式组件的分支中， 并返回createFunctionalComponent调用的结果。
 * 注意， 执行完createFunctionalComponent后， 后续创建子Vnode的逻辑不会执行， 
 * 这也是之后在创建真实节点过程中不会有子Vnode去实例化子组件的原因。(无实例)
 */

/**
 * 几乎所有JS框架或插件的编写都有一个类似的模式， 即向全局输出一个类或者说构造函数，
 *  通过创建实例来使用这个类的公开方法， 或者使用类的静态全局方法辅助实现功能。 
 * 相信精通Jquery或编写过Jquery插件的开发者会对这个模式非常熟悉。
 *  Vue.js也如出一辙， 只是一开始接触这个框架的时候对它所能实现的功能的感叹盖过了它也不过是一个内容较为丰富和精致的大型类的本质。
 */

// 定义Vue构造函数，形参options
function Vue(options) {
    // 安全性判断，如果不是生产环境且不是Vue的实例，在控制台输出警告
    if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue) {
        warn('Vue is a constructor and should be called with the `new` keyword')
    }
    // 满足条件后执行初始化
    this._init(options)
}
    // 引入初始化混合函数
    import { initMixin } from './init'
    // 引入状态混合函数
    import { stateMixin } from './state'
    // 引入视图渲染混合函数
    import { renderMixin } from './render'
    // 引入事件混合函数
    import { eventsMixin } from './events'
    // 引入生命周期混合函数
    import { lifecycleMixin } from './lifecycle'
    // 引入warn控制台错误提示函数
    import { warn } from '../util/index'
    // ...

    // 挂载初始化方法
    initMixin(Vue)
    // 挂载状态处理相关方法
    stateMixin(Vue)
    // 挂载事件响应相关方法
    eventsMixin(Vue)
    // 挂载生命周期相关方法
    lifecycleMixin(Vue)
    // 挂载视图渲染方法
    renderMixin(Vue)

// 在类构造文件的头部引入了同目录下5个文件中的混合函数
// （我认为这里只是为了要表示把一些方法混入到初始类中才统一用了Mixin的后缀，所以不要深究以为这是什么特殊的函数），
// 分别是初始化 initMixin 、状态 stateMixin 、渲染 renderMixin、事件 eventsMixin、生命周期 lifecycleMixin。
// 在文件尾部将这几个函数里包含的具体方法挂载到Vue原始类上。

// 从各个细化模块，可以看出作者是如何进行逻辑架构分类的。
// 将类继承方法按模块独立编写，单独进行挂载实现了可插拔的便利性。