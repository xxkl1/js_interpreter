import {
    TokenType,
    AstType,
} from './type.js'
import {
    isObject,
    equals,
    log,
} from './utils.js'
import {
    Num,
    Var,
    Declaration,
    Less,
    Plus,
    Multiply,
    If,
    Block,
    Call,
    Assign,
    While,
    For,
    Fun,
    Class,
    True,
    False,
    Arr,
    Obj,
    objectProperty,
    Return,
} from './helper.js'

const equalsSome = function(a, l) {
    for (let i = 0; i < l.length; i++) {
        const cur = l[i]
        if (equals(a, cur)) {
            return true
        }
    }
    return false
}

// 寻找边界，并返回其在tks的下标
const indexBorder = function(tks, start, direction = 'right', borders= ['=', ' ', '\n', ';', '[', ']', '(', ')', 'return']) {
    let i = start
    while (true) {
        const cur = tks[i]
        // 结束循环
        if (cur === undefined) {
            if (direction === 'right') {
                return tks.length
            } else {
                return -1
            }
        }
        // 找到边界，返回边界下标
        if (borders.includes(cur.tokenValue)) {
            return i
        }
        // 偏移
        if (direction === 'right') {
            i++
        } else {
            i--
        }
    }
}

const parserExpression = function(tokens, start = 0) {
    const indexToLen = i => i + 1
    let i = -1
    const tks = tokens.slice(start)
    while (i < tks.length - 1) {
        i++
        let pre = tks[i - 1]
        let cur = tks[i]
        let next = tks[i + 1]

        // 关键字处理
        if (equals(cur.tokenType, TokenType.keyword)) {
            // 变量声明
            if (cur.tokenValue === 'var') {
                const index = tks.findIndex((e, i2) => i2 > i && equals(e.tokenType, TokenType.assign))
                const [name] = parserExpression(tks.slice(i + 1, index))
                i += index - 1
                const [value, offset] = parserExpression(tks.slice(i + 1))
                i += offset
                return [Declaration(name, value), indexToLen(i)]
            }
            // 函数声明
            if (cur.tokenValue === 'function') {
                // (不用检测
                i += 1
                const params = []
                while (true) {
                    i++
                    const cur = tks[i]
                    if (equals(cur.tokenType, TokenType.parenthesesRight)) {
                        break
                    }
                    if (!equals(cur.tokenType, TokenType.comma)) {
                        const [r] = parserExpression(tks.slice(i))
                        params.push(r)
                    }
                }
                const [body, offset] = parserExpression(tks.slice(i + 1))
                i += offset
                return [Fun(params, body), indexToLen(i)]
            }
            // 类声明
            if (cur.tokenValue === 'class') {
                // ()不用检测
                i += 2
                const [body, offset] = parserExpression(tks.slice(i + 1))
                i += offset
                return [Class(body), indexToLen(i)]
            }
            // if声明
            if (cur.tokenValue === 'if') {
                // (
                i += 1
                const [condition, offset] = parserExpression(tks.slice(i + 1))
                i += offset
                const index = tks.findIndex((e, i2) => {
                    if (i2 >= i && equals(e.tokenType, TokenType.curlyLeft)) {
                        return true
                    } else {
                        return false
                    }
                })
                i = index
                const [consequent, offset2] = parserExpression(tks.slice(i))
                i += offset2 - 1
                let alternate = {}
                const next = tks[i + 1]
                if (next && next.tokenValue === 'else') {
                    i++
                    const [r, offset3] = parserExpression(tks.slice(i + 1))
                    alternate = r
                    i += offset3
                }
                return [If(condition, consequent, alternate), indexToLen(i)]
            }
            // while声明
            if (cur.tokenValue === 'while') {
                // (
                i += 1
                const [condition, offset] = parserExpression(tks.slice(i + 1))
                i += offset
                const index = tks.findIndex((e, i2) => {
                    if (i2 >= i && equals(e.tokenType, TokenType.curlyLeft)) {
                        return true
                    } else {
                        return false
                    }
                })
                i = index
                const [body, offset2] = parserExpression(tks.slice(i))
                i += offset2 - 1
                return [While(condition, body), indexToLen(i)]
            }
            // for声明
            if (cur.tokenValue === 'for') {
                // (
                i += 1
                const [init, offset1] = parserExpression(tks.slice(i + 1))
                i += offset1
                const [condition, offset2] = parserExpression(tks.slice(i + 1))
                i += offset2
                const [update, offset3] = parserExpression(tks.slice(i + 1))
                i += offset3
                const index = tks.findIndex((e, i2) => {
                    return i2 >= i && equals(e.tokenType, TokenType.curlyLeft)
                })
                i = index - 1
                const [body, offset4] = parserExpression(tks.slice(i + 1))
                i += offset4
                return [For(init, condition, update, body), indexToLen(i)]
            }

            // return
            if (cur.tokenValue === 'return') {
                log('进入 return处理')
                const [v, offset] = parserExpression(tks.slice(i + 1))
                i += offset
                return [Return(v), indexToLen(i)]
            }
        }

        // 处理变量和数字
        const types = [TokenType.variable, TokenType.number]
        if (equalsSome(cur.tokenType, types)) {
            // 变量处理
            if(equals(cur.tokenType, TokenType.variable)) {
                const types = [TokenType.variable, TokenType.dot]
                // 获取下一个不是变量和.的token的index
                let iCheck = i + 1
                while (true) {
                    const v = tks[iCheck]
                    if (!v || !equalsSome(v.tokenType, types)) {
                        break
                    }
                    iCheck++
                }
                const vCheck = tks[iCheck]

                if (vCheck) {
                    // 检查到(，函数调用表达式
                    if (equals(vCheck.tokenType, TokenType.parenthesesLeft)) {
                        const [callee] = parserExpression(tks.slice(i, iCheck))
                        // 变量到(部分无需再检测
                        i = iCheck
                        // 处理args获取
                        const args = []
                        while (true) {
                            i++
                            const cur = tks[i]
                            if (equals(cur.tokenType, TokenType.parenthesesRight)) {
                                break
                            }
                            if (!equals(cur.tokenType, TokenType.comma)) {
                                const [r] = parserExpression(tks.slice(i))
                                args.push(r)
                            }
                        }
                        return [Call(callee, args), indexToLen(i)]
                    }
                    // 检查到=，赋值表达式
                    if (equals(vCheck.tokenType, TokenType.assign)) {
                        const [left] = parserExpression(tks.slice(i, iCheck))
                        // 偏移到=
                        i = iCheck
                        const [right, offset] = parserExpression(tks.slice(i))
                        i += offset - 1
                        return [Assign(left, right), indexToLen(i)]
                    }
                }

                // 不是以上几种情况，判断next是否是[和.，进入ExpressionMember表达式声明
                const typesMember = [TokenType.bracketLeft, TokenType.dot]
                if (next && equalsSome(next.tokenType, typesMember)) {
                    const [object] = parserExpression([cur])
                    // 处理property获取
                    // typesMember边界无需再检测
                    i += 1
                    const [property, offset] = parserExpression(tks.slice(i + 1))
                    i += offset
                    const o = {
                        type: AstType.ExpressionMember,
                        object,
                        property,
                    }
                    return [o, indexToLen(i)]
                }
            }

            // 变量和数字公共处理：逻辑判断 和 对象属性
            if (next) {
                const types = [TokenType.lessThan]
                const indexExpressRight = indexBorder(tks, i, 'right', '\n;)')
                const hasToken = tks.slice(i + 1, indexExpressRight).some(e => equalsSome(e.tokenType, types))
                // 处理逻辑判断
                if (hasToken) {
                    i = tks.findIndex(e => equalsSome(e.tokenType, types))
                    // 更新三个元素获取
                    pre = tks[i - 1]
                    cur = tks[i]
                    next = tks[i + 1]
                    let index = indexBorder(tks, i, 'left', '\n;=')
                    if (index === -1) {
                        index = 0
                    }
                    const [left] = parserExpression(tks.slice(index, i))
                    const [right, offset] = parserExpression(tks.slice(i + 1))
                    i += offset
                    // todo: 这里先暂时只有小与
                    return [Less(left, right), indexToLen(i)]
                }
                // 处理对象属性
                if (equals(next.tokenType, TokenType.colon)) {
                    const [key] = parserExpression([cur])
                    i += 1
                    const [value, offset] = parserExpression(tks.slice(i + 1))
                    i += offset
                    return [objectProperty(key, value), indexToLen(i)]
                }
            }

            // 都不是以上情况，单个变量或数字的生成
            const l = [
                {
                    type: TokenType.number,
                    func: Num,
                },
                {
                    type: TokenType.variable,
                    func: Var,
                },
            ]
            const r = l.find(e => equals(cur.tokenType, e.type))
            if (r) {
                return [r.func(cur.tokenValue), indexToLen(i)]
            }
        }

        // 算术表达式
        const typesBinary = [TokenType.plus, TokenType.minus, TokenType.multiply, TokenType.divide]
        if (equalsSome(cur.tokenType, typesBinary)) {
            const l = [
                {
                    type: TokenType.plus,
                    func: Plus,
                },
                {
                    type: TokenType.multiply,
                    func: Multiply,
                },
            ]
            const r = l.find(e => equals(cur.tokenType, e.type))
            if (r) {
                const func = r.func
                const [left, offset] = parserExpression(tks.slice(i + 1))
                i += offset
                const [right, offsetRight] = parserExpression(tks.slice(i + 1))
                i += offsetRight
                return [func(left, right), indexToLen(i)]
            }
        }

        // 数组声明
        if (equals(cur.tokenType, TokenType.bracketLeft)) {
            const elements = []
            while (true) {
                i++
                const cur = tks[i]
                if (equals(cur.tokenType, TokenType.bracketRight)) {
                    break
                } else if (!equals(cur.tokenType, TokenType.comma)) {
                    const [r] = parserExpression(tks.slice(i))
                    elements.push(r)
                }
            }
            return [Arr(elements), indexToLen(i)]
        }

        // 对象声明 和 作用域声明
        // tks是一个{开头的tks，寻找对应结束的}的坐标
        const indexCurlyRight = function(tks) {
            const stack = []
            let i = -1
            while (i < tks.length - 1) {
                i++
                const cur = tks[i]
                if (equals(cur.tokenType, TokenType.curlyLeft)) {
                    stack.push(cur)
                }
                if (equals(cur.tokenType, TokenType.curlyRight)) {
                    stack.pop()
                    if (stack.length === 0) {
                        return i
                    }
                }
            }
        }
        if (equals(cur.tokenType, TokenType.curlyLeft)) {
            // 对象声明
            if (pre && equals(pre.tokenType, TokenType.assign)) {
                const elements = []
                while (true) {
                    i++
                    const cur = tks[i]
                    if (equals(cur.tokenType, TokenType.curlyRight)) {
                        break
                    } else if (!equals(cur.tokenType, TokenType.comma)) {
                        const [r, offset] = parserExpression(tks.slice(i))
                        i += offset - 1
                        elements.push(r)
                    }
                }
                return [Obj(elements), indexToLen(i)]
            }
            // 作用域声明
            else {
                const indexRight = indexCurlyRight(tks)
                const lBlock = tks.slice(i + 1, indexRight)
                const [block] = parserExpressionList(lBlock)
                return [Block(block), indexToLen(indexRight)]
            }
        }

        // 布尔值
        if (equals(cur.tokenType, TokenType.boolean)) {
            if (cur.tokenValue === 'true') {
                return [True(), indexToLen(i)]
            } else {
                return [False(), indexToLen(i)]
            }
        }
    }
    return [null, tks.length]
}

const parserExpressionList = function(tks) {
    const r = []
    let i = -1
    while (i < tks.length - 1) {
        const [o, offset] = parserExpression(tks.slice(i + 1))
        i += offset
        if (o && isObject(o)) {
            r.push(o)
        }
    }
    return [r, tks.length]
}

const parser = function(tokens) {
    // 将输入的tokens中的中缀表达式转为前缀表达式
    const handleBinary = function(tks) {
        // 中缀转前缀
        const centerToHeadBinary = function(tokens) {
            const priority = {
                'TokenType.plus': 0,
                'TokenType.minus': 0,
                'TokenType.multiply': 1,
                'TokenType.divide': 1,
            }
            let r
            const typeOps = [TokenType.plus, TokenType.minus, TokenType.multiply, TokenType.divide]
            const temp = []
            const opStack = []
            let i = tokens.length
            while (i > 0) {
                i--
                const cur = tokens[i]
                if (equals(cur.tokenType, TokenType.parenthesesRight)) {
                    opStack.push(cur)
                } else if (equals(cur.tokenType, TokenType.parenthesesLeft)) {
                    let r
                    while (!r || !equals(r.tokenType, TokenType.parenthesesRight)) {
                        r = opStack.pop()
                        if (!equals(r.tokenType, TokenType.parenthesesRight)) {
                            temp.push(r)
                        }
                    }
                } else if (equalsSome(cur.tokenType, typeOps)) {
                    while (true) {
                        const headStack = opStack[opStack.length - 1]
                        if (headStack) {
                            const isMin = priority[String(cur.tokenType)] < priority[String(headStack.tokenType)]
                            if (isMin) {
                                temp.push(opStack.pop())
                            } else {
                                break
                            }
                        } else {
                            break
                        }
                    }
                    opStack.push(cur)
                } else {
                    temp.push(cur)
                }
            }
            while (opStack.length) {
                temp.push(opStack.pop())
            }
            r = temp.reverse()
            return r
        }
        let r = []
        const typesBinary = [TokenType.plus, TokenType.minus, TokenType.multiply, TokenType.divide]
        let i = -1
        while (i < tks.length - 1) {
            i++
            const cur = tks[i]
            const next = tks[i + 1]
            const nextNext = tks[i + 2]
            // 检测到算术符号
            if (equalsSome(cur.tokenType, typesBinary)) {
                const indexLeft = indexBorder(tks, i, 'left')
                const indexRight = indexBorder(tks, i)
                // 偏移，偏移到右边界前面一个，这样右边界不会漏掉
                i = indexRight - 1
                // 中缀表达式tokens
                const l = tks.slice(indexLeft + 1, indexRight)
                // 前缀表达式tokens
                const l2 = centerToHeadBinary(l)
                r = r.concat(l2)
            } else if ((!next || !equalsSome(next.tokenType, typesBinary) && (!nextNext || !equalsSome(nextNext.tokenType, typesBinary)))) {
                // 指不是算术式子里面到，或第一个是判断 1 + 1，第二个是判断(1 + 1)
                r.push(cur)
            } else if (equals(cur.tokenType, TokenType.assign)) {
                r.push(cur)
            }
        }
        return r
    }
    const l = handleBinary(tokens)
    log('转前缀后的tokenList:', l)
    const [r] = parserExpressionList(l)
    return r
}

export default parser
