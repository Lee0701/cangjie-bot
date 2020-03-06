
const CangjieLang = require('../cangjie/cangjie-lang.js')
const Cangjie = require('../cangjie/cangjie.js')
const Canvas = require('canvas')
const Discord = require('discord.js')

const cangjieLang = CangjieLang.DEFAULT
const cangjie = Cangjie.DEFAULT
const width = 128
const height = 128
const lineWidth = 6

const margin = 8
const x = margin
const y = margin
const w = width - margin*2
const h = height - margin*2

function renderWithOutline(ctx, component, x, y, width, height) {
    ctx.strokeStyle = 'white'
    ctx.lineWidth = lineWidth * 2
    ctx.lineCap = 'round'
    component.render(ctx, x, y, width, height)

    ctx.strokeStyle = 'black'
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'square'
    component.render(ctx, x, y, width, height)
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
            try {
                renderWithOutline(ctx, cangjieLang.parse(ch), x, y, w, h)
            } catch(e) {
                console.log(e)
            }
        })
        const png = canvas.toBuffer()

        const attachment = new Discord.MessageAttachment(png, 'out.png')
        msg.channel.send(attachment)
    },
}
