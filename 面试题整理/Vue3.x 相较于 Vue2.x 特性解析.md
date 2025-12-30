

# Vue3.x 相较于 Vue2.x 核心新特性全解析

## 一、 底层架构重构：模块化与可扩展性提升

Vue2.x 是**单体式架构**，所有功能（响应式、编译、运行时等）打包在一起，无法按需引入，且自定义扩展难度大；Vue3.x 进行了彻底的模块化重构，这是所有新特性的底层支撑，也是容易被忽略的核心变化。

### 1. 模块化拆分（@vue/* 包体系）

Vue3 将核心功能拆分为多个独立的 npm 包，如：

- `@vue/runtime-core`：核心运行时（虚拟 DOM、组件逻辑）

- `@vue/runtime-dom`：浏览器端运行时（DOM 渲染、事件处理）

- `@vue/compiler-core`：核心编译器

- `@vue/compiler-dom`：浏览器端编译器

- `@vue/reactivity`：独立的响应式系统（可单独抽离使用，如用于非 Vue 项目）

**优势**：

- 按需引入：只打包项目用到的功能，大幅减小生产环境打包体积（相比 Vue2 体积减少约 30%）

- 灵活扩展：支持自定义渲染器（Renderer），可实现 Vue 跨平台开发（如 Vue 写小程序、桌面应用、Canvas 可视化等，典型案例：uni-app、Vue Native）

- 更好的可维护性：各模块职责单一，便于团队维护和社区贡献

### 2. 全局 API 迁移：从「全局挂载」到「应用实例」

Vue2.x 中，全局 API（`Vue.component`、`Vue.directive`、`Vue.filter`、`Vue.use` 等）直接挂载在 `Vue` 构造函数上，会造成**全局污染**，且一个页面无法创建多个独立的 Vue 应用；

Vue3.x 中，通过 `createApp()` 创建应用实例（App Instance），所有全局配置都挂载在实例上，实现**应用隔离**：

```JavaScript
// Vue2.x
import Vue from 'vue'
Vue.component('MyComponent', MyComponent) // 全局注册，所有Vue实例共享
Vue.filter('formatDate', formatDate)
new Vue({ el: '#app1' })
new Vue({ el: '#app2' }) // app1和app2共享全局组件/过滤器

// Vue3.x
import { createApp } from 'vue'
import App from './App.vue'

// 创建应用实例1
const app1 = createApp(App)
app1.component('MyComponent', MyComponent) // 仅app1可用
app1.directive('focus', focusDirective)
app1.mount('#app1')

// 创建应用实例2（与app1完全隔离）
const app2 = createApp(App)
app2.mount('#app2') // app2无法使用app1注册的组件/指令
```

## 二、 响应式系统重写：从 Object.defineProperty 到 Proxy

响应式系统是 Vue 的核心，Vue3 彻底重写了这部分逻辑，解决了 Vue2 的诸多痛点，同时提供了更灵活的响应式 API。

### 1. 核心底层变更

|特性|Vue2.x|Vue3.x|
|---|---|---|
|底层 API|Object.defineProperty|Proxy + Reflect|
|监听对象新增属性|不支持（需 Vue.set）|天然支持|
|监听对象删除属性|不支持（需 Vue.delete）|天然支持|
|监听数组下标/长度|不支持|天然支持|
|响应式粒度|对象属性级别|整个对象级别（更高效）|
|内存泄漏风险|有（依赖数组存储对象引用）|无（使用 WeakMap 存储依赖）|
### 2. 响应式 API 丰富化（易忽略的细节知识点）

Vue3 提供了 `Ref` 和 `Reactive` 两套响应式 API，以及多种辅助 API，覆盖不同场景：

#### （1）基础 API：Ref vs Reactive

- `Ref`：用于**基本数据类型**（string/number/boolean 等）的响应式，也可包裹对象；通过 `.value` 访问/修改值（模板中自动解包，无需 `.value`）

    ```typescript
    import { ref } from 'vue'
    const count = ref(0)
    console.log(count.value) // 0
    count.value++ // 修改响应式数据
    ```

- `Reactive`：用于**对象/数组类型**的响应式，返回代理对象，不可直接赋值（会丢失响应式），需修改属性

    ```typescript
    import { reactive } from 'vue'
    const user = reactive({ name: '张三', age: 20 })
    user.age++ // 正确
    // user = { name: '李四' } // 错误：直接赋值会丢失响应式
    ```

#### （2）进阶 API（易忽略）

- `shallowReactive`/`shallowRef`：浅层响应式（仅顶层属性响应式，深层属性非响应式），适合大数据对象优化（减少响应式开销）

- `readonly`/`shallowReadonly`：只读响应式（禁止修改属性，修改时会报警告），适合保护全局状态不被意外修改

- `toRef`/`toRefs`：将 reactive 对象的属性转为 ref，保持响应式关联，解决解构赋值丢失响应式的问题

    ```JavaScript
    import { reactive, toRefs } from 'vue'
    const user = reactive({ name: '张三', age: 20 })
    // 解构后丢失响应式（Vue2/Vue3 均存在）
    const { name, age } = user 
    // toRefs 解构后仍保持响应式
    const { name, age } = toRefs(user)
    ```

- `isRef`/`isReactive`/`isReadonly`：判断数据是否为对应响应式类型，用于工具函数开发

### 3. 副作用管理：Watch vs WatchEffect

Vue3 提供了两种副作用监听方式，弥补了 Vue2 `watch` 的局限性：

- `Watch`：**显式指定监听源**，与 Vue2 `watch` 功能类似，支持：

    - 监听单个/多个数据源（数组形式）

    - 深度监听（`deep: true`）

    - 立即执行（`immediate: true`）

    - 停止监听（返回停止函数）

    - 监听对象单个属性（需用函数返回）

    ```JavaScript
    import { ref, watch } from 'vue'
    const count = ref(0)
    // 停止监听
    const stopWatch = watch(count, (newVal, oldVal) => {
      console.log(`count从${oldVal}变为${newVal}`)
      if (newVal >= 10) stopWatch()
    })
    ```

- `WatchEffect`：**自动收集依赖**，无需指定监听源，默认立即执行，适合处理异步请求、DOM 操作等副作用，易被忽略但非常实用：

    ```JavaScript
    import { ref, watchEffect } from 'vue'
    const userId = ref(1)
    // 自动监听 userId 变化，无需显式指定
    watchEffect(async () => {
      const res = await fetch(`/api/user/${userId.value}`)
      const data = await res.json()
      console.log(data)
    })
    ```

## 三、 编译阶段优化：性能飞跃的关键

Vue3 在编译阶段做了大量优化，这些优化是「隐性」的（无需开发者手动操作），但对性能提升至关重要，也是容易被忽略的知识点。

### 1. 静态提升（Static Hoisting）

Vue2.x 中，每次组件渲染时，所有节点（包括静态节点，<div>静态文本</div>`）都会重新创建 VNode，造成不必要的开销；

Vue3.x 会将**静态节点/静态属性**提升到渲染函数外部，只创建一次，后续渲染直接复用，减少 VNode 创建开销：

```JavaScript
// Vue2 编译结果（每次渲染都重新创建静态 VNode）
function render() {
  return _c('div', [
    _c('p', ['静态文本']), // 静态节点，每次渲染都重新创建
    _c('p', [_v(_s(count))]) // 动态节点
  ])
}

// Vue3 编译结果（静态节点提升到外部）
const _hoisted_1 = _createVNode('p', null, '静态文本', -1 /* HOISTED */)
function render() {
  return _createVNode('div', null, [
    _hoisted_1, // 复用静态节点
    _createVNode('p', null, _toDisplayString(count), 1 /* TEXT */)
  ])
}
```

### 2. PatchFlags（补丁标记）

Vue2.x 的 diff 算法是「全量对比」，无论节点是否有动态变化，都会递归对比所有节点，性能开销大；

Vue3.x 编译时，会给**动态节点**打上「补丁标记」（PatchFlags），标记节点的动态类型（如文本、class、style、props 等），diff 阶段只对比有标记的节点，跳过静态节点，大幅提升 diff 效率：

```JavaScript
// Vue3 编译结果：动态节点打上 TEXT 标记（1 /* TEXT */）
_createVNode('p', null, _toDisplayString(count), 1 /* TEXT */)
// 其他常见标记：
// 2 /* CLASS */ - 动态class
// 4 /* STYLE */ - 动态style
// 8 /* PROPS */ - 动态props
```

### 3. 缓存优化

- **缓存事件处理函数**：Vue2 中 `<button @click="handleClick">` 每次渲染都会重新创建函数实例，导致子组件不必要的更新；Vue3 会缓存该函数，避免重复创建。

- **v-memo 指令**（易忽略）：缓存组件或节点，只有当指定的依赖发生变化时才重新渲染，适合大数据列表优化（如表格渲染）：

```typescript
<!-- 只有 [item.id](item.id) 或 item.name 变化时，才重新渲染该节点 --><div v-for="item in list" :key="[item.id](item.id)" v-memo="[[item.id](item.id), item.name]">

{{ item.name }} - {{ item.age }}

</div>
```



### 4. 其他编译优化
- **Fragment（碎片组件）**：Vue2 组件必须有唯一根节点（需<div>`），Vue3 支持多根节点，编译后自动用 `Fragment` 包裹，减少 DOM 层级，优化渲染性能。
- **v-if 与 v-for 优先级调整**：Vue2 中 `v-for` 优先级高于 `v-if`，容易导致逻辑错误（如遍历全部数据后再筛选）；Vue3 中 `v-if` 优先级高于 `v-for`，更符合直觉，避免无效遍历。
- **移除多余节点**：编译时自动移除注释、空白节点，减小 VNode 体积。

## 四、 核心 API：Composition API 替代 Options API 的痛点
Vue2.x 的 Options API（data、methods、computed、watch 等）存在明显痛点，Vue3 的 Composition API 从根本上解决了这些问题，是最核心的显性变化。

### 1. Options API 的痛点
- 逻辑分散：复杂组件的相关逻辑（如用户登录状态管理）分散在 `data`、`methods`、`watch`、`computed` 等多个选项中，形成「逻辑孤岛」，难以阅读和维护。
- 逻辑复用困难：依赖 `mixins` 实现逻辑复用，但存在「命名冲突」「来源不清晰」「多 mixins 嵌套混乱」等问题。
- TypeScript 支持差：`this` 指向不明确，类型推导困难，需要依赖 `vue-class-component` 等第三方库辅助。

### 2. Composition API 的核心优势
- **逻辑聚合**：将相关逻辑集中在一个函数中，形成「逻辑块」，便于阅读和维护（如用户相关逻辑都放在 `useUser()` 函数中）。
- **逻辑复用优雅**：通过「组合式函数（Composables，以 `use` 开头）」实现逻辑复用，无命名冲突，来源清晰（明确导入）：

```typescript
// composables/useUser.js（复用用户逻辑）
import { ref, watchEffect } from 'vue'
export function useUser() {
  const userId = ref(1)
  const userInfo = ref(null)
  // 加载用户信息
  const loadUser = async () => {
    const res = await fetch(`/api/user/${userId.value}`)
    userInfo.value = await res.json()
  }
  // 自动加载用户信息
  watchEffect(() => {
    loadUser()
  })
  return { userId, userInfo, loadUser }
}

// 组件中使用（按需导入，来源清晰）
import { useUser } from '@/composables/useUser'
export default {
  setup() {
    const { userId, userInfo, loadUser } = useUser()
    return { userId, userInfo, loadUser }
  }
}
```

- **更好的 TypeScript 支持**：函数式写法，`this` 指向明确，类型推导自然流畅，无需第三方库。

### 3. Composition API 核心细节（易忽略）

- **setup 函数**：Vue3 组件的入口，替代 Vue2 的 `beforeCreate` 和 `created` 钩子，`setup` 中无 `this` 指向，返回的对象暴露给模板和 Options API。

- **生命周期钩子**：以 `on` 开头（如 `onMounted`、`onUpdated`、`onUnmounted`），对应 Vue2 的生命周期，无 `beforeCreate` 和 `created`（被 `setup` 替代）。

- **依赖注入**：`provide` / `inject` 支持响应式传递（传递 ref/reactive 对象，子组件可响应父组件的变化），比 Vue2 更灵活。

## 五、 组件相关新特性：更灵活、更强大

<script setup>` 语法糖（Vue3.2+，易忽略细节）

这是 Vue3 最常用的语法糖，简化 Composition API 的写法，大幅提升开发效率，有多个易忽略的细节：

- 无需写 `setup` 函数，变量/函数自动暴露给模板，无需返回。

- 组件自动注册：导入的组件无需手动注册，直接使用。

- 宏函数支持：`defineProps`（定义 props）、`defineEmits`（定义事件）、`defineExpose`（暴露组件内部属性给父组件，**<script setup>`组件默认关闭暴露，需手动`defineExpose`）：



```typescript
<!-- 子组件 -->

<script setup>


import { ref } from 'vue'

// 定义 props

const props = defineProps({

title: String

})

// 定义事件

const emit = defineEmits(['change'])

// 内部状态

const count = ref(0)

// 暴露给父组件（父组件通过 $refs 访问）

defineExpose({ count })

</script>
```

### 2. Teleport（传送门，易忽略）
解决组件 DOM 嵌套过深的问题（如弹窗、模态框、提示框），可以将组件的 DOM 渲染到页面指定节点（如 `<body>`），而不改变组件的逻辑关系（父子通信、生命周期等不受影响）：
```vue
<template>
	<!-- 将弹窗渲染到 body>
    <button @click="showModal = true">打开弹窗 </button>
    <Teleport to="body">
        <div class="modal" v-if="showModal<p></p>
        <button @click="showModal = false">关闭</button>
    </Teleport>
</template>
```

### 3. Suspense 组件（实验性→稳定版，易忽略）

用于异步组件的加载状态管理，支持 `default`（异步组件）和 `fallback`（加载中提示）两个插槽，无需手动处理加载/错误状态：

```vue

<template>
	<Suspense>
<template #default>

<AsyncComponent />

<!-- 加载中提示 -->

<template #fallback>
    <div>加载</div>
</template>
</Suspense>
<script setup>
    // 定义异步组件
    import { defineAsyncComponent } from 'vue'
    const AsyncComponent = defineAsyncComponent(() => import('./Async'))
</script>
```



### 4. 组件 v-model 升级（易忽略细节）
Vue2 中组件 `v-model` 本质是 `value` 属性 + `input` 事件，一个组件只能有一个 `v-model`；

Vue3 中 `v-model` 支持自定义属性名和事件名，可实现**多个 v-model**，还支持自定义修饰符

```vue
<!-- 父组件：多个 v>
<ChildComponent
  v-model:name="username"
  v-model:age="userAge"
  v-model:email.trim="userEmail"<!-- 自定义修饰符 --><!-- 子<script setup>
const props = defineProps({
  name: String,
  age: Number,
  email: String
})
const emit = defineEmits(['update:name', 'update:age', 'update:email'])
// 修改时触发事件
const changeName = (val) => {
  emit('update:name', val)
}
</script>
```



### 5. 自定义指令升级

Vue2 自定义指令钩子：`bind`、`inserted`、`update`、`componentUpdated`、`unbind`；

Vue3 自定义指令钩子调整为更贴近组件生命周期，更易理解：`created`、`beforeMount`、`mounted`、`beforeUpdate`、`updated`、`beforeUnmount`、`unmounted`。

### 6. 过滤器（Filter）移除（易忽略）

Vue2 支持 `filters` 格式化数据，Vue3 中**彻底移除过滤器**，官方推荐使用「计算属性」或「工具函数」替代：

```vue
<script setup>
    import { ref, computed } from 'vue'
    import { formatDate } from '@/utils/date'
    const time = ref(new Date())
    const formatTime = computed(() => {
      return formatDate(time.value)
    })
</script>
```

## 六、 TypeScript 支持：原生适配，无缝集成

Vue2 对 TypeScript 的支持是「兼容式」的，Vue3 是「原生式」的，从源码到 API 都为 TypeScript 做了优化，这是核心差异之一。

### 1. 源码级 TypeScript 支持

Vue3 源码完全用 TypeScript 编写，所有 API 都有完整的类型定义，无需额外安装类型包（Vue2 需安装 `@types/vue`）。

### 2. 组件类型推导优化

- 选项式 API：通过 `defineComponent` 函数，帮助 TypeScript 推导组件选项（props、emits 等）的类型。

- 组合式 API：函数式写法天然适配 TypeScript，`ref`、`reactive` 自动推导类型，无需手动标注（也可手动指定类型）：

    ```TypeScript
    import { ref, reactive, defineComponent } from 'vue'
    
    // 自动推导类型：<number>
    const count = ref(0)
    // 手动指定类型
    const username<string>('张三')
    
    // 自动推导类型：{ name: string; age: number }
    const user = reactive({ name: '李四', age: 25 })
    
    // 选项式 API 类型推导
    export default defineComponent({
      props: {
        title: { type: String, required: true }
      },
      methods: {
        handleClick() {
          // this.title 自动推导为 string 类型
          console.log(this.title)
        }
      }
    })
    ```

### 3. 模板类型检查

配合 Volar 插件（Vue3 官方推荐，替代 Vetur），可以在模板中进行类型检查，提前发现变量类型错误、属性不存在等问题，减少运行时错误。

## 七、 其他易忽略的小特性与优化

1. **CSS 特性增强**：

<style scoped>`支持`:deep()`伪类（替代 Vue2 的`/deep/`或`>>>`），穿透 scoped 样式。

- `<style setup>` 支持 `v-bind()`，实现样式响应式（变量变化时样式自动更新）：

    ```css
    <style scoped>
        .box {
            color: v-bind(textColor); /* 使用 script setup 中的变量 */
        }
    </style>
    ```

2. **nextTick 优化**：Vue3 的 `nextTick` 返回 Promise，可配合 `async/await` 使用，更优雅：

```javascript
import { nextTick } from 'vue'
async function handleClick() {
  count.value++
  await nextTick()
  // DOM 已更新
  console.log(document.getElementById('count').innerText)
}
    
```

3. **错误处理增强**：提供 `onErrorCaptured`（组件级别）和 `app.config.errorHandler`（全局级别），更灵活地捕获和处理组件渲染、生命周期中的错误。

4. **数组方法优化**：对 `push`、`pop`、`shift`、`unshift` 等数组方法的响应式处理更高效，避免不必要的 DOM 更新。

## 总结（自查清单：容易忽略的知识点）

1. 底层模块化架构（@vue/* 包）与自定义渲染器；

2. 响应式进阶 API（shallowReactive、toRefs、WatchEffect 等）；

3. 编译阶段优化（静态提升、PatchFlags、v-memo 指令）；

4. <script setup>`中的`defineExpose`（暴露组件内部属性）；

5. Teleport 传送门与 Suspense 组件；

6. 组件多 v-model 与自定义修饰符；

7. 过滤器移除与替代方案；<style setup>` 中的 v-bind 响应式样式；

8. 全局 API 迁移到应用实例（app.component 等）；

9. Vue3 与 TypeScript 的无缝集成（defineComponent、自动类型推导）。