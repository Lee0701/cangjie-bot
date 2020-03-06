
const CangjieLang = require('./cangjie/cangjie-lang.js')
const Cangjie = require('./cangjie/cangjie.js')
const Canvas = require('canvas')

const Telegraf = require('telegraf')
const commandParts = require('telegraf-command-parts')

const fs = require('fs')
const path = require('path')

const cangjie = Cangjie.DEFAULT
const width = 128
const height = 128

const margin = 8
const x = margin
const y = margin
const w = width - margin*2
const h = height - margin*2

const dataFile = 'data.json'

class TelegramBot {
    constructor(token) {
        this.token = token
        this.bot = new Telegraf(token)
        this.bot.use(commandParts())

        this.loadCangjie()

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
                    this.cangjieLang.parse(ch).render(ctx, x, y, w, h)
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
                this.cangjieLang.parse(arg).render(ctx, x, y, w, h)
            } catch(e) {
                console.log(e)
            }

            const png = canvas.toBuffer()
            context.replyWithPhoto({source: png})
        })

        this.bot.command('get', (context) => {
            const arg = context.state.command.args
            context.reply(this.cangjieLang.data[arg] || 'No result')
        })

        this.bot.command('extract', (context) => {
            const arg = context.state.command.args
            context.reply(this.cangjieLang.extract(arg))
        })

        this.bot.command('charset', (context) => {
            context.reply(Object.keys(this.cangjieLang.data).join(' '))
        })

        this.bot.command('submit', (context) => {
            const args = context.state.command.args.split(' ')
            const name = args.shift() + context.message.from.username.toUpperCase().replace(/[^A-Z]/g, '')
            if(name.charAt(0).toUpperCase() >= 'A' && name.charAt(0).toUpperCase() <= 'Z') {
                context.reply('Name must not start with an alphabet')
            } else {
                this.data[name] = args.join(' ')
                this.saveData()
                this.loadCangjie()
                context.reply('Submission done, name: ' + name)
            }
            
        })

    }

    launch() {
        this.bot.launch()
    }

    loadCangjie() {
        try {
            this.data = JSON.parse(fs.readFileSync(dataFile).toString())
        } catch(error) {
            this.data = {}
        }
        const data = {}
        Object.assign(data, this.data)
        Object.assign(data, CangjieLang.DEFAULT_DATA)
        this.cangjieLang = new CangjieLang(data)
    }

    saveData() {
        fs.writeFileSync(dataFile, JSON.stringify(this.data, null, 4))
    }
    
}

module.exports = TelegramBot
