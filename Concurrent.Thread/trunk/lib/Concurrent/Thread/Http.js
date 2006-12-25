//@esmodpp
//@version 0.0.0
//@namespace Concurrent.Thread.Http
//@require   Concurrent.Thread


var createXMLHttpRequest;  // Set up according to environment.
try {
    new XMLHttpRequest();
    createXMLHttpRequest = function ( ) {
        return new XMLHttpRequest();
    };
} catch ( e ) {
    try {
        // MSXML3 or later
        new ActiveXObject("Msxml2.XMLHTTP");
        createXMLHttpRequest = function ( ) {
            return new ActiveXObject("Msxml2.XMLHTTP");
        };
    } catch ( e ) {
        try {
            // MSXML up to 2
            new ActiveXObject("Microsoft.XMLHTTP");
            createXMLHttpRequest = function ( ) {
                return new ActiveXObject("Microsoft.XMLHTTP");
            };
        } catch ( e ) {
            throw new Error(NAMESPACE + ": can't load XMLHttpRequest object");
        }
    }
}



//@export get
function get ( url ) {
	throw new Error();
}

get.$Concurrent_Thread_compiled = function (
    $Concurrent_Thread_this,
    $Concurrent_Thread_arguments,
    $Concurrent_Thread_continuation
) {
    var req = createXMLHttpRequest();
    req.open("GET", $Concurrent_Thread_arguments[0], true);
    var self = Concurrent.Thread.self();
    var loaded    = false;
    var cache_hit = true;
    req.onreadystatechange = function ( ) {
        if ( req.readyState == 4 ) {
            loaded = true;
            if ( !cache_hit ) self.notify();
        }
    };
    req.send(null);  // "send" method occasionally causes "onload" event here.
    cache_hit = false;
    if ( loaded ) {
        return {
            continuation: $Concurrent_Thread_continuation,
            ret_val     : req,
            timeout     : undefined
        };
    } else {
        return {
            timeout     : -1,
            continuation: {
                procedure: function ( ) { },
                this_val : null,
                exception: {
                    procedure: function ( ) {
                        return {
                            continuation: $Concurrent_Thread_continuation,
                            ret_val     : req,
                            timeout     : undefined
                        };
                    },
                    this_val : null,
                    exception: $Concurrent_Thread_continuation.exception
                }
            }
        };
    }
};
