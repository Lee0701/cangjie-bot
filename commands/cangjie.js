
const path = require('path')
const fs = require('fs')
const Discord = require('discord.js')

const safeEval = require('safe-eval')
const Canvas = require('canvas')

const width = 128
const height = 128
const lineWidth = 6

const reduceToObject = (a, c) => (a[c[0]] = c[1], a)

const keyCodes = {
    'A': ['日', '曰'],
    'B': ['月'],
    'C': ['金', '釒'],
    'D': ['木', '木L'],
    'E': ['水', '氵'],

    'T': ['廿', '艹'],

    'AB': ['明'],
    'BB': ['朋'],
}

const componentsDir = 'components'
const components = fs.readdirSync(componentsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => [file.replace('.json', ''), JSON.parse(fs.readFileSync(path.join(componentsDir, file)).toString())])
        .reduce(reduceToObject, {})

function getComponentProperty(name, key) {
    if(!components[name]) return undefined
    const result = key.split('.').reduce((a, c) => a && a[c], components[name])
    if(result === undefined) return getComponentProperty(components[name].parent, key)
    else return result
}

function evalComponentProperty(name, key) {
    const component = components[name]
    if(!component) return undefined
    const value = key.split('.').reduce((a, c) => a && a[c], component)
    const parent = component.parent ? evalComponentProperty(component.parent, key) : null
    if(value) return safeEval(value, {parent})
    else return parent
}

function renderWithOutline(ctx, name, offX, offY, width, height) {
    ctx.strokeStyle = 'white'
    ctx.lineWidth = lineWidth * 2
    ctx.lineCap = 'round'
    render(ctx, name, offX, offY, width, height)

    ctx.strokeStyle = 'black'
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'square'
    render(ctx, name, offX, offY, width, height)
}

function render(ctx, name, offX, offY, width, height) {

    if(Array.isArray(name)) {
        name.forEach(component => {
            render(ctx, component.component, offX + component.x*width, offY + component.y*height, width * component.width, height * component.height)
        })
        return
    }

    const component = components[name]
    if(!component) return

    const padding = ['left', 'right', 'top', 'bottom']
            .map(key => 'padding.' + key)
            .map(key => [key.replace('padding.', ''), evalComponentProperty(name, key)])
            .reduce(reduceToObject, {})
    
    padding.left *= width
    padding.right *= width
    padding.top *= height
    padding.bottom *= height

    const innerWidth = width - padding.left - padding.right
    const innerHeight = height - padding.top - padding.bottom

    const getX = (x) => offX + x * innerWidth + padding.left
    const getY = (y) => offY + y * innerHeight + padding.top

    if(component.components) component.components.forEach(component => {
        render(ctx, component.name, offX + component.x*width, offY + component.y*height, component.width * width, component.height * height)
    })

    if(component.paths) component.paths.forEach(path => {
        const cmds = path.split(/[,]?[ ]+/)
        let x = 0
        let y = 0

        while(cmds.length > 0) {
            const cmd = cmds.shift()
            if(cmd === 'Z') {
                ctx.stroke()
            } else if(cmd === 'M') {
                ctx.moveTo(getX(x = safeEval(cmds.shift())), getY(y = safeEval(cmds.shift())))
            } else if(cmd === 'm') {
                ctx.moveTo(getX(x += safeEval(cmds.shift())), getY(y += safeEval(cmds.shift())))
            } else if(cmd === 'L') {
                ctx.lineTo(getX(x = safeEval(cmds.shift())), getY(y = safeEval(cmds.shift())))
            } else if(cmd === 'l') {
                ctx.lineTo(getX(x += safeEval(cmds.shift())), getY(y += safeEval(cmds.shift())))
            } else if(cmd === 'H') {
                ctx.lineTo(getX(x = safeEval(cmds.shift())), getY(y))
            } else if(cmd === 'h') {
                ctx.lineTo(getX(x += safeEval(cmds.shift())), getY(y))
            } else if(cmd === 'V') {
                ctx.lineTo(getX(x), getY(y = safeEval(cmds.shift())))
            } else if(cmd === 'v') {
                ctx.lineTo(getX(x), getY(y += safeEval(cmds.shift())))
            } else if(cmd === 'Q') {
                ctx.quadraticCurveTo(getX(safeEval(cmds.shift())), getY(safeEval(cmds.shift())), getX(x = safeEval(cmds.shift())), getY(y = safeEval(cmds.shift())))
            } else if(cmd === 'q') {
                ctx.quadraticCurveTo(getX(x + safeEval(cmds.shift())), getY(y + safeEval(cmds.shift())), getX(x += safeEval(cmds.shift())), getY(y += safeEval(cmds.shift())))
            } else if(cmd === 'C') {
                ctx.bezierCurveTo(getX(safeEval(cmds.shift())), getY(safeEval(cmds.shift())), getX(safeEval(cmds.shift())), getY(safeEval(cmds.shift())), getX(x += safeEval(cmds.shift())), getY(y += safeEval(cmds.shift())))
            } else if(cmd === 'c') {
                ctx.bezierCurveTo(getX(x + safeEval(cmds.shift())), getY(y + safeEval(cmds.shift())), getX(x + safeEval(cmds.shift())), getY(y + safeEval(cmds.shift())), getX(x += safeEval(cmds.shift())), getY(y += safeEval(cmds.shift())))
            }
        }
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
    let alt = 0
    for(alt = 0 ; codes[0] === 'X' ; alt++, codes.shift()) {}
    
    const component = keyCodes[codes.join('')]
    if(component) {
        return placeSingle(component, alt)
    }
    else if(codes.length == 5) {

    } else if(codes.length == 4) {
        
    } else if(codes.length == 3) {
        return placeDouble(keyCodes[codes[0]], keyCodes[codes[1] + codes[2]], alt)
                || placeDouble(keyCodes[codes[0] + codes[1]], keyCodes[codes[2]], alt)
                || placeDouble(keyCodes[codes[0]], codes.slice(1))
                || placeDouble(codes.slice(0, 2), keyCodes[codes[2]])
    } else if(codes.length == 2) {
        const first = keyCodes[codes[0]]
        const second = keyCodes[codes[1]]
        return placeDouble(first, second, alt)

    }
    return null
}

function placeSingle(names, alt) {
    return [
        {component: names[alt], x: 0, y: 0, width: 1, height: 1},
    ]
}

function placeDouble(firsts, seconds, alt) {
    if(firsts === undefined || seconds === undefined) return null

    const firstObjects = parseCodes(firsts)
    const secondObjects = parseCodes(seconds)
    if(firstObjects) firsts = [firstObjects]
    if(secondObjects) seconds = [secondObjects]

    const lefts = firsts.filter(c => getComponentProperty(c, 'placement.left') !== false)
    const tops = firsts.filter(c => getComponentProperty(c, 'placement.top') !== false)
    const topFourths = firsts.filter(c => getComponentProperty(c, 'placement.topfourths') !== false)
    
    const rights = seconds.filter(c => getComponentProperty(c, 'placement.right') !== false)
    const bottoms = seconds.filter(c => getComponentProperty(c, 'placement.bottom') !== false)
    const bottomFourths = seconds.filter(c => getComponentProperty(c, 'placement.bottomfourths') !== false)

    const combine = (firsts, seconds, a, b) => {
        let firstAlt = 0
        let secondAlt = 0
        for(let i = 0 ; i < alt ; i++) (i % 2 == 0 && firsts.length > firstAlt-1) ? firstAlt++ : (seconds.length > secondAlt-1) ? secondAlt++ : 0

        return [
            {component: firsts[firstAlt], x: a.x, y: a.y, width: a.width, height: a.height},
            {component: seconds[secondAlt], x: b.x, y: b.y, width: b.width, height: b.height},
        ]
    }

    if(lefts.length > 0 && rights.length > 0) {
        return combine(lefts, rights, {x: 0, y: 0, width: 0.33, height: 1}, {x: 0.33, y: 0, width: 0.66, height: 1})
    }
    if(tops.length > 0 && bottoms.length > 0) {
        return combine(tops, bottoms, {x: 0, y: 0, width: 1, height: 0.5}, {x: 0, y: 0.5, width: 1, height: 0.5})
    }
    if(topFourths.length > 0 && bottomFourths.length > 0) {
        return combine(topFourths, bottomFourths, {x: 0, y: 0, width: 1, height: 0.25}, {x: 0, y: 0.25, width: 1, height: 0.75})
    }
    
    return null
}

module.exports = {
    name: 'cangjie',
    description: 'cangjie character generator',
    execute(msg, args) {
        const parsed = args.map(arg => parse(arg))

        const canvas = Canvas.createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        parsed.forEach(obj => {
            if(!obj) return
            if(typeof obj === 'string') renderWithOutline(ctx, obj.charAt(0), 0, 0, width, height)
            if(Array.isArray(obj)) obj.forEach(component => renderWithOutline(ctx, component.component, component.x*width, component.y*height, component.width*width, component.height*height))
        })
        const png = canvas.toBuffer()

        const attachment = new Discord.MessageAttachment(png, 'out.png')
        msg.channel.send(attachment)
    },
}
