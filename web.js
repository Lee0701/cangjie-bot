
const Cangjie = require('./cangjie/cangjie.js')
const Canvas = require('canvas')

const express = require('express')
const bodyParser = require('body-parser')
const {Liquid} = require('liquidjs')

const port = process.env.PORT || 8080

const cangjie = Cangjie.DEFAULT

const app = express()
const liquid = new Liquid()

app.set('view engine', 'html')
app.engine('html', liquid.express())

app.use(bodyParser.urlencoded({extended : false}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
    const {width, height} = cangjie
    res.render('index.html', {width, height})
})

app.get('/component/code/:code/', (req, res) => {
    const {code} = req.params
    res.send(cangjie.get(code))
})

app.get('/component/cangjie/:code/', (req, res) => {
    const {code} = req.params
    res.send(cangjie.parse(code))
})

app.post('/render/path/', (req, res) => {
    const {paths} = req.body
    const component = {
        parent: 'basic',
        paths: paths.split('\n')
    }
    res.send(render(component))
})

app.post('/render/json/', (req, res) => {
    const {component} = req.body
    res.send(render(JSON.parse(component)))
})

app.get('/render/cangjie/:code/', (req, res) => {
    const {code} = req.params
    const parsed = cangjie.parse(code)
    res.send(render(parsed))
})

app.get('/render/code/:code', (req, res) => {
    const {code} = req.params
    res.send(render(code))
})

app.listen(port)

function render(component) {
    const {width, height} = cangjie

    const canvas = Canvas.createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 4
    ctx.lineCap = 'square'

    cangjie.render(ctx, cangjie.makeRoot(component), 0, 0, width, height)

    const png = canvas.toBuffer()
    return png.toString('base64')
}
