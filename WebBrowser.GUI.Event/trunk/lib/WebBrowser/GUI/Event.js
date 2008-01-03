//@esmodpp
//@version 0.0.0
//@namespace WebBrowser.GUI.Event



var listener_id = 0;
var registry = {};

attach(window, "unload", function(){
    for ( var i in registry ) detach(Number(i));
});



//@export attach
function attach ( element, type, listener, useCapture ) {
    if ( !element || typeof element !== "object" ) {
        throw new TypeError("argument not a element: " + element);
    }
    type = String(type);
    if ( typeof listener !== "function" ) {
        throw new TypeError("argument not a function: " + listener);
    }
    useCapture = Boolean(useCapture);
    
    function handler ( e ) {
        e = e || window.event;
        if ( !e.stopPropagation ) { // Sets standard properties for IE
            e.target        = e.srcElement;
            e.currentTarget = this;
            e.cancelable    = true;
            e.stopPropagation = function stopPropagation ( ) {
                this.cancelBubble = true;
            };
            var prevent_default = false;
            e.preventDefault = function preventDefault ( ) {
                prevent_default = true;
            };
        }
        var ret_val = listener.call(this, e);
        return prevent_default ? false : ret_val;
    }
    
    if ( element.addEventListener ) {
        element.addEventListener(type, handler, useCapture);
    } else if ( element.attachEvent ) {
        element.attachEvent("on"+type, handler);
    } else {
        element["on"+type] = handler;
    }
    
    var id = listener_id++;
    registry[id] = {
        element   : element,
        type      : type,
        listener  : listener,
        useCapture: useCapture,
        handler   : handler
    };
    return id;
}


//@export detach
function detach ( element, type, listener, useCapture ) {
    if ( arguments.length === 1 && typeof element === "number" ) {
        if ( !registry[element] ) return false;
        var reg    = registry[element];
        delete registry[element];
        return detach_aux(reg.element, reg.type, reg.handler, reg.useCapture);
    } else {
        if ( !element || typeof element !== "object" ) {
            throw new TypeError("argument is not an element: " + element);
        }
        type = String(type);
        if ( typeof listener !== "function" ) {
            throw new TypeError("argument is not s function: " + listener);
        }
        useCapture = Boolean(useCapture);
        var ret_val = false;
        for ( var i in registry ) {
            var reg = registry[i];
            if ( reg.element    === element
              && reg.type       === type
              && reg.listener   === listener
              && reg.useCapture === useCapture )
            {
                delete registry[i];
                ret_val = detach_aux(reg.element, reg.type, reg.handler, reg.useCapture) || ret_val;
            }
        }
        return ret_val;
    }
};

function detach_aux ( element, type, listener, useCapture ) {
    return  element.removeEventListener  ?  element.removeEventListener(type, listener, useCapture)  :
            element.detachEvent          ?  element.detachEvent("on"+type, listener)                 :
                                            delete element["on"+type]                                ;
}
