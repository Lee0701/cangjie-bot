
const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const KEYMAP = '日月金木水火土竹戈十大中一弓人心手口尸廿山女田X卜Z'

const COMBINATIONS = {
    '日月': '明',
    '日弓': '門',
    '日弓日': '間',
}

const VARIATIONS = {
    '日': ['曰'],
    '金': ['釒'],
    '水': ['氵'],
    '竹': ['⺮'],
    '田': ['囗'],
    // '': [''],
}

const PLACEMENT_DEFAULT = ['-1', '|1', ';1', '=1', '#1', '^1', '/1', '\\1', '*1', '_1']
const PLACEMENT_LEFT = ['=0']
const PLACEMENTS = {
    '日': [...PLACEMENT_DEFAULT, ...PLACEMENT_LEFT],
    '釒': [...PLACEMENT_LEFT],
    '氵': [...PLACEMENT_LEFT],
    '門': [...PLACEMENT_DEFAULT, '^0'],
    '⺮': [';0'],
    '囗': ['#0'],
}

const getKey = (keyCode) => KEYMAP[ALPHABETS.indexOf(keyCode)]
const getCombination = (chars) => COMBINATIONS[chars] ? [COMBINATIONS[chars]] : []
const matchCombination = (chars) => {
    if(chars.length == 2) {
        return Object.entries(COMBINATIONS)
                .filter(c => c[0].startsWith(chars.charAt(0)) && c[0].endsWith(chars.charAt(1)))
                .map(c => c[1])
    } else if(chars.length == 3) {
        return Object.entries(COMBINATIONS)
                .filter(c => c[0].startsWith(chars.slice(0, 2)) && c[0].endsWith(chars.charAt(2)))
                .map(c => c[1])
    } else return getCombination(chars)
}
const getVariations = (ch) => [ch, ...(VARIATIONS[ch] || [])]
const getPlacement = (ch) => PLACEMENTS[ch] || PLACEMENT_DEFAULT

const reduceToObject = (a, c) => (a[c[0]] = c[1], a)

class Cangjie {
    constructor() {

    }
    parse(code) {
        if(typeof code === 'string') code = code.split('')
        const chars = code.map(c => getKey(c))

        let alt = 0
        for(alt = 0 ; chars[0] === 'X' ; alt++, chars.shift()) {}

        const vars = chars.map(c => getVariations(c))
        
        if(chars.length === 5) {
            return this.placeDouble(matchCombination(chars.slice(0, 2).join('')), matchCombination(chars.slice(2).join('')))[alt]
        }
        else if(chars.length === 4) {
            const oneThree = this.placeDouble(vars[0], matchCombination(chars.slice(1).join('')))
            const twoTwo = this.placeDouble(matchCombination(chars.slice(0, 2).join('')), getCombination(chars.slice(0, 2).join('')))
            return [...oneThree, ...twoTwo][alt]
        } else if(chars.length === 3) {
            const oneTwo = this.placeDouble(vars[0], getCombination(chars.slice(1).join('')))
            const twoOne = this.placeDouble(getCombination(chars.slice(0, 2).join('')), vars[2])
            return [...oneTwo, ...twoOne][alt]
        }
        else if(chars.length === 2) {
            return this.placeDouble(vars[0], vars[1])[alt]
        }
        else if(chars.length === 1) {
            return vars[0][alt]
        }
    }
    placeDouble(firsts, seconds) {
        firsts = firsts.flatMap(ch => getPlacement(ch).filter(p => p.charAt(1) === '0').map(p => [ch, p.charAt(0)]))
        seconds = seconds.flatMap(ch => getPlacement(ch).filter(p => p.charAt(1) === '1').map(p => [ch, p.charAt(0)]))

        console.log(firsts, seconds)

        return seconds.flatMap(second => {
            return firsts.filter(first => first[1] === second[1]).map(first => first[0] + second[1] + second[0])
        })
    }
}

Cangjie.DEFAULT = new Cangjie()

module.exports = Cangjie
