
$(document).ready(function() {

    const indentLevel = 2

    $('#cangjie').submit(function(event) {
        event.preventDefault()
        $.ajax({
            url: '/component/cangjie/' + $('#cangjie > input').val(),
            success: (data) => {
                $('#editor > textarea').val(JSON.stringify(data, null, indentLevel))
                $('#path-editor > textarea').val((data.paths || []).join('\n'))
                render()
            }
        })
    })
    $('#editor').submit(function(event) {
        event.preventDefault()
        render()
    })
    $('#path-editor').submit(function(event) {
        event.preventDefault()
        try {
            const component = JSON.parse($('#editor > textarea').val())
            const paths = $('#path-editor > textarea').val()
            if(paths !== '') component.paths = paths.split('\n')
            $('#editor > textarea').val(JSON.stringify(component, null, indentLevel))
            render()
        } catch(e) {
            alert('JSON parse error')
        }
    })
    $('#write').click(function(event) {
        $.post({
            url: '/write',
            data: {component: $('#editor > textarea').val()},
            success: (data) => {
                if(data.error) alert(data.error)
                else alert('Success')
            }
        })
    })

    const render = function() {
        $.post({
            url: '/render/json',
            data: {component: $('#editor > textarea').val()},
            success: (data) => $('#glyph-view').removeAttr('src').attr('src', 'data:image/png;base64,' + data)
        })
    }

})
