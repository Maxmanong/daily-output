// mergeVNodeHook // 重点 合并 VNode

// vnode 原本定义了 init、 prepatch、 insert、 destroy 四个钩子函数，
// 而 mergeVNodeHook 函数就是把一些新的钩子函数合并进来， 例如在 transition 过程中合并的 insert 钩子函数，
// 就会合并到组件 vnode 的 insert 钩子函数中， 这样当组件插入后， 就会执行我们定义的 enterHook 了

// 第 2426 行至第 2490 行

// initProvide
// initInjections
// resolveInject

// 第 2497 行至第 2958 行
/**
 * 
 * resolveSlots // Runtime helper for resolving raw children VNodes into a slot object.
 * isWhitespace
 * normalizeScopedSlots
 * normalizeScopedSlot
 * proxyNormalSlot
 * renderList // Runtime helper for rendering v-for lists.
 * renderSlot // Runtime helper for rendering <slot>
 * resolveFilter // Runtime helper for resolving filters
 * checkKeyCodes // Runtime helper for checking keyCodes from config.
 * bindObjectProps //  Runtime helper for merging v-bind="object" into a VNode's data.
 * renderStatic // Runtime helper for rendering static trees.
 * markOnce // Runtime helper for v-once.
 */

// 这一部分讲的是辅助程序—— Vue 的各类渲染方法
// installRenderHelpers // installRenderHelpers 用于执行以上。