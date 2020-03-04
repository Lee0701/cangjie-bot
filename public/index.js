
$(document).ready(function() {
    $('#cangjie').submit(function(event) {
        event.preventDefault()
        $.ajax({
            url: '/component/cangjie/' + $('#cangjie > input').val(),
            success: (data) => $('#editor > textarea').val(JSON.stringify(data, null, 4))
        })
    })
    $('#code').submit(function(event) {
        event.preventDefault()
        $.ajax({
            url: '/component/code/' + $('#code > input').val(),
            success: (data) => $('#editor > textarea').val(JSON.stringify(data, null, 4))
        })
    })
    $('#editor').submit(function(event) {
        event.preventDefault()
        $.post({
            url: '/render/json',
            data: {component: $('#editor > textarea').val()},
            success: (data) => $('#glyph-view').removeAttr('src').attr('src', 'data:image/png;base64,' + data)
        })
    })
})