import { isArray } from './utils.js'
import { TokenType } from './type.js'

const isNumElement = s => {
    return '0123456789'.includes(s)
}

const isStrElement = s => {
    return 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(s)
}

const stringElement = (s, end = ' ,:=.()[]\n') => {
    // log('s:', s)
    // s 是一个以字母开头的字符串
    // 解析 s, 返回对应的字符串
    let r = ''

    const map = {
        '\\b': '\b',
        '\\f': '\f',
        '\\n': '\n',
        '\\r': '\r',
        '\\t': '\t',
        '\\\\': '\\',
        '\\/': '\/',
        '\\"': '\"',
        "\\'": "\'",
    }

    for (let i = 0; i < s.length; i++) {
        const cur = s[i]
        const next = s[i + 1]
        if (end.includes(cur)) {
            return [r, i]
        } else if (cur === '\\') {
            r += map[cur + next]
            i ++
        } else {
            r += cur
        }
    }
    return [r, s.length]
}

const numberElement = (s) => {
    let i = -1
    while (i < s.length) {
        i += 1
        const cur = s[i]
        if (!isNumElement(cur) && !isStrElement(cur) && cur !== '-' && cur !== '.') {
            const r = Number(s.slice(0, i))
            const offset = i - 1
            return [r, offset]
        }
    }
}

const keyWordElement = (s) => {
    const keywords = {
        'tr': ['true', "true"],
        'fa': ['false', 'false'],
        'va': ['var', 'var'],
        'co': ['const', 'const'],
        'fo': ['for', 'for'],
        'fu': ['function', 'function'],
        'nu': ['null', null],
        'cl': ['class', 'class'],
        'if': ['if', 'if'],
        'el': ['else', 'else'],
        'wh': ['while', 'while'],
        'fo': ['for', 'for'],
        're': ['return', 'return'],
    }
    const head = s.slice(0, 2)
    if (keywords.hasOwnProperty(head)) {
        const [str, keyword] = keywords[head]
        if (s.slice(0, str.length) === str) {
            return [keyword, str.length]
        }
    }
    return false
}

const tokenizer = (glCode) => {
    const codes = glCode
    let output = []

    let i = -1
    while (i < codes.length - 1) {
        i += 1
        const pre = codes[i - 1]
        const cur = codes[i]
        const next = codes[i + 1]
        const s = '{}[]();,+-*/%.<=>:'
        // todo: 补充各个类型
        const sType = {
            '+': TokenType.plus,
            '*': TokenType.multiply,
            ';': TokenType.semicolon,
            '{': TokenType.curlyLeft,
            '}': TokenType.curlyRight,
            '[': TokenType.bracketLeft,
            ']': TokenType.bracketRight,
            '.': TokenType.dot,
            '(': TokenType.parenthesesLeft,
            ')': TokenType.parenthesesRight,
            ',': TokenType.comma,
            '=': TokenType.assign,
            ':':  TokenType.colon,
            ';': TokenType.semicolon,
            '<': TokenType.lessThan,
            '>': TokenType.greaterEqual,
        }
        const sDouble = ['==', '<=', '>=', '!=']
        const start = cur + next
        if(sDouble.includes(start)) {
            output.push(start)
            i += 1
        } else if (s.includes(cur) && !(cur === '-' && isNumElement(next))) {
            const o = {
                tokenValue: cur,
                tokenType: sType[cur],
            }
            output.push(o)
        } else if (isNumElement(cur) || (cur === '-' && isNumElement(next)) || start === '0x' || start === '0b') {
            const [num, offset] = numberElement(codes.slice(i))
            const o = {
                tokenValue: num,
                tokenType: TokenType.number,
            }
            output.push(o)
            i += offset
        } else if (cur === '"' || cur === "'") {
            let end
            if (cur === '"') {
                end = '"'
            } else {
                end = "'"
            }
            const [str, offset] = stringElement(codes.slice(i + 1), end)
            output.push(str)
            i += offset + 1
        } else if (isStrElement(cur)) {
            const r = keyWordElement(codes.slice(i))
            if (isArray(r)) {
                const [keyword, offset] = r
                const o = {
                    tokenValue: keyword,
                    tokenType: TokenType.keyword,
                }
                if (keyword === "true" || keyword === "false") {
                    o.tokenType = TokenType.boolean
                }
                output.push(o)
                i += offset - 1
            } else {
                const [str, offset] = stringElement(codes.slice(i))
                const o = {
                    tokenValue: str,
                    tokenType: TokenType.variable
                }
                output.push(o)
                i += offset - 1
            }
        } else if (cur === '\n') {
            const endNot = '{;'
            const last = output[output.length - 1]
            if (last && !endNot.includes(last.tokenValue)) {
                const o = {
                    tokenValue: ';',
                    tokenType: TokenType.semicolon,
                }
                output.push(o)
            }
        }
    }
    return output
}

export default tokenizer
