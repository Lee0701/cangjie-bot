
const path = require('path')
const fs = require('fs')
const safeEval = require('safe-eval')

const reduceToObject = (a, c) => (a[c[0]] = c[1], a)

class Cangjie {

    static DEFAULT = new Cangjie()

    constructor(componentsDir, width, height, lineWidth) {
        this.componentsDir = componentsDir || path.join(__dirname, 'components')
        this.width = width || 128
        this.height = height || 128
        this.lineWidth = lineWidth || 6
        this.components = {}
        this.decompositions = {}

        this.loadComponents()
        this.loadDecompositions()
    }

    loadComponents() {
        const addFiles = (dir) => fs.readdirSync(dir).flatMap(file => {
            if(fs.lstatSync(path.join(dir, file)).isDirectory()) return addFiles(path.join(dir, file))
            else if(file.endsWith('.json')) return [[file.replace('.json', ''), JSON.parse(fs.readFileSync(path.join(dir, file)))]]
            else return []
        })
        this.components = addFiles(this.componentsDir).reduce(reduceToObject, {})
    }

    loadDecompositions() {
        this.decompositions = fs.readFileSync('cangjie-list.txt')
                .toString()
                .split('\n')
                .map(line => line.split('\t'))
                .reduce(reduceToObject, {})
    }

    getComponentsByCode(code) {
        return Object.entries(this.components).filter(entry => entry[1].code === code).map(entry => entry[0])
    }

    matchComponentsByCode(code) {
        const exactMatch = this.getComponentsByCode(code)
        if(exactMatch.length) return exactMatch
        return Object.entries(this.components).filter(entry => {
            const component = entry[1]
            if(!component.code) return false
            if(component.code.length >= 3) {
                if(code.length == 2) return component.code.startsWith(code.substring(0, 1))
                        && component.code.endsWith(code.substring(1))
                else if(code.length == 3) return component.code.startsWith(code.substring(0, 2))
                        && component.code.endsWith(code.substring(2))
            } else if(component.code.length == 2) {
                if(code.length == 2) return component.code == code
            }
            return false
        }).map(entry => entry[0])
    }

    isChildOf(component, parentName) {
        const parent = this.getComponentParent(component)
        if(!parent) return false
        if(typeof parent === 'string' && parent === parentName) return true
        else return this.isChildOf(parent, parentName)
    }

    getComponentParent(component) {
        if(typeof component === 'string') component = this.components[component]
        if(component.parent) return component.parent
        if(component.parent === null) return null
        return 'component'
    }

    getComponentProperty(component, key) {
        if(typeof component === 'string') component = this.components[component]
        if(!component) return undefined
        const result = key.split('.').reduce((a, c) => a && a[c], component)
        if(result === undefined) return this.getComponentProperty(this.getComponentParent(component), key)
        else return result
    }

    evalComponentProperty(component, key) {
        if(typeof component === 'string') component = this.components[component]
        if(!component) return undefined
        const value = key.split('.').reduce((a, c) => a && a[c], component)
        const parent = this.evalComponentProperty(this.getComponentParent(component), key)
        if(typeof value === 'string') return safeEval(value, {parent: parent})
        else if(value) return value
        else return parent
    }

    renderWithOutline(ctx, component, x, y, width, height) {
        ctx.strokeStyle = 'white'
        ctx.lineWidth = this.lineWidth * 2
        ctx.lineCap = 'round'
        this.render(ctx, component, x, y, width, height)

        ctx.strokeStyle = 'black'
        ctx.lineWidth = this.lineWidth
        ctx.lineCap = 'square'
        this.render(ctx, component, x, y, width, height)
    }

    render(ctx, component, x, y, width, height) {
        if(!component) return

        const padding = ['left', 'right', 'top', 'bottom']
                .map(key => 'padding.' + key)
                .map(key => [key.replace('padding.', ''), this.evalComponentProperty(component, key)])
                .reduce(reduceToObject, {})
        
        const offX = this.evalComponentProperty(component, "x") * width + x
        const offY = this.evalComponentProperty(component, "y") * height + y
        const widthScale = this.evalComponentProperty(component, "width")
        const heightScale = this.evalComponentProperty(component, "height")
        
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

        const components = this.getComponentProperty(component, 'components')
        if(components) components.forEach(component => {
            this.render(ctx, component, offX + padding.left, offY + padding.top, innerWidth, innerHeight)
        })

        const paths = this.getComponentProperty(component, 'paths')
        const startStroke = this.evalComponentProperty(component, 'startstroke')
        const endStroke = this.evalComponentProperty(component, 'endstroke')
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

    makeRoot(component) {
        return {parent: 'root', components: [component]}
    }

    get(code) {
        return this.components[code]
    }

    parse(str) {
        const chars = str.split('')
        if(chars.every(ch => ch.toUpperCase() >= 'A' && ch.toUpperCase() <= 'Z')) {
            return this.parseCodes(chars)
        } else {
            const idsPlacements = {
                '+': {first: null, second: null},
                '-': {first: ['left', 'lefthalf'], second: ['right', 'righthalf']},
                '|': {first: ['top', 'topthirds'], second: ['bottom', 'bottomthirds']},
                '⿰': {first: ['left', 'lefthalf'], second: ['right', 'righthalf']},
                '⿱': {first: ['top', 'topthirds'], second: ['bottom', 'bottomthirds']},
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
                    return this.placeDouble([first], [second], 0, op.first, op.second)
                }
                else {
                    if(this.components[ch]) return ch
                    else return this.parseCodes(this.decompositions[ch].split(''))
                }
            }
            if(chars.length == 3) {
                const op = idsPlacements[chars[1]]
                if(op) return this.placeDouble([parseIds(chars.slice(0, 1))], [parseIds(chars.slice(2))], 0, op.first, op.second)
            }
            return parseIds(chars)
        }
    }

    parseCodes(codes) {
        let alt = 0
        for(alt = 0 ; codes[0] === 'X' ; alt++, codes.shift()) {}
        
        const component = this.getComponentsByCode(codes.join(''))
        if(component && component.length > 0) {
            return this.placeSingle(component, alt)
        }
        else if(codes.length == 5) {
            const first = this.matchComponentsByCode(codes.slice(0, 2).join(''))
            const second = this.matchComponentsByCode(codes.slice(2).join(''))
            return this.placeDouble(first.length ? first : [this.parseCodes(codes.slice(0, 2))], second.length ? second : [this.parseCodes(codes.slice(2))], alt)
        } else if(codes.length == 4) {
            const first = this.matchComponentsByCode(codes.slice(0, 3).join(''))
            const second = this.matchComponentsByCode(codes.slice(1).join(''))
            const halfFirst = this.matchComponentsByCode(codes.slice(0, 2).join(''))
            const halfSecond = this.matchComponentsByCode(codes.slice(2).join(''))
            const oneThree = this.placeDouble(this.getComponentsByCode(codes[0]), second.length ? second : [this.parseCodes(codes.slice(1))], alt)
            const twoTwo = this.placeDouble(halfFirst.length ? halfFirst : [this.parseCodes(codes.slice(0, 2))], halfSecond.length ? halfSecond : [this.parseCodes(codes.slice(2))], alt)
            const threeOne = this.placeDouble(first.length ? first : [this.parseCodes(codes.slice(0, 3))], this.getComponentsByCode(codes[3]), alt)

            if(alt == 0) {
                return twoTwo || oneThree || threeOne
            } else if(oneThree) {
                return this.placeDouble(this.getComponentsByCode(codes[0]), second.length ? second : [this.parseCodes(codes.slice(1))], alt-1)
                        || this.placeDouble(halfFirst.length ? halfFirst : [this.parseCodes(codes.slice(0, 2))], halfSecond.length ? halfSecond : [this.parseCodes(codes.slice(2))], alt-1)
                        || this.placeDouble(first.length ? first : [this.parseCodes(codes.slice(0, 3))], this.getComponentsByCode(codes[3]), alt-1)
            } else if(twoTwo) {
                return this.placeDouble(halfFirst.length ? halfFirst : [this.parseCodes(codes.slice(0, 2))], halfSecond.length ? halfSecond : [this.parseCodes(codes.slice(2))], alt-1)
                        || this.placeDouble(first.length ? first : [this.parseCodes(codes.slice(0, 3))], this.getComponentsByCode(codes[3]), alt-1)
            }
        } else if(codes.length == 3) {
            const first = this.getComponentsByCode(codes[0] + codes[1])
            const second = this.getComponentsByCode(codes[1] + codes[2])
            return this.placeDouble(first.length ? first : [this.parseCodes(codes.slice(0, 2))], this.getComponentsByCode(codes[2]), alt)
                    || this.placeDouble(this.getComponentsByCode(codes[0]), second.length ? second : [this.parseCodes(codes.slice(1))], alt)
        } else if(codes.length == 2) {
            return this.placeDouble(this.getComponentsByCode(codes[0]), this.getComponentsByCode(codes[1]), alt)
        }
        return null
    }

    placeSingle(names, alt) {
        return {parent: names[alt], x: 0, y: 0, width: 1, height: 1}
    }

    placeDouble(firsts, seconds, alt, firstPlacement=null, secondPlacement=null) {
        if(firsts === undefined || seconds === undefined) return undefined

        const placements = Object.keys(this.components)
                .filter(component => this.isChildOf(component, 'placement'))

        const available = placements
                .filter(placement => (!firstPlacement || firstPlacement.includes(placement)) && (!secondPlacement || secondPlacement.includes(this.getComponentProperty(placement, 'pair'))))

        const candidates = available.map(placement => ({
            placement: placement,
            firsts: firsts.filter(c => this.getComponentProperty(c, 'placement.' + placement))
                    .sort((a, b) => this.getComponentProperty(a, 'priority') - this.getComponentProperty(b, 'priority')),
            seconds: seconds.filter(c => this.getComponentProperty(c, 'placement.' + this.getComponentProperty(placement, 'pair')))
                    .sort((a, b) => this.getComponentProperty(a, 'priority') - this.getComponentProperty(b, 'priority'))
        }))

        const combine = (firsts, seconds, firstPlacement, secondPlacement) => {
            let firstAlt = 0
            let secondAlt = 0
            for(let i = 0 ; i < alt ; i++) {
                if(i % 2 == 0 && firsts.length-1 > firstAlt) firstAlt++
                else if(seconds.length-1 > secondAlt) secondAlt++
                else return null
            }

            return {
                parent: 'composite',
                components: [
                    {parent: firstPlacement, components: [firsts[firstAlt]]},
                    {parent: secondPlacement, components: [seconds[secondAlt]]},
                ]
            }
        }

        for(const candidate of candidates) {
            if(candidate.firsts.length > 0 && candidate.seconds.length > 0) {
                const result = combine(candidate.firsts, candidate.seconds, candidate.placement, this.getComponentProperty(candidate.placement, 'pair'))
                if(result) return result
            }
        }

        return null
    }
}

module.exports = Cangjie
