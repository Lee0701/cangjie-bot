
const Cangjie = require('../cangjie/cangjie.js')
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

        parsed.forEach(obj => {
            if(!obj) return
            renderWithOutline(ctx, cangjie.makeRoot(obj), 0, 0, width, height)
        })
        const png = canvas.toBuffer()

        const attachment = new Discord.MessageAttachment(png, 'out.png')
        msg.channel.send(attachment)
    },
}
