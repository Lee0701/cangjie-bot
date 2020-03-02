
const path = require('path')
const fs = require('fs')
const Discord = require('discord.js')

const safeEval = require('safe-eval')
const Canvas = require('canvas')

const width = 128
const height = 128
const horizontalPadding = 8
const verticalPadding = 8

const componentsDir = 'components.old'
const components = fs.readdirSync(componentsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => JSON.parse(fs.readFileSync(path.join(componentsDir, file)).toString()))

function render(ctx, paths, x, y, w, h) {

    const offX = x
    const offY = y

    // const evalContext = {
    //     x, y, w, h,
    //     l: x, r: x+w, t: y, b: y+h,
    //     hp: horizontalPadding/(width/w),
    //     vp: verticalPadding/(height/h),
    // }
    const evalContext = {
        x: 0, y: 0, w: width, h: height,
        l: 0, r: width, t: 0, b: height,
        hp: horizontalPadding, vp: verticalPadding,
    }

    paths.forEach(path => {
        ctx.save()
        ctx.transform(w/width, 0, 0, h/height, offX, offY)

        const cmds = path.split(' ')
        let x = 0
        let y = 0
        
        for(let i = 0 ; i < cmds.length ; i += 2) {
            const cmd = cmds[i]
            const args = cmds[i + 1].split(',').map(arg => safeEval(arg, evalContext))
            if(cmd == 'M') ctx.moveTo(x = args[0], y = args[1])
            else if(cmd == 'L') ctx.lineTo(x = args[0], y = args[1])
            else if(cmd == 'H') ctx.lineTo(x = args[0], y)
            else if(cmd == 'V') ctx.lineTo(x, y = args[0])
            else if(cmd == 'C') ctx.bezierCurveTo(args[0], args[1], args[2], args[3], x = args[4], y = args[5])
            else if(cmd == 'Q') ctx.quadraticCurveTo(args[0], args[1], x = args[2], y = args[3])
        }
        ctx.restore()
        ctx.stroke()
    })
}

function parse(str) {
    let others = []
    let codes = []
    str.split('').forEach(ch => {
        const code = ch.toUpperCase()
        if(code >= 'A' && code <= 'Z') {
            codes.push(code)
        } else {
            others.push(ch)
        }
    })
    if(others.length > 0) return others.join('')
    else return parseCodes(codes)
}

function parseCodes(codes) {
    return components.find(component => component.code == codes[0])
}

module.exports = {
    name: 'cangjie.old',
    description: 'cangjie character generator',
    execute(msg, args) {
        const parsed = args.map(arg => parse(arg))

        const canvas = Canvas.createCanvas(width, height)
        const ctx = canvas.getContext('2d')
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 8
        ctx.lineCap = 'square'

        render(ctx, parsed[0].paths, 0, 0, width, height)
        const png = canvas.toBuffer()

        const attachment = new Discord.MessageAttachment(png, 'out.png')
        msg.channel.send(attachment)
    },
}
