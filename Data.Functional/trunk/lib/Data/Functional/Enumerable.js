//@esmodpp
//@version 0.5.0
//@namespace Data.Functional

//@require Data.Functional.Loop 0.5.0
//@with-namespace Data.Functional.Loop

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
    f = wrap_for_forEach(this, f);
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            f(it.value());
        } catch ( e ) {
            if ( e instanceof EndOfLoopException ) return;
            else                                   throw e;
        }
    }
};


proto.fold = function ( f, s ) {
    f = wrap_for_fold(this, f, s);
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            s = f(it.value());
        } catch ( e ) {
            if ( e instanceof EndOfLoopException ) return e.result;
            else                                   throw e;
        }
    }
    return s;
};


proto.fold1 = function ( f ) {
    var it = this.iterator();
    if ( it.isTail() ) throw new EmptyEnumerationError();
    var s = it.value();
    it = it.next();
    f = wrap_for_fold(this, f, s);
    for ( ;  !it.isTail();  it=it.next() ) {
        try {
            s = f(it.value());
        } catch ( e ) {
            if ( e instanceof EndOfLoopException ) return e.result;
            else                                   throw e;
        }
    }
    return s;
};


proto.and = function ( ) {
    return this.fold(function ( x, y ) {
        return y || discontinue(y);
    }, true);
};

proto.or = function ( ) {
    return this.fold(function ( x, y ) {
        return y && discontinue(y);
    }, false);
};

proto.all = function ( f ) {
    return this.fold(function ( x, y ) {
        y = f.call(this, y);
        return y || discontinue(y);
    }, true);
};

proto.any = function ( f ) {
    return this.fold(function ( x, y ) {
        y = f.call(this, y);
        return y && discontinue(y);
    }, false);
};



//@export EmptyEnumerationError
var EmptyEnumerationError = newErrorClass(NAMESPACE + ".EmptyEnumerationError");
EmptyEnumerationError.prototype.message = "empty enumeration";

