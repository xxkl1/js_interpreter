import { log } from './utils.js'
import tokenizer from './tokenizer.js'
import parser from "./parser.js"
import interpreter from './interpreter.js'

const __main = () => {
    const input = `
    const a = 1
    const f = function() {
        return a
    }
    const x = function() {
        var a = 2
        return f()
    }
    x()
    `
    const t = tokenizer(input)
    log('tokenizer:', t)
    const p = parser(t)
    log('parser:', p)
    const r = interpreter(p)
    log('interpreter:', r)
}

__main()




