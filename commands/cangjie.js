
const Cangjie = require('../cangjie/cangjie.js')
const Canvas = require('canvas')
const Discord = require('discord.js')

const cangjie = Cangjie.DEFAULT

const width = cangjie.width
const height = cangjie.height

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
            cangjie.renderWithOutline(ctx, cangjie.makeRoot(obj), 0, 0, width, height)
        })
        const png = canvas.toBuffer()

        const attachment = new Discord.MessageAttachment(png, 'out.png')
        msg.channel.send(attachment)
    },
}
