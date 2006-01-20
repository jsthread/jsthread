//@esmodpp
//@version 0.2.0

//@require data.error.NotImplementedError
//@with-namespace data.error


//@namespace data.functional


//@export Enumerable
function Enumerable ( ) {
    // This is a kind of abstract class.
}

var proto = Enumerable.prototype;

+function(){  // closure
    var obj_name = "[object " + NAMESPACE + ".Enumerable]";
    proto.toString = function ( ) {
        return obj_name;
    };
}();

proto.iterator = function ( ) {
    throw new NotImplementedError("`iterator' method is not implemented. Any " + Enumerable.prototype.toString() + " must implement a proper version of it.", "iterator");
};

proto.toArray = function ( ) {
    var a = [];
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) a.push(it.value());
    return a;
};

proto.forEach = function ( f ) {
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            f( it.value() );
        }
        catch ( e ) {
            if ( e instanceof DiscontinueException ) {
                return;
            }
            else if ( e instanceof IgnoreException ) {
                // Do nothing.
            }
            else if ( e instanceof ReturnListException ) {
                // Do nothimg.
            }
            else {
                throw e;
            }
        }
    }
};

proto.fold = function ( f, s ) {
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            s = f(s, it.value());
        }
        catch ( e ) {
            if ( e instanceof DiscontinueException ) {
                return e.args[e.args.length-1];
            }
            else if ( e instanceof IgnoreException ) {
                // Do nothing.
            }
            else if ( e instanceof ReturnListException ) {
                s = e.args[e.args.length-1];
            }
            else {
                throw e;
            }
        }
    }
    return s;
};

proto.fold1 = function ( f ) {
    var it = this.iterator();
    if ( it.isTail() ) throw new EmptyEnumerationError();
    var s = it.value();
    it = it.next();
    for ( ;  !it.isTail();  it=it.next() ) {
        try {
            s = f(s, it.value());
        }
        catch ( e ) {
            if ( e instanceof DiscontinueException ) {
                return e.args[e.args.length-1];
            }
            else if ( e instanceof IgnoreException ) {
                // Do nothing.
            }
            else if ( e instanceof ReturnListException ) {
                s = e.args[e.args.length-1];
            }
            else {
                throw e;
            }
        }
    }
    return s;
};


proto.every = function ( f ) {
    return this.fold(function ( x, y ) {
        y = f(y);
        return y || discontinue(y);
    }, true);
};

proto.some = function ( f ) {
    return this.fold(function ( x, y ) {
        y = f(y);
        return y && discontinue(y);
    }, false);
};



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
proto.message = "unusual use of `discontinue' (this should be caught by `forEach' or another iteration-methods).";


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
proto.message = "unusual use of `ignore' (this should be caught by `forEach' or another iteration-methods).";


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
proto.message = "unusual use of `return_list' (this should be caught by `forEach' or another iteration-methods).";



//@export EmptyEnumerationError
var EmptyEnumerationError = newErrorClass("EmptyEnumerationError");
EmptyEnumerationError.prototype.message = "empty enumeration";
