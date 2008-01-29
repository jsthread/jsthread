//@esmodpp
//@version 0.0.0
//@namespace Concurrent.Thread.Event

//@require Concurrent.Thread.Compiler
//@with-namespace Concurrent

//@require        WebBrowser.GUI.Event
//@with-namespace WebBrowser.GUI.Event

//@require Data.Functional.Array

//@require Util.Arrayize
//@with-namespace Util.Arrayize



//@export waitFor
var waitFor = eval(Concurrent.Thread.prepare(
    function waitFor ( target, type, options ) {
        var arg = {};
        for ( var i in options ) arg[i] = options[i];
        arg.target = target;
        arg.type   = type;
        return select(arg);
    }
));


//@export select
var select = eval(Concurrent.Thread.prepare(
    function select ( /* variable args */ ) {
        try {
            var signal = {};
            set_handlers(arrayize(arguments), signal);
            Concurrent.Thread.stop();
        } catch ( e ) {
            if ( e === signal ) {
                return signal.event;
            } else {
                throw e;
            }
        }
    }
));


function set_handlers ( args, signal ) {
    var self = Concurrent.Thread.self();
    
    args = args.map(function( arg ){
        if ( !arg.target || typeof arg.target !== "object" ) {
            throw new TypeError("not a object: " + target);
        }
        return {
            target         : arg.target,
            type           : String(arg.type),
            useCapture     : Boolean(arg.useCapture),
            preventDefault : Boolean(arg.preventDefault),
            stopPropagation: Boolean(arg.stopPropagation)
        };
    });
    
    var lsn_ids = args.map(function( arg ){
        function handler ( e ) {
            if ( arg.preventDefault  ) e.preventDefault();
            if ( arg.stopPropagation ) e.stopPropagation();
            lsn_ids.forEach(function( id ){
                detach(id);
            });
            // IE invalidates event properties after leaving the event handler.
            // So, we pass a copy of the current event object (but DO NOT copy its methods).
            var evt = {};
            for ( var i in e ) {
                if ( typeof e[i] !== "function" ) evt[i] = e[i];
            }
            signal.event  = evt;
            self.notify(signal);
        }
        return attach(arg.target, arg.type, handler, arg.useCapture);
    });
}
