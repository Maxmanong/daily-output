class Util {
    constructor() {}
    // 检测基础类
    _isPrimitive(value) {
        return (typeof value === 'string' || typeof value === 'number' || typeof value === 'symbol' || typeof value === 'boolean')
    }

    // 判断不能为空
    _isDef(v) {
        return v !== undefined && v !== null
    }
}
const util = new Util()

export default util