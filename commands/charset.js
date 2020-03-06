
const CangjieLang = require('../cangjie/cangjie-lang.js')

const cangjieLang = CangjieLang.DEFAULT

module.exports = {
    name: 'charset',
    description: 'list of available characters',
    execute(msg, args) {
        msg.channel.send(Object.keys(cangjieLang.data).join(' '))
    },
}
