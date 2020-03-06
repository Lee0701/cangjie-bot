
const CangjieLang = require('../cangjie/cangjie-lang.js')

const cangjieLang = CangjieLang.DEFAULT

module.exports = {
    name: 'get',
    description: 'Get character code',
    execute(msg, args) {
        msg.channel.send(cangjieLang.data[args.join(' ')] || 'No result')
    },
}
