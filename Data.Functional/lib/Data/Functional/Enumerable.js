//@esmodpp
//@version 0.4.0
//@namespace Data.Functional

//@require Data.Functional.Discontinue 0.4.0
//@require Data.Functional.Ignore      0.4.0
//@require Data.Functional.ReturnList  0.4.0

//@require Data.Error.NotImplementedError
//@with-namespace Data.Error



//@export Enumerable
function Enumerable ( ) {
    // This is a kind of abstract class.
}

var proto = Enumerable.prototype;

var obj_name = "[object " + NAMESPACE + ".Enumerable]";


proto.toString = function ( ) {
    return obj_name;
};


proto.iterator = function ( ) {
    throw new NotImplementedError([
        "`iterator' method is not implemented. Any ",
        obj_name,
        " must implement a proper version of it."
    ].join(""), "iterator");
};


proto.forEach = function ( f ) {
    var ret_val;
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            ret_val = f( it.value() );
        }
        catch ( e ) {
            if ( e instanceof DiscontinueException ) {
                return e.args[e.args.length-1];
            }
            else if ( e instanceof IgnoreException ) {
                // Do nothing.
            }
            else if ( e instanceof ReturnListException ) {
                ret_val = e.args[e.args.length-1];
            }
            else {
                throw e;
            }
        }
    }
    return ret_val;
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



//@export EmptyEnumerationError
var EmptyEnumerationError = newErrorClass("EmptyEnumerationError");
EmptyEnumerationError.prototype.message = "empty enumeration";

