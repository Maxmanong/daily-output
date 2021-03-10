// 可继续遍历的类型        
const mapTag = '[object Map]' 
const setTag = '[object Set]' 
const arrayTag = '[object Array]'
const objectTag = '[object Object]'
const argsTag = '[object Arguments]'
// 不可遍历的数据类型 
const boolTag = '[object Boolean]'
const dateTag = '[object Date]'
const numberTag = '[object Number]'
const stringTag = '[object String]'
const symbolTag = '[object Symbol]'
const errorTag = '[object Error]'
const regexpTag = '[object Regexp]'
const funcTag = '[object Function]'
// 可继续遍历的类型的数组
const deepTag = [mapTag, setTag, arrayTag, objectTag, argsTag]
// 工具函数 while 循环
function forEachWhile (array, iteratee) {
    let index = -1
    const length = array.length
    while (++index < length) {
        iteratee(array[index], index)
    }
    return array
}
// 工具函数，判断是否为引用类型
function isObject (target) {
    const type = typeof target
    return target !== null && (type === 'object' || type === 'function')
}
// 工具函数，获取实际类型
function getType (target) {
    return Object.prototype.toString.call(target)
}
// 工具函数， 初始化被克隆的对象
function getInit (target) {
    const Ctor = target.constructor
    return new Ctor()
}
// 工具函数，克隆symbol
function cloneSymbol (target) {
    return Object(Symbol.prototype.valueOf.call(target))
}
// 工具函数，克隆正则
function cloneReg (target) {
    const reFlags = /\w*$/
    const result = new target.constructor(target.source, reFlags.exec(target))
    result.lastIndex = target.lastIndex
    return result
}
// 工具函数，克隆函数
function cloneFunction (target) {
    const bodyReg = /(?<={)(.|\n)+(?=})/m 
    const paramReg = /(?<=\().+(?=\)\s+{)/
    const funcString = target.toString()
    if (target.prototype) {
        const param = paramReg.exec(funcString)
        const body = bodyReg.exec(funcString)
        if (body) {
            if (param) {
                const paramArr = param[0].split(',')
                return new Function(...paramArr, body[0])
            } else {
                return new Function(body[0])
            }
        } else {
            return null
        }
    } else {
        return eval(funcString)
    }
}
// 工具函数，克隆不可比遍历类型
function cloneOtherType (target, type) {
    const CtorFun = target.constructor
    switch (type) {
        case boolTag:
        case numberTag:
        case stringTag:
        case errorTag:
        case dateTag:
            return new CtorFun(target)
        case regexpTag:
            return cloneReg(target)
        case symbolTag:
            return cloneSymbol(target)
        case funcTag:
            return cloneFunction(target)
        default:
            return null
    }
}
// deepClone 主函数
function deepClone (target, map = new WeakMap()) {
    // 原始类型直接返回
    if (!isObject(target)) {
        return target
    }
    // 根据不同类型进行不同的操作
    const type = getType(target)
    let cloneTarget
    if (deepTag.includes(type)) {
        cloneTarget = getInit(target, type)
    } else {
        return cloneOtherType(target, type)
    }
    // 处理循环引用
    if (map.get(target)) {
        return target
    }
    map.set(target, cloneTarget)
    // 处理map和set
    if (type === setTag) {
        target.forEach(value => {
            cloneTarget.add(clone(value))
        })
        return cloneTarget
    }
    if (type === mapTag) {
        target.forEach((value, key) => {
            cloneTarget.set(key, deepClone(value))
        })
        return cloneTarget
    }
    // 处理对象和数组
    // Object.keys(): 一个表示给定对象的所有可枚举属性的字符串数组
    const keys = type === arrayTag ? undefined : Object.keys(target)
    forEachWhile(keys || target, (value, key) => {
        if (keys) {
            key = value
            console.log('key: ', key)
            console.log('value: ', value)
        }
        cloneTarget[key] = deepClone(target[key], map)
    })
    return cloneTarget
}