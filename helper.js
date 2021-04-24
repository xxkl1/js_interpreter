import {
    TokenType,
    AstType,
} from './type.js'

const Num = (n) => {
    return {
        type: TokenType.number,
        value: n,
    }
}

const Str = (s) => {
    return {
        type: TokenType.string,
        value: s,
    }
}

const Var = (v) => {
    return {
        type: TokenType.variable,
        value: v,
    }
}

const Declaration = (name, value) => {
    return {
        type: AstType.DeclarationVariable,
        kind: 'var',
        variable: name,
        value: value,
    }
}

const Less = (left, right) => {
    return {
        type: AstType.ExpressionBinary,
        operator: {
            type: TokenType.lessThan,
            value: '<',
        },
        left: left,
        right: right,
    }
}

const Greater = (left, right) => {
    return {
        type: AstType.ExpressionBinary,
        operator: {
            type: TokenType.greaterThan,
            value: '>',
        },
        left: left,
        right: right,
    }
}

const Plus = (left, right) => {
    return {
        type: AstType.ExpressionBinary,
        operator: {
            type: TokenType.plus,
            value: '+',
        },
        left: left,
        right: right,
    }
}

const Minus = (left, right) => {
    return {
        type: AstType.ExpressionBinary,
        operator: {
            type: TokenType.minus,
            value: '-',
        },
        left: left,
        right: right,
    }
}

const Multiply = (left, right) => {
    return {
        type: AstType.ExpressionBinary,
        operator: {
            type: TokenType.multiply,
            value: '*',
        },
        left: left,
        right: right,
    }
}

const Divide = (left, right) => {
    return {
        type: AstType.ExpressionBinary,
        operator: {
            type: TokenType.divide,
            value: '/',
        },
        left: left,
        right: right,
    }
}

const If = (condition, consequent, alternate) => {
    // condition
    // consequent
    // alternate
    return {
        type: AstType.StatementIf,
        // if块运行的条件, 可以是表达式等
        condition: condition,
        consequent: consequent,
        alternate: alternate,
    }
}

const Block = (body) => {
    return {
        type: AstType.StatementBlock,
        body: body,
    }
}

const Call = (callee, argus) => {
    return {
        type: AstType.ExpressionCall,
        callee: callee,
        arguments: argus,
    }
}

const Assign = (left, right) => {
    return {
        type: AstType.ExpressionAssignment,
        left: left,
        operator: {
            type: TokenType.assign,
            value: '=',
        },
        right: right,
    }
}

const While = (condition, body) => {
    return {
        type: AstType.StatementWhile,
        condition: condition,
        body: body,
    }
}

const For = (init, condition, update, body) => {
    return {
        type: AstType.StatementFor,
        // 初始化
        init: init,
        // for的循环判断
        condition: condition,
        // for的变量更新
        update: update,
        body: body,
    }
}

const Return = (value) => {
    return {
        type: AstType.StatementReturn,
        value: value,
    }

}

const Fun = (params, body) => {
    return {
        type: AstType.ExpressionFunction,
        params: params,
        body: body,
    }
}

const Class = (body) => {
    return {
        type: AstType.ExpressionClass,
        body: body,
    }
}

const True = () => {
    return {
        type: TokenType.boolean,
        value: true,
    }
}

const False = () => {
    return {
        type: TokenType.boolean,
        value: false,
    }
}

const Arr = (elements) => {
    return {
        type: AstType.ExpressionArray,
        elements: elements,
    }
}
//arr[0]
const ArrayAccess = (name, index) => {
    return {
        type: AstType.ExpressionArrayAccess,
        object: name,
        property: index,
    }
}

const Obj = (properties) => {
    return {
        type: AstType.ExpressionObject,
        properties: properties,
    }
}

//this.a this.add(1, 2)
const DotAccess = (name, property) => {
    return {
        type: AstType.ExpressionDotAccess,
        object: name,
        property: property,
    }
}

const objectProperty = (key, value) => {
    return {
        type: AstType.PropertyObject,
        key: key,
        value: value,
    }
}

export {
    Num,
    Str,
    Var,
    Declaration,
    Less,
    Greater,
    Plus,
    Minus,
    Multiply,
    Divide,
    If,
    Block,
    Call,
    Assign,
    While,
    For,
    Return,
    Fun,
    Class,
    True,
    False,
    Arr,
    ArrayAccess,
    Obj,
    DotAccess,
    objectProperty,
}
