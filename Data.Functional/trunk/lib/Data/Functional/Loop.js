//@esmodpp
//@version 0.5.0



//@namespace Data.Functional

//@export discontinue
function discontinue ( /* variable arguments */ ) {
    throw new DiscontinueException(arguments);
}

//@export DiscontinueException
function DiscontinueException ( args ) {
    this.args = args;
}
var proto = DiscontinueException.prototype;
proto.name    = NAMESPACE + ".DiscontinueException";
proto.message = "unusual use of `discontinue' (this should be caught by `forEach' or other iteration-methods).";


//@export ignore
function ignore ( /* variable arguments */ ) {
    throw new IgnoreException(arguments);
}

//@export IgnoreException
function IgnoreException ( args ) {
    this.args = args;
}
var proto = IgnoreException.prototype;
proto.name    = NAMESPACE + ".IgnoreException";
proto.message = "unusual use of `ignore' (this should be caught by `forEach' or other iteration-methods).";


//@export return_list
function return_list ( /* variable arguments */ ) {
    throw new ReturnListException(arguments);
}

//@export ReturnListException
function ReturnListException ( args ) {
    this.args = args;
}
var proto = ReturnListException.prototype;
proto.name    = NAMESPACE + ".ReturnListException";
proto.message = "unusual use of `return_list' (this should be caught by `forEach' or other iteration-methods).";



//@namespace Data.Functional.Loop

//@export EndOfLoopException
function EndOfLoopException ( v ) {
    this.result = v;
}
var proto = EndOfLoopException.prototype;
proto.name    = NAMESPACE + ".EndOfLoopException";
proto.message = "this should be caught by `forEach' or other iteration-methods";


//@export wrap_for_forEach
function wrap_for_forEach ( t, f ) {
    if ( typeof f != "function" ) throw new TypeError("argument to forEach must be function");
    return function ( v ) {
        try {
            f.call(t, v);
        } catch ( e ) {
            if ( e instanceof DiscontinueException ) {
                throw new EndOfLoopException();
            } else if ( e instanceof IgnoreException ) {
                // Do nothing.
            } else if ( e instanceof ReturnListException ) {
                // Do nothing.
            } else {
                throw e;
            }
        }
    };
}


//@export wrap_for_fold
function wrap_for_fold ( t, f, s ) {
    if ( typeof f != "function" ) throw new TypeError("argument to fold must be function");
    return function ( v ) {
        try {
            return s = f.call(t, s, v);
        } catch ( e ) {
            if ( e instanceof DiscontinueException ) {
                throw new EndOfLoopException(e.args[e.args.length-1]);
            } else if ( e instanceof IgnoreException ) {
                return s;
            } else if ( e instanceof ReturnListException ) {
                return s = f.call(t, s, e.args[e.args.length-1]);
            } else {
                throw e;
            }
        }
    };
}


//@export wrap_for_map
function wrap_for_map ( t, f, a ) {
    if ( typeof f != "function" ) throw new TypeError("argument to map must be function");
    if ( typeof a != "function" ) throw new TypeError("the third argument to wrap_for_map must be function");
    return function ( v ) {
        try {
            a.call(null, f.call(t, v));
        } catch ( e ) {
            if ( e instanceof DiscontinueException ) {
                a.apply(null, e.args);
            } else if ( e instanceof IgnoreException ) {
                // Do nothing.
            } else if ( e instanceof ReturnListException ) {
                a.apply(null, e.args);
            } else {
                throw e;
            }
        }
    };
}
