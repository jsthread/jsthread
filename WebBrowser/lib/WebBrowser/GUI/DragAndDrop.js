//@esmodpp
//@version 0.0.0
//@namespace WebBrowser.GUI

//@export setDragAndDrop
function setDragAndDrop ( obj, hash ) {
    obj.onmousedown = function ( e ) {
        e = e || window.event;
        if ( typeof hash.start == "function" ) hash.start.call(obj, e);
        var onMove = document.onmousemove;
        var onUp   = document.onmouseup;
        document.onmousemove = function ( e ) {
            e = e || window.event;
            if ( typeof hash.move == "function" ) hash.move.call(obj, e);
        };
        document.onmouseup = function ( e ) {
            e = e || window.event;
            if ( typeof hash.end == "function" ) hash.end.call(obj, e);
            document.onmousemove = onMove;
            document.onmouseup   = onUp;
        };
    }
}

