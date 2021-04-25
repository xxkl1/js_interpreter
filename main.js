import {
    log,
    e,
} from './utils.js'
import tokenizer from './tokenizer.js'
import parser from "./parser.js"
import interpreter from './interpreter.js'

const runCode = function(code) {
    log('code:', code)
    const t = tokenizer(code)
    log('tokenizer:', t)
    const p = parser(t)
    log('parser:', p)
    const r = interpreter(p)
    log('interpreter:', r)
    return r
}

const bindEvent = function() {
    const buttonRun = e('#run')
    const textarea = e('#code-input')
    const result = e('#result')
    buttonRun.addEventListener('click', function() {
        const input = textarea.value
        result.innerHTML = runCode(input)
    })

    const codeInput = e('#code-input')
    codeInput.addEventListener('keydown', function(event) {
        if (event.keyCode != 9) {
            return false
        }
        const indent= '  '
        //缩进2个空格
        const position = this.selectionStart + indent.length
        //添加的空格数量与上面一致
        this.value = this.value.slice(0,this.selectionStart) + indent + this.value.slice(this.selectionStart)
        //设置光标位置，若不设置光标会跑到片段的最后，若selectionStart和selectionEnd不一致会选择一段文本
        this.selectionStart = position
        this.selectionEnd = position
        //阻止默认的tab事件
        event.preventDefault()
    })
}

const __main = () => {
    bindEvent()
}

__main()




