const log = (...args) => {
    // 如果想在 console 里面查看结果
    console.log(...args)
    // let t = ''
    // for (let i = 0; i < args.length; i++) {
    //     let e = args[i]
    //     if (isObject(e) || isArray(e)) {
    //         // let s = JSON.stringify(e, null, 2)
    //         let s = json(e)
    //         t += `<pre>${s}<pre><hr>`
    //     } else {
    //         t += `<p>${e}</p>`
    //     }
    // }
    // let result = e('#id-div-log')
    // result.innerHTML += t
}

const e = selector => document.querySelector(selector)

const isArray = o => {
    return Array.isArray(o)
}

const isObject = o => {
    return Object.prototype.toString.call(o) === '[object Object]'
}

const ensure =  (condition, message) => {
    if (!condition) {
        log('测试失败', message)
    } else {
        log('测试成功')
    }
}

const equals = (a, b) => {
    if (isArray(a) && isArray(b)) {
        if (a.length !== b.length) {
            return false
        }
        for (let i = 0; i < a.length; i++) {
            let a1 = a[i]
            let b1 = b[i]
            if (!equals(a1, b1)) {
                return false
            }
        }
        return true
    } else if (isObject(a) && isObject(b)) {
        let keys1 = Object.keys(a)
        let keys2 = Object.keys(b)
        if (keys1.length !== keys2.length) {
            return false
        }
        for (let i = 0; i < keys1.length; i++) {
            let k1 = keys1[i]
            let k2 = keys2[i]
            if (!equals(a[k1], b[k2])) {
                return false
            }
        }
        return true
    } else {
        return a === b
    }
}

export {
    log,
    e,
    isArray,
    isObject,
    ensure,
    equals,
}

