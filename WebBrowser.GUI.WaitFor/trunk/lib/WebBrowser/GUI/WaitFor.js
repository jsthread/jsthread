//@esmodpp
//@version 0.0.0
//@namespace WebBrowser.GUI

//@require Concurrent.Thread.Compiler
//@with-namespace Concurrent

//@require WebBrowser.GUI.Event
//@with-namespace WebBrowser.GUI

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
                Event.detach(id);
            });
            signal.event  = e;
            self.notify(signal);
        }
        return Event.attach(arg.target, arg.type, handler, arg.useCapture);
    });
}
