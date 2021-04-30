import util from './utils.js'

class Vnode {
    constructor(tag, data, children) {
        this.tag = tag
        this.data = data
        this.children = children
        this.elm = ''
        this.text = util._isPrimitive(this.children) ? this.children : ''
    }
}

export default Vnode