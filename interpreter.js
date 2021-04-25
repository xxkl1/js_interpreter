import {
    isObject,
    log,
} from './utils.js'

class Scopes {
    constructor() {
        this.setup()
    }
    setup() {
        this._scopes = [{}]
    }
    add(scope = {}) {
        this._scopes.push(scope)
    }
    remove() {
        this._scopes.pop()
    }
    get all() {
        return this._scopes
    }
    get head() {
        return this._scopes[0]
    }
    get end() {
        return this._scopes[this._scopes.length - 1]
    }
    // 从_scopes尾部开始寻找，找到包含name的scope
    scopeByName(name) {
        for (let i = this._scopes.length - 1; i >= 0; i--) {
            const v = this._scopes[i]
            if (v.hasOwnProperty(name)) {
                return v
            }
        }
        return undefined
    }
    // 两层深拷贝
    static copyScope(scope) {
        const newScope = {}
        const keys = Object.keys(scope)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const v = scope[key]
            if(isObject(v)) {
                newScope[key] = Object.assign({}, v)
            } else {
                newScope[key] = v
            }
        }
        return newScope
    }
}

const interpreter = (ast) => {
    const scopes = new Scopes()

    const funcBinary = {
        'TokenType.plus': (a, b) => a + b,
        'TokenType.minus': (a, b) => a - b,
        'TokenType.multiply': (a, b) => a * b,
        'TokenType.lessThan': (a, b) => a < b,
        'TokenType.greaterThan': (a, b) => a > b,
        'TokenType.divide': (a, b) => a / b
    }

    const typeStrAst = (e) => {
        return String(e.type)
    }

    // 处理所有取值
    const valueOf = (ast) => {
        // 如果是这两个类型直接return value属性
        const typeReturn = ['TokenType.number', 'TokenType.string', 'TokenType.boolean']
        if (typeReturn.includes(typeStrAst(ast))) {
            return ast.value
        }

        let r = ast
        // logScope()
        // 处理变量
        if (typeStrAst(ast) === 'TokenType.variable') {
            r = scopes.scopeByName(ast.value)[ast.value]
            if (r === undefined) {
                return undefined
            }
            const recursionType = ['TokenType.variable', ...typeReturn]
            if (recursionType.includes(typeStrAst(r))) {
                r = valueOf(r)
            }
        }

        // 处理表达式/上面变量拿到的表达式
        const typesInterpret = ['AstType.ExpressionCall', 'AstType.ExpressionBinary']
        if (typesInterpret.includes(typeStrAst(r))) {
            r = interpretExpression(r)
        }
        return r
    }

    const scopeFromParams = (params, argus) => {
        let scope = {}
        let i = -1
        while (i < params.length - 1) {
            i++
            const cur = params[i]
            const name = cur.value
            const arg = argus[i]
            let value
            if (arg) {
                value = valueOf(arg)
            }
            scope[name] = value
        }
        return scope
    }

    function handleFor(expression) {
        if (valueOf(expression.condition)) {
            const r = interpretExpressionList(expression.body.body)
            if (r) {
                return r
            }
            interpretExpression(expression.update)
            handleFor(expression)
        }
    }

    function interpretExpression(expression) {
        log('expression:', expression)
        if (typeStrAst(expression) === 'AstType.DeclarationVariable') {
            const name = expression.variable.value
            let body = expression.value
            log('name:', name)
            log('devariable:', body)
            if (typeStrAst(body) === 'AstType.ExpressionFunction') {
                log('deExpressionFunction:', body)
                body = Object.assign({}, body)
                body.scopes = scopes.all.map(e => Scopes.copyScope(e))
            } else if (typeStrAst(body) === 'AstType.ExpressionCall') {
                body = interpretExpression(body)
            }
            scopes.end[name] = body
            // setLastScopeProto(name, body)
        } else if (typeStrAst(expression) === 'AstType.ExpressionCall') {
            // 获取函数调用的函数体
            log('callee:', expression.callee)
            const expressionCall = valueOf(expression.callee)
            log('expressionCall', expressionCall)
            if (expressionCall) {
                for (let i = 0; i < expressionCall.scopes.length; i++) {
                    const cur = expressionCall.scopes[i]
                    scopes.add(cur)
                }
                const params = expressionCall.params
                const argus = expression.arguments
                scopes.add(scopeFromParams(params, argus))
                const body = expressionCall.body.body
                const r = interpretExpressionList(body)
                scopes.remove()
                for (let i = 0; i < expressionCall.scopes.length; i++) {
                    scopes.remove()
                }
                return r
            }
        } else if (typeStrAst(expression) === 'AstType.StatementReturn') {
            log('StatementReturn:', expression.value)
            return valueOf(expression.value)
        } else if (typeStrAst(expression) === 'AstType.ExpressionBinary') {
            const func = funcBinary[typeStrAst(expression.operator)]
            if (func) {
                log('AstType.ExpressionBinary:', typeStrAst(expression.operator))
                log('expression.left:', expression.left)
                const left = valueOf(expression.left)
                log('AstType.ExpressionBinary.left:', left)
                const right = valueOf(expression.right)
                return func(left, right)
            }
        } else if (typeStrAst(expression) === 'AstType.StatementIf') {
            const condition = valueOf(expression.condition)
            log('StatementIf.condition:', expression.condition)
            if (condition) {
                scopes.add({})
                const r = interpretExpressionList(expression.consequent.body)
                scopes.remove()
                if (r) {
                    return r
                }
            } else if (expression.alternate) {
                // 有定义了alternate才进行执行
                scopes.add({})
                log('expression.alternate.body:', expression.alternate.body)
                const r = interpretExpressionList(expression.alternate.body)
                scopes.remove()
                if (r) {
                    return r
                }
            }
        } else if (typeStrAst(expression) === 'AstType.StatementWhile') {
            const condition = valueOf(expression.condition)
            if (condition) {
                log('while,coditon:', condition)
                scopes.add({})
                log('body:', expression.body.body)
                const r = interpretExpressionList(expression.body.body)
                // logScope()
                scopes.remove()
                if (r) {
                    return r
                }
                const conditionNext = valueOf(expression.condition)
                if (conditionNext) {
                    const r = interpretExpression(expression)
                    if (r) {
                        return r
                    }
                }
            }
        } else if (typeStrAst(expression) === 'AstType.StatementFor') {
            scopes.add()
            interpretExpression(expression.init)
            const r  = handleFor(expression)
            if (r) {
                return r
            }
        } else if (typeStrAst(expression) === 'AstType.ExpressionAssignment') {
            const assignName = expression.left.value
            log('all:', scopes.scopes)
            const scope = scopes.scopeByName(assignName)
            scope[assignName].value = valueOf(expression.right)
            log('scope after:', scope)
        }
    }

    function interpretExpressionList(expressionList) {
        let r
        let i = -1
        while (i < expressionList.length - 1) {
            i++
            const cur = expressionList[i]
            r = interpretExpression(cur)
        }
        return r
    }

    const r = interpretExpressionList(ast)

    // hardcode: 为了处理测试用例while_1，可以去掉，控制台和js script的输出以后再处理
    if (!r) {
        // return scopes.head['a'].value
    }

    return r
}

export default interpreter
