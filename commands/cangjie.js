
const path = require('path')
const fs = require('fs')
const Discord = require('discord.js')

const safeEval = require('safe-eval')
const Canvas = require('canvas')

const width = 128
const height = 128
const lineWidth = 6

const reduceToObject = (a, c) => (a[c[0]] = c[1], a)

const addFiles = (dir) => fs.readdirSync(dir).flatMap(file => {
    if(fs.lstatSync(path.join(dir, file)).isDirectory()) return addFiles(path.join(dir, file))
    else if(file.endsWith('.json')) return [[file.replace('.json', ''), JSON.parse(fs.readFileSync(path.join(dir, file)))]]
    else return []
})

const componentsDir = 'components'
const components = addFiles(componentsDir).reduce(reduceToObject, {})

const decompositions = fs.readFileSync('cangjie-list.txt').toString().split('\n').map(line => line.split('\t')).reduce(reduceToObject, {})

function getComponentsByCode(code) {
    return Object.values(components).filter(component => component.code === code)
}

function matchComponentsByCode(code) {
    return Object.values(components)
            .filter(component => component.code
                    && component.code.length >= 2
                    && component.code.startsWith(code.substring(0, 2))
                    && component.code.endsWith(code.substring(2)))
}

function getComponentParent(component) {
    if(component.parent) return component.parent
    if(component.parent === null) return null
    return 'component'
}

function getComponentProperty(component, key) {
    if(typeof component === 'string') component = components[component]
    if(!component) return undefined
    const result = key.split('.').reduce((a, c) => a && a[c], component)
    if(result === undefined) return getComponentProperty(getComponentParent(component), key)
    else return result
}

function evalComponentProperty(component, key) {
    if(typeof component === 'string') component = components[component]
    if(!component) return undefined
    const value = key.split('.').reduce((a, c) => a && a[c], component)
    const parent = evalComponentProperty(getComponentParent(component), key)
    if(typeof value === 'string') return safeEval(value, {parent: parent})
    else if(value) return value
    else return parent
}

function renderWithOutline(ctx, name, x, y, width, height) {
    ctx.strokeStyle = 'white'
    ctx.lineWidth = lineWidth * 2
    ctx.lineCap = 'round'
    render(ctx, name, x, y, width, height)

    ctx.strokeStyle = 'black'
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'square'
    render(ctx, name, x, y, width, height)
}

function render(ctx, component, x, y, width, height) {
    if(!component) return

    const padding = ['left', 'right', 'top', 'bottom']
            .map(key => 'padding.' + key)
            .map(key => [key.replace('padding.', ''), evalComponentProperty(component, key)])
            .reduce(reduceToObject, {})
    
    const offX = evalComponentProperty(component, "x") * width + x
    const offY = evalComponentProperty(component, "y") * height + y
    const widthScale = evalComponentProperty(component, "width")
    const heightScale = evalComponentProperty(component, "height")
    
    const actualWidth = width*widthScale
    const actualHeight = height*heightScale

    padding.left *= actualWidth
    padding.right *= actualWidth
    padding.top *= actualHeight
    padding.bottom *= actualHeight

    const innerWidth = actualWidth - padding.left - padding.right
    const innerHeight = actualHeight - padding.top - padding.bottom

    const getX = (x) => offX + padding.left + x * innerWidth
    const getY = (y) => offY + padding.top + y * innerHeight

    const components = getComponentProperty(component, 'components')
    if(components) components.forEach(component => {
        render(ctx, component, offX + padding.left, offY + padding.top, innerWidth, innerHeight)
    })

    const paths = getComponentProperty(component, 'paths')
    const startStroke = evalComponentProperty(component, 'startstroke')
    const endStroke = evalComponentProperty(component, 'endstroke')
    if(paths) paths.slice(startStroke, endStroke).forEach(path => {
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
    const chars = str.split('')
    if(chars.every(ch => ch.toUpperCase() >= 'A' && ch.toUpperCase() <= 'Z')) {
        return parseCodes(chars)
    } else {
        const idsPlacements = {
            '+': {first: null, second: null},
            '-': {first: ['left', 'lefthalf'], second: ['right', 'righthalf']},
            '|': {first: ['top', 'topfourths'], second: ['bottom', 'bottomfourths']},
            '⿰': {first: ['left', 'lefthalf'], second: ['right', 'righthalf']},
            '⿱': {first: ['top', 'topfourths'], second: ['bottom', 'bottomfourths']},
            '⿲': {first: null, second: null},
            '⿳': {first: null, second: null},
            '⿴': {first: ['surroundcenter'], second: ['surrounded']},
            '⿵': {first: ['surroundtop'], second: ['surrounded']},
            '⿶': {first: ['surroundbottom'], second: ['surrounded']},
            '⿷': {first: ['surroundleft'], second: ['surrounded']},
            '⿸': {first: ['surroundtopleft'], second: ['surrounded']},
            '⿹': {first: ['surroundtopright'], second: ['surrounded']},
            '⿺': {first: ['surroundbottomleft'], second: ['surrounded']},
            '⿻': {first: ['overlap'], second: ['overlap']},
        }
        const parseIds = (chars) => {
            const ch = chars.shift()
            const op = idsPlacements[ch]
            if(op) {
                const first = parseIds(chars)
                const second = parseIds(chars)
                return placeDouble([first], [second], 0, op.first, op.second)
            }
            else return components[ch] || parseCodes(decompositions[ch].split(''))
        }
        if(chars.length == 3) {
            const op = idsPlacements[chars[1]]
            if(op) return placeDouble([parseIds(chars.slice(0, 1))], [parseIds(chars.slice(2))], 0, op.first, op.second)
        }
        return parseIds(chars)
    }
}

function parseCodes(codes) {
    let alt = 0
    for(alt = 0 ; codes[0] === 'X' ; alt++, codes.shift()) {}
    
    const component = getComponentsByCode(codes.join(''))
    if(component && component.length > 0) {
        return placeSingle(component, alt)
    }
    else if(codes.length == 5) {
        const first = matchComponentsByCode(codes.slice(0, 2).join(''))
        const second = matchComponentsByCode(codes.slice(2).join(''))
        return placeDouble(first.length ? first : [parseCodes(codes.slice(0, 2))], second.length ? second : [parseCodes(codes.slice(2))], alt)
    } else if(codes.length == 4) {
        const first = matchComponentsByCode(codes.slice(0, 3).join(''))
        const second = matchComponentsByCode(codes.slice(1).join(''))
        const halfFirst = matchComponentsByCode(codes.slice(0, 2).join(''))
        const halfSecond = matchComponentsByCode(codes.slice(2).join(''))
        return placeDouble(halfFirst.length ? halfFirst : [parseCodes(codes.slice(0, 2))], halfSecond.length ? halfSecond : [parseCodes(codes.slice(2))], alt)
                || placeDouble(getComponentsByCode(codes[0]), second.length ? second : [parseCodes(codes.slice(1))], alt)
                || placeDouble(first.length ? first : [parseCodes(codes.slice(0, 3))], getComponentsByCode(codes[3]), alt)
    } else if(codes.length == 3) {
        const first = getComponentsByCode(codes[0] + codes[1])
        const second = getComponentsByCode(codes[1] + codes[2])
        return placeDouble(first.length ? first : [parseCodes(codes.slice(0, 2))], getComponentsByCode(codes[2]), alt)
                || placeDouble(getComponentsByCode(codes[0]), second.length ? second : [parseCodes(codes.slice(1))], alt)
    } else if(codes.length == 2) {
        return placeDouble(getComponentsByCode(codes[0]), getComponentsByCode(codes[1]), alt)
    }
    return null
}

function placeSingle(names, alt) {
    return {parent: names[alt], x: 0, y: 0, width: 1, height: 1}
}

function placeDouble(firsts, seconds, alt, firstPlacement=null, secondPlacement=null) {
    if(firsts === undefined || seconds === undefined) return undefined

    const pairs = [
        ['surroundtop', 'surrounded', {x: 0, y: 0, width: 1, height: 1}, {x: 0.25, y: 0.5, width: 0.5, height: 0.5}, {right: true, bottomfourths: true, surrounded: true}],
        ['left', 'right', {x: 0, y: 0, width: 0.33, height: 1}, {x: 0.33, y: 0, width: 0.66, height: 1}, {bottom: true, bottomfourths: true, surrounded: true}],
        ['top', 'bottom', {x: 0, y: 0, width: 1, height: 0.5}, {x: 0, y: 0.5, width: 1, height: 0.5}, {right: true, surrounded: true}],
        ['topfourths', 'bottomfourths', {x: 0, y: 0, width: 1, height: 0.33}, {x: 0, y: 0.33, width: 1, height: 0.66}, {surrounded: true}],
        ['lefthalf', 'righthalf', {x: 0, y: 0, width: 0.5, height: 1}, {x: 0.5, y: 0, width: 0.5, height: 1}, {top: true, bottom: true, surrounded: true}],
    ].filter(pair => (!firstPlacement || firstPlacement.includes(pair[0])) && (!secondPlacement || secondPlacement.includes(pair[1])))

    const candidates = pairs.map(pair => [
        [firsts.filter(c => getComponentProperty(c, 'placement.' + pair[0]) !== false), pair[2]],
        [seconds.filter(c => getComponentProperty(c, 'placement.' + pair[1]) !== false), pair[3]],
        pair[4]
    ])

    const combine = (firsts, seconds, a, b, placement={}) => {
        let firstAlt = 0
        let secondAlt = 0
        for(let i = 0 ; i < alt ; i++) {
            if(i % 2 == 0 && firsts.length-1 > firstAlt) firstAlt++
            else if(seconds.length-1 > secondAlt) secondAlt++
            else return null
        }

        return {
            components: [
                {parent: firsts[firstAlt], x: a.x, y: a.y, width: a.width, height: a.height},
                {parent: seconds[secondAlt], x: b.x, y: b.y, width: b.width, height: b.height},
            ],
            placement
        }
    }

    for(candidate of candidates) {
        if(candidate[0][0].length > 0 && candidate[1][0].length > 0) {
            const result = combine(candidate[0][0], candidate[1][0], candidate[0][1], candidate[1][1], candidate[2])
            if(result) return result
        }
    }

    return null
}

module.exports = {
    name: 'cangjie',
    aliases: ['cj'],
    description: 'cangjie character generator',
    execute(msg, args) {
        const parsed = args.map(arg => parse(arg))

        const canvas = Canvas.createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        parsed.forEach(obj => {
            if(!obj) return
            else if(typeof obj === 'string') renderWithOutline(ctx, obj.charAt(0), 0, 0, width, height)
            else if(typeof obj === 'object') renderWithOutline(ctx, {parent: 'root', components: [obj]}, 0, 0, width, height)
        })
        const png = canvas.toBuffer()

        const attachment = new Discord.MessageAttachment(png, 'out.png')
        msg.channel.send(attachment)
    },
}
