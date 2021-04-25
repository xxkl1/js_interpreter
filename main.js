import { log } from './utils.js'
import tokenizer from './tokenizer.js'
import parser from "./parser.js"
import interpreter from './interpreter.js'

const __main = () => {
    const input = `
    var f = function(a) {
        return a
    }
    f(1)
    `
    const t = tokenizer(input)
    log('tokenizer:', t)
    const p = parser(t)
    log('parser:', p)
    const r = interpreter(p)
    log('interpreter:', r)
}

__main()




