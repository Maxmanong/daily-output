/**
 *  实现一个批量请求函数 multiRequest(urls, maxNum)， 要求如下：
 *  1、要求最大并发数 maxNum
 *  2、每当有一个请求返回， 就留下一个空位， 可以增加新的请求
 *  3、所有请求完成后， 结果按照 urls 里面的顺序依次打出 
*/

function multiRequest(urls = [], maxNum) {
    // 请求总数量
    const len = urls.length
    // 根据请求数量创建一个数组来保存请求的结果
    const result = new Array(len).fill(false)
    // 当前完成的数量
    let count = 0


    return new Promise((resolve,reject) => {
        // 请求的总数量限制maxNum个
        while(count < maxNum) {
            next()
        }
        function next() {
            let current = count++
            // 处理边界条件
            if(current >= len) {
                // 请求全部完成就将promise置为成功状态，然后将result作为promise值返回
                !result.includes(false) && resolve(reslut)
                return
            }
            const url = urls[current]
            fetch(url)
            .then((res) => {
                // 保存请求结果
                result[current] = res
                // 如果请求没有完全完成，就递归
                if(current < len) {
                    next()
                }
            })
            .catch((error) => {
                result[current] = error
                // 如果请求没有完全完成，就递归
                if(current < len) {
                    next()
                }
            })
        }
    })
}