/**
 * @description 虚拟DOM（virtual node）
 * 频繁重建删除DOM是很耗性能的操作，所以：
 * Vue 使用 JS 对象将浏览器的 DOM 进行的抽象， 这个抽象被称为 Virtual DOM。
 * Virtual DOM 的每个节点被定义为VNode， 当每次执行render function时，
 * Vue 对更新前后的VNode进行Diff对比， 找出尽可能少的需要更新的真实 DOM 节点，
 * 然后只更新需要更新的节点， 从而解决频繁更新 DOM 产生的性能问题。
 *  */
/**
 * @description Diff 算法
 * Diff 将新老 VNode 节点进行比对， 然后将根据两者的比较结果进行最小单位地修改视图，
 * 而不是将整个视图根据新的 VNode 重绘， 进而达到提升性能的目的。
 * Vue.js 内部的 diff 被称为patch。
 * 其 diff 算法的是通过同层的树节点进行比较， 而非对树进行逐层搜索遍历的方式，
 * 所以时间复杂度只有O(n)， 是一种相当高效的算法。
 * 1、 首先定义新老节点是否相同判定函数sameVnode： 满足键值key和标签名tag必须一致等条件， 返回true， 否则false。
 * 2、 在进行patch之前， 新老 VNode 是否满足条件sameVnode(oldVnode, newVnode)， 满足条件之后， 进入流程patchVnode，
 * 3、 否则被判定为不相同节点， 此时会移除老节点， 创建新节点。
 */
    /**
     * @description Diff算法中的patchNode（判定如何对子节点进行更新）
     * 1、如果新旧Vnode都是静态的，同时它们的key相同（代表同一节点），并且新的Vnode是clone或者是标记了once（标记v-once，只渲染一次），
     * 那么只需要替换DOM以及Vnode即可，
     * 2、新老节点均有子节点， 则对子节点进行 diff 操作，进行updateChildren，这个 updateChildren 也是 diff 的核心。
     * 3、如果老节点没有子节点而新节点存在子节点， 先清空老节点 DOM 的文本内容， 然后为当前 DOM 节点加入子节点。
     * 4、当新节点没有子节点而老节点有子节点的时候， 则移除该 DOM 节点的所有子节点。
     * 5、 当新老节点都无子节点的时候，只是文本的替换。
     */

    /**
     * @description updateChildren（Diff的核心）
     * 在对比过程中，由于老的子节点存在对当前真实 DOM 的引用，新的子节点只是一个 VNode 数组，
     * 所以在进行遍历的过程中，若发现需要更新真实 DOM 的地方，则会直接在老的子节点上进行真实 DOM 的操作，
     * 等到遍历结束， 新老子节点则已同步结束。
     * 1、updateChildren内部定义了4个变量，分别是oldStartIdx、oldEndIdx、newStartIdx、newEndIdx，分别表示正在Diff对比的新老子节点的左右边界点索引。
     * 2、在老子节点数组中，索引在oldStartIdx与oldEndIdx中间的节点，表示老子节点中未被遍历处理的节点，所以小于oldStartIdx或大于oldEndIdx的表示已被遍历处理的节点。
     * 3、在新的子节点数组中，索引在newStartIdx与newEndIdx中间的节点，表示老子节点中未被遍历处理的节点，所以小于newStartIdx或大于newEndIdx的表示已被遍历处理的节点。
     * 4、每一次遍历，oldStartIdx和oldEndIdx与newStartIdx和newEndIdx之间的距离会向中间靠拢。
     * 5、当 oldStartIdx > oldEndIdx 或者 newStartIdx > newEndIdx 时结束循环。
     * 
     * 
     * 在遍历中， 取出4索引对应的 Vnode节点：
     * 1、oldStartIdx： oldStartVnode
     * 2、oldEndIdx： oldEndVnode
     * 3、newStartIdx： newStartVnode
     * 4、newEndIdx： newEndVnode
     * diff 过程中， 如果存在key， 并且满足sameVnode， 会将该 DOM 节点进行复用， 否则则会创建一个新的 DOM 节点。
     */
    /**
     * @description 新老Vnode比较过程
     * 首先， oldStartVnode、 oldEndVnode与newStartVnode、newEndVnode两两比较，一共有 2 * 2 = 4 种比较方法。
     *   情况一：当oldStartVnode与newStartVnode满足 sameVnode，则oldStartVnode与newStartVnode进行 patchVnode， 
     * 并且oldStartIdx与newStartIdx右移动。
     *   情况二：当oldEndVnode与newEndVnode满足 sameVnode，则oldEndVnode与newEndVnode进行 patchVnode，
     * 并且oldEndIdx与newEndIdx左移动。
     *   情况三：当oldStartVnode与newEndVnode满足 sameVnode，则说明oldStartVnode已经跑到了oldEndVnode后面去了，
     * 此时oldStartVnode与newEndVnode进行 patchVnode 的同时， 还需要将oldStartVnode的真实 DOM 节点移动到oldEndVnode的后面，
     * 并且oldStartIdx右移，newEndIdx左移。
     *   情况四： 当oldEndVnode与newStartVnode满足 sameVnode， 则说明oldEndVnode已经跑到了oldStartVnode前面去了，
     * 此时oldEndVnode与newStartVnode进行 patchVnode 的同时， 还需要将oldEndVnode的真实 DOM 节点移动到oldStartVnode的前面，
     * 并且oldStartIdx右移，newEndIdx左移。
     *   情况五： 当这四种情况都不满足，则在oldStartIdx与oldEndIdx之间查找与newStartVnode满足sameVnode的节点，
     * ①、若存在，则将匹配的节点真实 DOM 移动到oldStartVnode的前面。 
     * ②、若不存在，说明newStartVnode为新节点，创建新节点放在oldStartVnode前面即可。
     * 
     * 
     * 当 oldStartIdx > oldEndIdx 或者 newStartIdx > newEndIdx，循环结束，这个时候需要处理那些未被遍历到的 VNode。
     * 1、当 oldStartIdx > oldEndIdx 时，说明老的节点已经遍历完， 而新的节点没遍历完，
     * 这个时候需要将新的节点创建之后放在oldEndVnode后面。
     * 2、当 newStartIdx > newEndIdx 时，说明新的节点已经遍历完，而老的节点没遍历完，
     * 这个时候要将没遍历的老的节点全都删除。
     */