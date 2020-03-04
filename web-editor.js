
const Cangjie = require('./cangjie/cangjie.js')
const Canvas = require('canvas')

const express = require('express')
const bodyParser = require('body-parser')
const {Liquid} = require('liquidjs')

const cangjie = Cangjie.DEFAULT

class WebEditor {
    constructor() {
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
            let component = cangjie.parse(code)
            if(typeof component === 'string') component = cangjie.get(component)
            res.send(component)
        })
        
        app.post('/render/json/', (req, res) => {
            const {component} = req.body
            try {
                res.send(this.render(JSON.parse(component)))
            } catch(e) {

            }
        })
        
        app.get('/render/cangjie/:code/', (req, res) => {
            const {code} = req.params
            const parsed = cangjie.parse(code)
            res.send(this.render(parsed))
        })
        
        app.get('/render/code/:code', (req, res) => {
            const {code} = req.params
            res.send(this.render(code))
        })
        
        this.app = app

    }
    listen(port) {
        this.app.listen(port)
    }
    render(component) {
        const width = 128
        const height = 128
    
        const canvas = Canvas.createCanvas(width, height)
        const ctx = canvas.getContext('2d')
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 6
        ctx.lineCap = 'square'
    
        cangjie.render(ctx, cangjie.makeRoot(component), 0, 0, width, height)
    
        const png = canvas.toBuffer()
        return png.toString('base64')
    }
}

module.exports = WebEditor
