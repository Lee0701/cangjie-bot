
class CangjieCharacter {
    constructor(x, y, w, h, data, from=0, to=-1) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.data = data

        const count = this.count()
        this.processFrom(from)
        if(to !== -1) this.processTo(count - to)
        this.cleanUp()
    }
    count() {
        if(typeof this.data === 'string' && this.data !== 'Z') return 1
        if(Array.isArray(this.data)) {
            let sum = 0
            for(const child of this.data) {
                sum += child.count()
            }
            return sum
        }
        return 0
    }
    processFrom(from) {
        if(Array.isArray(this.data)) {
            for(const child of this.data) {
                if(from <= 0) break
                if(child && typeof child.data === 'string' && child.data !== 'Z') {
                    this.data[this.data.indexOf(child)] = undefined
                    from -= 1
                }
                else if(Array.isArray(child.data)) {
                    from = child.processFrom(from)
                }
            }
        }
        return from
    }
    processTo(to) {
        if(Array.isArray(this.data)) {
            for(const child of this.data.reverse()) {
                if(to <= 0) break
                if(child && typeof child.data === 'string' && child.data !== 'Z') {
                    this.data[this.data.indexOf(child)] = undefined
                    to -= 1
                }
                else if(Array.isArray(child.data)) {
                    to = child.processTo(to)
                }
            }
        }
        return to
    }
    cleanUp() {
        if(Array.isArray(this.data)) {
            this.data = this.data.filter(child => child)
            this.data.forEach(child => child.cleanUp())
        }
    }
    render(ctx, x, y, w, h) {
        x += this.x * w
        y += this.y * h
        w *= this.w
        h *= this.h

        if(Array.isArray(this.data)) {
            this.data.forEach((child) => {
                child.render(ctx, x, y, w, h)
            })
        } else if(typeof this.data === 'string') {
            ctx.beginPath()
            if(this.data === 'H') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w, y)
                ctx.stroke()
            } else if(this.data === 'SH') {
                ctx.moveTo(x, y + h)
                ctx.lineTo(x + w, y)
                ctx.stroke()
            } else if(this.data === 'U') {
                ctx.moveTo(x, y + h)
                ctx.lineTo(x + w, y)
                ctx.stroke()
            } else if(this.data === 'DU') {
                ctx.moveTo(x, y + h - h/5)
                ctx.lineTo(x + w/10, y + h)
                ctx.lineTo(x + w, y)
                ctx.stroke()
            } else if(this.data == 'V') {
                ctx.moveTo(x, y)
                ctx.lineTo(x, y + h)
                ctx.stroke()
            } else if(this.data === 'SV') {
                ctx.moveTo(x + w, y)
                ctx.lineTo(x, y + h)
                ctx.stroke()
            } else if(this.data === 'RSV') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w, y + h)
                ctx.stroke()
            } else if(this.data === 'T') {
                ctx.moveTo(x + w, y)
                ctx.quadraticCurveTo(x + w*4/5, y + h*2/3, x, y + h)
                ctx.stroke()
            } else if(this.data === 'FT') {
                ctx.moveTo(x + w, y)
                ctx.quadraticCurveTo(x + w*2/3, y + h*2/3, x, y + h)
                ctx.stroke()
            } else if(this.data === 'WT') {
                ctx.moveTo(x + w, y)
                ctx.lineTo(x + w, y + h/2)
                ctx.quadraticCurveTo(x + w, y + h*3/4, x, y + h)
                ctx.stroke()
            } else if(this.data === 'D') {
                ctx.moveTo(x, y)
                ctx.quadraticCurveTo(x + w*2/3, y + h/2, x + w, y + h)
                ctx.stroke()
            } else if(this.data === 'ED') {
                ctx.moveTo(x, y)
                ctx.quadraticCurveTo(x + w*2/3, y + h/2, x + w, y + h)
                ctx.stroke()
            } else if(this.data === 'LD') {
                ctx.moveTo(x + w, y)
                ctx.quadraticCurveTo(x + w*3/4, y + h*2/3, x, y + h)
                ctx.stroke()
            } else if(this.data === 'WD') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w, y + h/5)
                ctx.lineTo(x + w, y + h)
                ctx.stroke()
            } else if(this.data == 'P') {
                ctx.moveTo(x, y)
                ctx.quadraticCurveTo(x + w/3, y + h*2/3, x + w, y + h)
                ctx.stroke()
            } else if(this.data == 'UP') {
                ctx.moveTo(x, y + h/5)
                ctx.lineTo(x + w/10, y)
                ctx.quadraticCurveTo(x + w/3, y + h*2/3, x + w, y + h)
                ctx.stroke()
            } else if(this.data == 'HP') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w/5, y)
                ctx.quadraticCurveTo(x + w/3, y + h*2/3, x + w, y + h)
                ctx.stroke()
            } else if(this.data == 'FP') {
                ctx.moveTo(x, y)
                ctx.quadraticCurveTo(x + w/4, y + h, x + w, y + h)
                ctx.stroke()
            } else if(this.data == 'UFP') {
                ctx.moveTo(x, y + h)
                ctx.lineTo(x + w/10, y)
                ctx.quadraticCurveTo(x + w/4, y + h, x + w, y + h)
                ctx.stroke()
            } else if(this.data === 'HJ') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w, y)
                ctx.lineTo(x + w - w/5, y + h)
                ctx.stroke()
            } else if(this.data === 'UJ') {
                ctx.moveTo(x, y + h)
                ctx.lineTo(x + w, y)
                ctx.lineTo(x + w - w/5, y + h)
                ctx.stroke()
            } else if(this.data === 'HT') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w, y)
                ctx.quadraticCurveTo(x + w*4/5, y + h*2/3, x, y + h)
                ctx.stroke()
            } else if(this.data === 'HSV') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w, y)
                ctx.lineTo(x + w/2, y + h)
                ctx.stroke()
            } else if(this.data === 'HV') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w, y)
                ctx.lineTo(x + w, y + h)
                ctx.stroke()
            } else if(this.data === 'HVJ') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w, y)
                ctx.lineTo(x + w, y + h)
                ctx.lineTo(x + w - w/5, y + h)
                ctx.stroke()
            } else if(this.data === 'HTJ') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w, y)
                ctx.quadraticCurveTo(x + w, y + h*2/3, x + w/2, y + h)
                ctx.lineTo(x + w/2 - w/5, y + h - h/10)
                ctx.stroke()
            } else if(this.data === 'UTJ') {
                ctx.moveTo(x, y + h)
                ctx.lineTo(x + w, y)
                ctx.quadraticCurveTo(x + w, y + h*2/3, x + w/2, y + h)
                ctx.lineTo(x + w/2 - w/5, y + h - h/10)
                ctx.stroke()
            } else if(this.data === 'HVH') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w/2, y)
                ctx.lineTo(x + w/2, y + h)
                ctx.lineTo(x + w, y + h)
                ctx.stroke()
            } else if(this.data === 'HVU') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w/2, y)
                ctx.lineTo(x + w/2, y + h)
                ctx.lineTo(x + w, y + h - h/5)
                ctx.stroke()
            } else if(this.data === 'HA') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w/2, y)
                ctx.bezierCurveTo(x + w/3, y + h, x + w/2, y + h, x + w, y + h)
                ctx.stroke()
            } else if(this.data === 'HAJ') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w/2, y)
                ctx.bezierCurveTo(x + w/3, y + h, x + w/2, y + h, x + w, y + h)
                ctx.lineTo(x + w, y + h - h/5)
                ctx.stroke()
            } else if(this.data === 'HPJ') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w*2/3, y)
                ctx.quadraticCurveTo(x + w*2/3, y + h*2/3, x + w, y + h)
                ctx.lineTo(x + w, y + h - h/5)
                ctx.stroke()
            } else if(this.data === 'HTAJ') {
                ctx.moveTo(x + w/4, y)
                ctx.lineTo(x + w*3/4, y)
                ctx.bezierCurveTo(-x, y + h, x, y + h, x + w, y + h)
                ctx.lineTo(x + w, y + h - h/5)
                ctx.stroke()
            } else if(this.data === 'HTC') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w, y)
                ctx.lineTo(x + w/2, y + h*2/5)
                ctx.bezierCurveTo(x + w, y + h/2, x + w, y + h, x + w/4, y + h)
                ctx.stroke()
            } else if(this.data === 'HTHT') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w*4/5, y)
                ctx.lineTo(x + w/2, y + h*2/5)
                ctx.lineTo(x + w, y + h*2/5)
                ctx.quadraticCurveTo(x + w*2/3, y + h, x + w/4, y + h)
                ctx.stroke()
            } else if(this.data === 'HTCJ') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w, y)
                ctx.lineTo(x + w/2, y + h*2/5)
                ctx.bezierCurveTo(x + w, y + h/2, x + w, y + h, x + w*2/3, y + h)
                ctx.lineTo(x + w*2/3 - w/5, y + h - h/10)
                ctx.stroke()
            } else if(this.data === 'HVHV') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w/2, y)
                ctx.lineTo(x + w/2, y + h/2)
                ctx.lineTo(x + w, y + h/2)
                ctx.lineTo(x + w, y + h)
                ctx.stroke()
            } else if(this.data === 'HTHTJ') {
                ctx.moveTo(x, y)
                ctx.lineTo(x + w*4/5, y)
                ctx.lineTo(x + w/2, y + h*2/5)
                ctx.lineTo(x + w, y + h*2/5)
                ctx.quadraticCurveTo(x + w, y + h, x + w*3/4, y + h)
                ctx.lineTo(x + w*3/4 - w/5, y + h - h/10)
                ctx.stroke()
            } else if(this.data === 'VU') {
                ctx.moveTo(x, y)
                ctx.lineTo(x, y + h)
                ctx.lineTo(x + w, y + h - h/5)
                ctx.stroke()
            } else if(this.data === 'VH') {
                ctx.moveTo(x, y)
                ctx.lineTo(x, y + h)
                ctx.lineTo(x + w, y + h)
                ctx.stroke()
            } else if(this.data === 'VA') {
                ctx.moveTo(x, y)
                ctx.bezierCurveTo(x, y + h, x, y + h, x + w, y + h)
                ctx.stroke()
            } else if(this.data === 'VAJ') {
                ctx.moveTo(x, y)
                ctx.bezierCurveTo(x, y + h, x, y + h, x + w, y + h)
                ctx.lineTo(x + w, y + h - h/5)
                ctx.stroke()
            } else if(this.data === 'VHV') {
                ctx.moveTo(x, y)
                ctx.lineTo(x, y + h/2)
                ctx.lineTo(x + w, y + h/2)
                ctx.lineTo(x + w, y + h)
                ctx.stroke()
            } else if(this.data === 'VHT') {
                ctx.moveTo(x, y)
                ctx.lineTo(x, y + h/2)
                ctx.lineTo(x + w, y + h/2)
                ctx.quadraticCurveTo(x + w*4/5, y + h, x, y + h)
                ctx.stroke()
            } else if(this.data === 'VHTJ') {
                ctx.moveTo(x, y)
                ctx.lineTo(x, y + h/2)
                ctx.lineTo(x + w, y + h/2)
                ctx.quadraticCurveTo(x + w, y + h, x + w*4/5, y + h)
                ctx.lineTo(x + w*3/5, y + h - h/10)
                ctx.stroke()
            } else if(this.data === 'VJ') {
                ctx.moveTo(x + w, y)
                ctx.lineTo(x + w, y + h)
                ctx.lineTo(x + w - w/5, y + h)
                ctx.stroke()
            } else if(this.data === 'VC') {
                ctx.moveTo(x + w, y)
                ctx.bezierCurveTo(x + w, y + h, x + w, y + h, x, y + h)
                ctx.stroke()
            } else if(this.data === 'VCJ') {
                ctx.moveTo(x + w, y)
                ctx.bezierCurveTo(x + w, y + h, x + w, y + h, x, y + h)
                ctx.lineTo(x, y + h - h/5)
                ctx.stroke()
            }
            ctx.closePath()
        }
    }
}

const combiners = {
    '+': [{x: 0, y: 0, w: 1, h: 1}, {x: 0, y: 0, w: 1, h: 1}],
    '-': [{x: 0, y: 0, w: 0.45, h: 1}, {x: 0.55, y: 0, w: 0.45, h: 1}],
    '|': [{x: 0, y: 0, w: 1, h: 0.5}, {x: 0, y: 0.5, w: 1, h: 0.5}],
    '=': [{x: 0, y: 0, w: 0.30, h: 1}, {x: 0.35, y: 0, w: 0.65, h: 1}],
    ';': [{x: 0, y: 0, w: 1, h: 0.30}, {x: 0, y: 0.35, w: 1, h: 0.65}],
    '!': [{x: 0, y: 0, w: 1, h: 0.65}, {x: 0, y: 0.70, w: 1, h: 0.30}],
    '#': [{x: 0, y: 0, w: 1, h: 1}, {x: 0.125, y: 0.125, w: 0.75, h: 0.75}],
    '^': [{x: 0, y: 0, w: 1, h: 1}, {x: 0.25, y: 0.5, w: 0.5, h: 0.5}],
    '/': [{x: 0, y: 0, w: 1, h: 1}, {x: 0.25, y: 0.25, w: 0.75, h: 0.75}],
    '\\': [{x: 0, y: 0, w: 1, h: 1}, {x: 0, y: 0.25, w: 0.75, h: 0.75}],
    '*': [{x: 0, y: 0, w: 1, h: 1}, {x: 0.25, y: 0, w: 0.5, h: 0.5}],
    '_': [{x: 0, y: 0, w: 1, h: 1}, {x: 0.25, y: 0, w: 0.75, h: 0.75}],
}

class Cangjie {
    constructor(data) {
        this.data = data
    }

    parseNums(nums) {
        let x = 0
        let y = 0
        let w = 1
        let h = 1
        if(nums.length >= 1) {
            w = h = nums[0]
            x = y = (1 - w) / 2
        }
        if(nums.length >= 2) {
            h = nums[1]
            y = (1 - h) / 2
        }
        if(nums.length >= 3) {
            x = nums[2]
            y = nums[2]
        }
        if(nums.length == 4) {
            y = nums[3]
        }
        return {x, y, w, h}
    }

    extract(arr) {
        if(typeof arr === 'string') arr = arr.split('')

        const next = () => {
            if(!arr.length) throw new Error()
            while(arr[0] === ' ') arr.shift()
            return arr.shift().toUpperCase()
        }

        const parseCombiner = () => {
            const left = parseTerm()
            if(!arr.length) return left
            const ch = next()
            const c = combiners[ch]
            if(c) {
                const right = parseCombiner()
                return left + ch + right
            } else return left
        }

        const parseTerm = () => {
            let ch = next()

            let result = ''

            if(ch >= '0' && ch <= '9') {
                let from = ''
                for( ; ch >= '0' && ch <= '9' ; ch = next()) from += ch
                from = parseInt(from)
                result += from
            }
            let to = -1
            if(ch === '~') {
                ch = next()
                to = ''
                for( ; ch >= '0' && ch <= '9' ; ch = next()) to += ch
                to = parseInt(to)
            }
            if(to != -1) result += '~' + to

            if(ch === '(') result += '(' + parseCombiner() + ')'
            else {
                let token = ch
                while(arr.length && arr[0].toUpperCase() >= 'A' && arr[0].toUpperCase() <= 'Z') token += next()
                if(this.data[token]) token = '(' + this.extract(this.data[token]) + ')'
                result += token
            }

            if(arr[0] === '@') {
                next()
                const nums = []
                while(arr.length && arr[0].toUpperCase() >= '0' && arr[0].toUpperCase() <= '9') {
                    const num = parseInt(next())
                    const denom = parseInt(next())
                    nums.push(num)
                    nums.push(denom)
                }
                result += '@' + nums.join('')
            }
            return result
        }

        return parseCombiner()
    }
    
    parse(arr) {
        if(typeof arr === 'string') arr = arr.split('')

        const next = () => {
            if(!arr.length) throw new Error()
            while(arr[0] === ' ') arr.shift()
            return arr.shift().toUpperCase()
        }

        const parseCombiner = () => {
            const left = parseTerm()
            if(!arr.length) return left
            const ch = next()
            const c = combiners[ch]
            if(c) {
                const right = parseCombiner()
                return new CangjieCharacter(0, 0, 1, 1, [left, right].map((char, i) => new CangjieCharacter(c[i].x, c[i].y, c[i].w, c[i].h, [char])))
            } else return left
        }

        const parseTerm = () => {
            let ch = next()

            let from = 0
            if(ch >= '0' && ch <= '9') {
                from = ''
                for( ; ch >= '0' && ch <= '9' ; ch = next()) from += ch
                from = parseInt(from)
            }
            let to = -1
            if(ch === '~') {
                ch = next()
                to = ''
                for( ; ch >= '0' && ch <= '9' ; ch = next()) to += ch
                to = parseInt(to)
            }

            let result = null
            if(ch === '(') result = [parseCombiner()]
            else {
                let token = ch
                while(arr.length && arr[0].toUpperCase() >= 'A' && arr[0].toUpperCase() <= 'Z') token += next()
                if(this.data[token]) token = [this.parse(this.data[token])]
                result = token
            }

            if(arr[0] === '@') {
                next()
                const nums = []
                while(arr.length && arr[0].toUpperCase() >= '0' && arr[0].toUpperCase() <= '9') {
                    const num = parseInt(next())
                    const denom = parseInt(next())
                    nums.push(num / (denom === 0 ? 10 : denom))
                }
                const {x, y, w, h} = this.parseNums(nums)
                return new CangjieCharacter(x, y, w, h, result, from, to)
            } else {
                return new CangjieCharacter(0, 0, 1, 1, result, from, to)
            }
        }

        return parseCombiner()
    }
}

Cangjie.DEFAULT_DATA = {
    '一': 'H@1100',
    '丨': 'V@0011',
    '丿': 'T@1211',
    '亅': 'VJ@121100',

    '二': '一@12|一',
    '三': '一@34;一@12|一',
    '十': '一+丨',
    
    '口': '(V+HV+H@11110011)@80',
    '日': 'V+HV+一+H@11110011',
    '曰': 'V+HV+一@80110000+H@11110011',
    '目': 'V+HV+((一!Z)+(Z;一))+H@11110011',
    '田': 'V+HV+一+丨+H@11110011',
    '囗': 'V+HV+H@11110011',

    '人': 'T@591100+P@12341214',
    '入': 'T@12900010+HP@60114000',
    '丷': 'D=(Z-T)',
    '火': 'LD@18141818+LD@18146818+人',
    '木': '一@11000014+丨+T@12350014+P@12351214',
    '木L': '一@11000014+丨+T@12120014+D@12141213',

    '月': '(WT@10110000+HVJ@90111000)+(H@90001013+H@90011023)',

    '門': '(V@+1日@11250000)-(~4日@11250000+VJ)',
    '冂': 'V+HVJ',

    '竹': '((T@121100+H@23001312)-(T@121100+H@23001312))@111300+(丨-亅)@11450015',
    '⺮': '(T@121100+H@23001312+D@12121312)-(T@121100+H@23001312+D@12121312)',

    '廿': '一@11000013+(丨@00111300+丨@00112300)+一@13001311',
    '艹': '一+(丨@00111300+丨@00112300)',

    '辶': 'D@101200;(HV@103400+UFP@11140034)',
    '⻍': '(D@101200|D@101200)|(HV@103400+UFP@11140034)',

    '土': '十@3411+H@11000011',
    '士': '十+H@34001811',
    '王': 'H@5611+土',
    '千': '(FT@1214;Z)+一+丨@11800020',

    '全': '入|王@4511',
    '金': '人|(王+丷@12131423)@4511',
    '舌': '千!口@1211',
    '回': '囗#口@2323',
    '明': '日@11350018-月',
    '向': '(丿;冂)^口',
    '早': '日@2311|十',
    '草': '艹;早',
    '間': '門^日',
}

Cangjie.DEFAULT = new Cangjie(Cangjie.DEFAULT_DATA)

if(typeof module !== 'undefined') module.exports = Cangjie
