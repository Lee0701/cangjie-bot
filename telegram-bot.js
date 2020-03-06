
const CangjieLang = require('./cangjie/cangjie-lang.js')
const Cangjie = require('./cangjie/cangjie.js')
const Canvas = require('canvas')

const Telegraf = require('telegraf')
const commandParts = require('telegraf-command-parts')

const cangjieLang = CangjieLang.DEFAULT
const cangjie = Cangjie.DEFAULT
const width = 128
const height = 128

const margin = 8
const x = margin
const y = margin
const w = width - margin*2
const h = height - margin*2

class TelegramBot {
    constructor(token) {
        this.token = token
        this.bot = new Telegraf(token)
        this.bot.use(commandParts())

        this.bot.command('cangjie', (context) => {
            const args = context.state.command.args.split(/ +/)
            const parsed = args.map(arg => cangjie.parse(arg))
    
            const canvas = Canvas.createCanvas(width, height)
            const ctx = canvas.getContext('2d')

            parsed.forEach(ch => {
                if(!ch) return
                console.log(ch)
                ctx.strokeStyle = 'black'
                ctx.lineWidth = 6
                ctx.lineCap = 'square'
                try {
                    cangjieLang.parse(ch).render(ctx, x, y, w, h)
                } catch(e) {
                    console.log(e)
                }
            })
            const png = canvas.toBuffer()
    
            context.replyWithPhoto({source: png})
        })

        this.bot.command('render', (context) => {
            const arg = context.state.command.args

            const canvas = Canvas.createCanvas(width, height)
            const ctx = canvas.getContext('2d')

            ctx.strokeStyle = 'black'
            ctx.lineWidth = 6
            ctx.lineCap = 'square'
            try {
                cangjieLang.parse(arg).render(ctx, x, y, w, h)
            } catch(e) {
                console.log(e)
            }

            const png = canvas.toBuffer()
            context.replyWithPhoto({source: png})
        })

        this.bot.command('charset', (context) => {
            context.reply(Object.keys(cangjieLang.data).join(''))
        })

    }
    launch() {
        this.bot.launch()
    }
}

module.exports = TelegramBot
