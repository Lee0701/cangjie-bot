
const Cangjie = require('../cangjie/cangjie.js')

const cangjie = Cangjie.DEFAULT

module.exports = {
    name: 'charset',
    description: 'list of available characters',
    execute(msg, args) {
        msg.channel.send(Object.keys(cangjieLang.data).join(''))
    },
}
