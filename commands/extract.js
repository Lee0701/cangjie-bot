
const CangjieLang = require('../cangjie/cangjie-lang.js')

const cangjieLang = CangjieLang.DEFAULT

module.exports = {
    name: 'extract',
    description: 'Extract character',
    execute(msg, args) {
        msg.channel.send(cangjieLang.extract(args.join(' ')))
    },
}
