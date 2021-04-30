function MyPromise(executor) {
    let self = this
    self.value = null
    self.error = null
    self.status = 'PENDING'


    self.onFulfilledCallbacks = []
    self.onRejectedCallbacks = []

    const resolve = val => {
        if (self.status !== 'PENDING') return

        setTimeout(() => {
            self.status = 'FUFILLED'
            self.value = val
            self.onFulfilledCallbacks.forEach(callback => {
                callback(self.value)
            })
        }, 0);
    }

    const reject = err => {
        if(self.status !== 'PENDING') return

        setTimeout(() => {
            self.status = 'REJECTED'
            self.error = err
            self.onRejectedCallbacks.forEach(callback => {
                callback(self.error)
            })
        }, 0);
    }
    executor(resolve, reject)
}

function resolvePromise(bridgePromise, x, resolve, reject) {
    if(x instanceof MyPromise) {
        if (x.status === 'PENDING') {
            x.then(y => { resolvePromise(bridgePromise, y, resolve, reject) }, error => {  reject(error) })
        } else {
            x.then(resolve, reject)
        }
    } else {
        resolve(x)
    }
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : error => { throw error }
    console.log('onRejected: ', onRejected);
    let bridgePromise, self = this
    if (self.status === 'PENDING') {
        return bridgePromise = new MyPromise((resolve, reject) => {
            self.onFulfilledCallbacks.push((value) => {
                try {
                    let x = onFulfilled(value)
                    resolvePromise(bridgePromise, x, resolve, reject)
                } catch(e) {
                    reject(e)
                }
            })
            console.log('onFulfilledCallbacks:', self.onFulfilledCallbacks[0]);
            self.onRejectedCallbacks.push((error) => {
                try {
                    let x = onRejected(error)
                    resolvePromise(bridgePromise, x, resolve, reject)
                } catch(e) {
                    reject(e)
                }
            })
        })
    } else if(this.status === 'FUFILLED') {
        console.log('------------FUFILLED--------');
        return bridgePromise = new MyPromise((resolve, reject) => {
            try {
                let x = onFulfilled(self.value)
                resolvePromise(bridgePromise, x, resolve, reject)
            } catch(e) {
                reject(e)
            }
        })
        
    } else if(self.status === 'REJECTED') {
        console.log('------------REJECTED--------');
        return bridgePromise = new MyPromise((resolve, reject) => {
            try {
                let x = onRejected(self.error)
                resolvePromise(bridgePromise, x, resolve, reject)
            } catch(e) {
                reject(e)
            }
        })
    }
    return this
}

function MP1() {
    let p1 = new MyPromise((resolve, reject) => {
        let num = parseInt(Math.random() * 100)
        setTimeout(() => {
            if(num >= 50) {
                resolve(num)
            } else {
                reject(num)
            }
        }, 3000);
    })
    return p1
}
function MP2() {
    let p2 = new MyPromise(function (resolve, reject) {
        let num2 = parseInt(Math.random() * 1000)
        setTimeout(() => {
            if (num2 >= 500) {
                resolve(num2)
            } else {
                reject(num2)
            }
        }, 3000)
    })
    return p2
}
MP1()
.then(value => {
    console.log('大于或者等于50的num值为: ', value)
    return MP2()
}, error => {
    console.log('小于50的num为: ', error)
    return MP2()
})
.then(value => {
    console.log('大于或者等于500的num2值为: ', value)
}, error => {
    console.log('小于500的num2为: ', error)
})