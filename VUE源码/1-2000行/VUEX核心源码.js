/**
 * 作为插件一定有install方法， 可以在其中进行混入， 
 * 当Vue实例化后挂载前拿到给其配置的store实例，把store放在原型上， 以便全局可用；
 * 持有基本的state，保存实例化router时配置的mutations，actions对象；
 * 实现commit及dispatch等方法，可对state进行一定的修改；
 * */

let Vue;
class Store {
    // 持有state，并使其响应化
    constructor(options) {
        this.state = new Vue({
            data: options.state
        })
        this.mutations = options.mytations
        this.actions = options.actions
        // 绑定this
        this.commit = this.commit.bind(this)
        this.dispatch = this.dispatch.bind(this)
    }
    // 实现commit和dispatch方法
    commit(type, arg) {
        this.mutations[type](this.state, arg)
    }
    dispatch(type, arg) {
        return this.actions[type](this.state, arg)
    }
}
// Store插件的install方法
function install(_vue) {
    Vue = _vue
    Vue.mixin({
        // 为什么用混入？use是先执行，而this指向的是Vue实例，实在main.js中后创建的
        // 使用混入，才能在vue实例的指定周期拿到store实例并做些事情
        beforeCreated() {
            if(this.$options.store) {
                Vue.prototype.$store = this.$options.store
            }
        }
    })
}

export default { Store, install }