
$(document).ready(function() {

    const indentLevel = 2

    const width = 128
    const height = 128
    const padding = width * 0.0625

    const lineWidth = 6

    const componentEditor = $('#editor > textarea')
    const pathList = $('#path-editor > select')
    const pathEdit = $('#path-editor > input')

    $('#cangjie').submit(function(event) {
        event.preventDefault()
        $.ajax({
            url: '/component/cangjie/' + $('#cangjie > input').val(),
            success: (data) => {
                componentEditor.val(JSON.stringify(data, null, indentLevel))
                pathList.html('')
                const paths = data.paths || []
                for(const path of paths) {
                    pathList.append($('<option>' + path + '</option>'))
                }
                renderComponent()
            }
        })
    })
    $('#editor').submit(function(event) {
        event.preventDefault()
        renderComponent()
    })
    $('#path-editor').submit(function(event) {
        event.preventDefault()
        renderPaths()
    })
    $('#copy').click(function() {
        copyPaths()
        renderComponent()
    })
    $('#write').click(function() {
        $.post({
            url: '/write',
            data: {component: componentEditor.val()},
            success: (data) => {
                if(data.error) alert(data.error)
                else alert('Success')
            }
        })
    })

    pathList.change(function() {
        renderPaths()
        pathEdit.val($(pathList.children(':selected')).html())
    })

    pathEdit.keypress(function(event) {
        if(event.keyCode === 13) {
            applyPath()
        }
    })

    $('#path-apply').click(function() {
        applyPath()
    })

    $('#path-add').click(function() {
        $(pathList.children(':selected')).after('<option>M 0 0 Z</option>')
    })

    $('#path-remove').click(function() {
        $(pathList.children(':selected')).remove()
    })

    $('#path-up').click(function() {
        const move = $(pathList.children(':selected'))
        move.prev().before(move)
    })

    $('#path-down').click(function() {
        const move = $(pathList.children(':selected'))
        move.next().after(move)
    })

    const applyPath = function() {
        pathList.children(':selected').html(pathEdit.val())
    }

    const copyPaths = function() {
        try {
            const component = JSON.parse(componentEditor.val() || '{}')
            const paths = []
            pathList.children().each(function() {
                paths.push($(this).html())
            })
            if(paths.length) component.paths = paths
            else delete component.paths
            componentEditor.val(JSON.stringify(component, null, indentLevel))
        } catch(e) {
            alert(e.toString())
        }
    }

    const renderComponent = function() {
        $('#glyph-view').css('display', 'block')
        $('#path-view').css('display', 'none')
        $.post({
            url: '/render/json',
            data: {component: componentEditor.val()},
            success: (data) => $('#glyph-view').removeAttr('src').attr('src', 'data:image/png;base64,' + data)
        })
    }

    const renderPaths = function() {
        $('#glyph-view').css('display', 'none')
        $('#path-view').css('display', 'block')

        const canvas = document.getElementById('path-view')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, width, height)

        ctx.lineWidth = lineWidth
        ctx.lineCap = 'square'

        pathList.children().each(function() {
            child = $(this)
            const path = child.html()
            const selected = child.is(':selected')
            ctx.beginPath()
            renderPath(ctx, path, selected)
            ctx.closePath()
        })

    }

    const renderPath = function(ctx, path, selected=false) {
        function getX(x) {
            return padding + x * (width - padding*2)
        }
        function getY(y) {
            return padding + y * (height - padding*2)
        }

        if(selected) ctx.strokeStyle = 'black'
        else ctx.strokeStyle = '#00000044'

        const cmds = path.split(/[,]?[ ]+/)
        let x = 0
        let y = 0

        const points = []

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
            points.push({x: x, y: y})
        }
        ctx.fillStyle = 'red'
        if(selected) {
            for(const point of points) {
                ctx.beginPath()
                ctx.arc(getX(point.x), getY(point.y), lineWidth/2, 0, Math.PI*2)
                ctx.fill()
                ctx.closePath()
            }
        }
    }

})
