//@esmodpp
//@version 0.0.0
//@namespace WebBrowser.GUI

//@require Concurrent.Thread.Compiler


//@export waitFor
var waitFor = Concurrent.Thread.compile(
    function waitFor ( target, eventtype, options ) {
        if ( !target || typeof target !== "object" ) {
            throw new TypeError("not a object: " + target);
        }
        
        eventtype = String(eventtype).toLowerCase();
        
        options = options || {};
        var opts = {};
        opts.cancelDefault = Boolean(options.cancelDefault);
        opts.isCapture     = Boolean(options.isCapture);
        opts.cancelBubble  = Boolean(options.cancelBubble);
        
        var self = Concurrent.Thread.self();
        var signal = {};
        function handler ( e ) {
            e = e || window.e;
            if ( opts.cancelDefault && e.cancelDefault ) {
                e.cancelDefault();
            }
            if ( opts.cancelBubble && e.cancelBubble ) {
                e.cancelBubble();
            }
            if ( target.detachEvent ) {
                target.detachEvent("on"+eventtype, handler);
            } else if ( target.removeEventListener ) {
                target.removeEventListener(eventtype, handler, opts.isCapture);
            } else {
                delete target["on"+eventtype];
            }
            signal.event = e;
            self.notify(signal);
            return opts.cancelDefault ? false : undefined;
        }
        if ( target.attachEvent ) {
            target.attachEvent("on"+eventtype, handler);
        } else if ( target.addEventListener ) {
            target.addEventListener(eventtype, handler, opts.isCapture);
        } else {
            target["on"+eventtype] = handler;
        }
        try {
            Concurrent.Thread.stop();
        } catch ( e ) {
            if ( e === signal ) {
                return signal.event;
            } else {
                throw e;
            }
        }
    }
);

