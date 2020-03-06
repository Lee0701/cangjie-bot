
const CangjieLang = require('../cangjie/cangjie-lang.js')
const Canvas = require('canvas')
const Discord = require('discord.js')

const cangjieLang = CangjieLang.DEFAULT
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
    name: 'render',
    description: 'cangjie character generator',
    execute(msg, args) {

        const canvas = Canvas.createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        try {
            renderWithOutline(cangjieLang.parse(args.join(' ')), x, y, w, h)
        } catch(e) {
            console.log(e)
        }

        const png = canvas.toBuffer()

        const attachment = new Discord.MessageAttachment(png, 'out.png')
        msg.channel.send(attachment)
    },
}
