
const Cangjie = require('./cangjie/cangjie.js')
const Canvas = require('canvas')

const Telegraf = require('telegraf')
const commandParts = require('telegraf-command-parts')

const cangjie = Cangjie.DEFAULT
const width = 128
const height = 128

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
    
            parsed.forEach(obj => {
                if(!obj) return
                ctx.strokeStyle = 'black'
                ctx.lineWidth = 6
                ctx.lineCap = 'square'
                cangjie.render(ctx, cangjie.makeRoot(obj), 0, 0, width, height)
            })
            const png = canvas.toBuffer()
    
            context.replyWithPhoto({source: png})
        })

        this.bot.command('charset', (context) => {
            context.reply(Object.values(cangjie.components)
                    .filter(component => component.char)
                    .map(component => component.char)
                    .join(''))
        })

    }
    launch() {
        this.bot.launch()
    }
}

module.exports = TelegramBot
