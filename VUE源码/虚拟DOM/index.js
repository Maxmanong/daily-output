import util from './utils.js'
import Vnode from "./Vnode.js"


(function (global) {
    class Vn {
        constructor() {
            this.el = document.querySelector('#app')
        }
        // 创建虚拟DOM
        createVnode(tag, data, children) {
            let obj = new Vnode(tag, data, children)
            return obj
        }
        // setAttr是为节点设置属性的方法，利用DOM原生的setAttribute为每个节点设置属性值。
        setAttr(el, data) {
            if(!el) return
            const attrs = data.attrs
            if(!attrs) return
            Object.keys(attrs).forEach(a => {
                el.setAttribute(a, attrs[a])
            })
        }



        // 新旧Vnode对比
        diffVnode(newVnode, oldVnode) {
            if (!this._sameVnode(newVnode, oldVnode)) {
                // 直接更新根节点及所有子节点
                return
            }
            this.generateElm(oldVnode)
            this.patchVnode(newVnode, oldVnode);
        }
        _sameVnode(n, o) {
            return n.tag === o.tag
        }
        // generateElm的作用是跟踪每个节点实际的真实节点，方便在对比虚拟节点后实时更新真实DOM节点。
        // 执行generateElm方法后，可以在旧节点的Vnode中跟踪到每个Virtual DOM的真实节点信息。
        generateElm(vnode) {
            const traverseTree = (v, parentEl) => {
                // console.log('parentEl: ', parentEl);
                let children = v.children;
                // console.log('children: ', children);
                if (Array.isArray(children)) {
                    children.forEach((c, i) => {
                        c.elm = parentEl.childNodes[i];
                        traverseTree(c, c.elm)
                    })
                }
            }
            traverseTree(vnode, this.el);
        }
        // patchVnode是新旧Vnode对比的核心方法
        /**
         *  @description
         * 1、节点相同，且节点除了拥有文本节点外没有其他子节点。这种情况下直接替换文本内容。
         * 2、新节点没有子节点，旧节点有子节点，则删除旧节点所有子节点。
         * 3、旧节点没有子节点，新节点有子节点，则用新的所有子节点去更新旧节点。
         * 4、新旧都存在子节点。则对比子节点内容做操作。
         **/
        patchVnode(nVnode, oVnode) {
            let ele = oVnode.elm
            if (nVnode.text && nVnode.text !== oVnode) {
                // 当前真实dom元素
                
                // 子节点为文本节点
                ele.textContent = nVnode.text;
            } else {
                const oldCh = oVnode.children;
                const newCh = nVnode.children;
                // 新旧节点都存在。对比子节点
                if (util._isDef(oldCh) && util._isDef(newCh)) {
                    this.updateChildren(ele, newCh, oldCh)
                } else if (util._isDef(oldCh)) {
                    // 新节点没有子节点
                } else {
                    // 老节点没有子节点
                }
            }
        }

        updateChildren(el, newCh, oldCh) {
            // 新children开始标志
            let newStartIndex = 0;
            // 旧children开始标志
            let oldStartIndex = 0;
            // 新children结束标志
            let newEndIndex = newCh.length - 1;
            // 旧children结束标志
            let oldEndIndex = oldCh.length - 1;
            let oldKeyToId;
            let idxInOld;
            let newStartVnode = newCh[newStartIndex];
            let oldStartVnode = oldCh[oldStartIndex];
            let newEndVnode = newCh[newEndIndex];
            let oldEndVnode = oldCh[oldEndIndex];
            // 遍历结束条件
            while (newStartIndex <= newEndIndex && oldStartIndex <= oldEndIndex) {
                // 新children开始节点和旧开始节点相同
                if (this._sameVnode(newStartVnode, oldStartVnode)) {
                    this.patchVnode(newCh[newStartIndex], oldCh[oldStartIndex]);
                    newStartVnode = newCh[++newStartIndex];
                    oldStartVnode = oldCh[++oldStartIndex]
                } else if (this._sameVnode(newEndVnode, oldEndVnode)) {
                    // 新childre结束节点和旧结束节点相同
                    this.patchVnode(newCh[newEndIndex], oldCh[oldEndIndex])
                    oldEndVnode = oldCh[--oldEndIndex];
                    newEndVnode = newCh[--newEndIndex]
                } else if (this._sameVnode(newEndVnode, oldStartVnode)) {
                    // 新childre结束节点和旧开始节点相同
                    this.patchVnode(newCh[newEndIndex], oldCh[oldStartIndex])
                    // 旧的oldStartVnode移动到尾部
                    el.insertBefore(oldCh[oldStartIndex].elm, null);
                    oldStartVnode = oldCh[++oldStartIndex];
                    newEndVnode = newCh[--newEndIndex];
                } else if (this._sameVnode(newStartVnode, oldEndVnode)) {
                    // 新children开始节点和旧结束节点相同
                    this.patchVnode(newCh[newStartIndex], oldCh[oldEndIndex]);
                    el.insertBefore(oldCh[oldEndIndex].elm, oldCh[oldStartIndex].elm);
                    oldEndVnode = oldCh[--oldEndIndex];
                    newStartVnode = newCh[++newStartIndex];
                } else {
                    // 都不符合的处理，查找新节点中与对比旧节点相同的vnode
                    this.findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
                }
            }
            // 新节点比旧节点多，批量增加节点
            if (oldEndIndex <= oldStartIndex) {
                for (let i = newStartIndex; i <= newEndIndex; i++) {
                    // 批量增加节点
                    this.createElm(oldCh[oldEndIndex].elm, newCh[i])
                }
            }
        }

        createElm(el, vnode) {
            let tag = vnode.tag;
            const ele = document.createElement(tag);
            this._setAttrs(ele, vnode.data);
            const testEle = document.createTextNode(vnode.children);
            ele.appendChild(testEle)
            el.parentNode.insertBefore(ele, el.nextSibling)
        }

        // 查找匹配值
        findIdxInOld(newStartVnode, oldCh, start, end) {
            for (var i = start; i < end; i++) {
                var c = oldCh[i];
                if (util.isDef(c) && this.sameVnode(newStartVnode, c)) { return i }
            }
        }



        // 创建真实dom的方法
        createElement(vnode, options) {
            let el = options.el
            if (!el || !document.querySelector(el)) return console.error('无法找到根节点！')
            let _createElement = vnode1 => {
                const { tag, data, children } = vnode1
                const ele = document.createElement(tag)
                // 添加属性
                this.setAttr(ele, data)
                // 简单的文本节点，只要创建文本节点即可
                if(util._isPrimitive(children)) {
                    const testEle = document.createTextNode(children)
                    ele.appendChild(testEle)
                } else {
                    // 复杂的子节点需要遍历子节点递归创建节点
                    children.map(c => ele.appendChild(_createElement(c)))
                }
                return ele
            }
            document.querySelector(el).appendChild(_createElement(vnode))
        }
    }
    global.vn = new Vn()
})(window)

let createVnode = function(arr) {
    let _c = vn.createVnode
    let vnode = _c('div', { attrs: { id: 'test' } }, arr.map(a => _c(a.tag, {}, a.text)))
    return vnode
}

// 元素内容结构
let arr = [
    {
        tag: 'div',
        text: 2
    },
    {
        tag: 'div',
        text: 3
    },
    {
        tag: 'strong',
        text: 4
    }
]

let options = {
    el: '#app'
}
let vnode = createVnode(arr)
// vn.createElement(vnode, options)

console.log(vnode);

setTimeout(() => {
    arr[3] = {
        tag: 'div',
        text: '新增节点'
    }
    console.log(arr);
    let newVnode = createVnode(arr)
    vn.diffVnode(newVnode, vnode);
    console.log(newVnode);
    vn.createElement(newVnode, options)
}, 1000);

