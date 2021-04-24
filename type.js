class TokenType {
    // type
    static number = new TokenType('number')
    static boolean = new TokenType('boolean')
    static string = new TokenType('string')
    static null = new TokenType('null')
    static variable = new TokenType('variable')

    // keyword: break, const, continue, if, else, while, for
    // function, return, this, var
    static keyword = new TokenType('keyword')

    // operator
    static auto = new TokenType('auto')
    static colon = new TokenType('colon')
    static comma = new TokenType('comma')
    // 分号
    static semicolon = new TokenType('semicolon')

    static equal = new TokenType('equal')
    static assign = new TokenType('assign')

    static notEqual = new TokenType('notEqual')
    static greaterThan = new TokenType('greaterThan')
    static lessThan = new TokenType('lessThan')
    static greaterEqual = new TokenType('greaterEqual')
    static lessEqual = new TokenType('lessEqual')

    static plus = new TokenType('plus')
    static minus = new TokenType('minus')
    static multiply = new TokenType('multiply')
    static divide = new TokenType('divide')

    // += -= *= /= %/
    static assignPlus = new TokenType('assignPlus')
    static assignMinus = new TokenType('assignMinus')
    static assignMultiply = new TokenType('assignMultiply')
    static assignDivide = new TokenType('assignDivide')
    static assignMod = new TokenType('assignMod')

    static and = new TokenType('and')
    static or = new TokenType('or')
    static not = new TokenType('not')

    static mod = new TokenType('mod')
    static dot = new TokenType('dot')

    static bracketLeft = new TokenType('bracketLeft') // [
    static bracketRight = new TokenType('bracketRight') // ]

    static curlyLeft = new TokenType('curlyLeft') // {
    static curlyRight = new TokenType('curlyRight') // }

    static parenthesesLeft = new TokenType('parenthesesLeft') // (
    static parenthesesRight = new TokenType('parenthesesRight') // )

    constructor(name) {
        this.enumName = name
    }

    toString() {
        return `${this.constructor.name}.${this.enumName}`
    }
}

class AstType {
    // expression
    // 对象定义
    static ExpressionObject = new AstType('ExpressionObject')
    // 函数定义
    static ExpressionFunction = new AstType('ExpressionFunction')
    // 数组定义
    static ExpressionArray = new AstType('ExpressionArray')
    // 二元表达式
    static ExpressionBinary = new AstType('ExpressionBinary')
    // 函数调用
    static ExpressionCall = new AstType('ExpressionCall')
    // 赋值
    static ExpressionAssignment = new AstType('ExpressionAssignment')
    // 类的定义
    static ExpressionClass = new AstType('ExpressionClass')
    // 访问数组、访问类变量或函数
    static ExpressionMember = new AstType('ExpressionMember')

    // statement
    static StatementBlock = new AstType('StatementBlock')
    static StatementIf = new AstType('StatementIf')
    static StatementWhile = new AstType('StatementWhile')
    static StatementFor = new AstType('StatementFor')
    //  返回
    static StatementReturn = new AstType('StatementReturn')

    // 变量声明
    static DeclarationVariable = new AstType('DeclarationVariable')
    // 对象属性
    static PropertyObject = new AstType('PropertyObject')

    constructor(name) {
        this.enumName = name
    }

    toString() {
        return `${this.constructor.name}.${this.enumName}`
    }
}

export {
    TokenType,
    AstType,
}
