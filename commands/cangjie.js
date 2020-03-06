
const CangjieLang = require('./cangjie/cangjie-lang.js')
const Cangjie = require('./cangjie/cangjie.js')
const Canvas = require('canvas')
const Discord = require('discord.js')

const cangjie = Cangjie.DEFAULT
const width = 128
const height = 128
const lineWidth = 6

function renderWithOutline(ctx, component, x, y, width, height) {
    ctx.strokeStyle = 'white'
    ctx.lineWidth = lineWidth * 2
    ctx.lineCap = 'round'
    cangjie.render(ctx, component, x, y, width, height)

    ctx.strokeStyle = 'black'
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'square'
    cangjie.render(ctx, component, x, y, width, height)
}


module.exports = {
    name: 'cangjie',
    aliases: ['cj'],
    description: 'cangjie character generator',
    execute(msg, args) {
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

        const attachment = new Discord.MessageAttachment(png, 'out.png')
        msg.channel.send(attachment)
    },
}
