//@esmodpp

//@require data.error.NotImplementedError
//@with-namespace data.error


//@namespace data.enumerable


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

proto.foreach = function ( f ) {
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
proto.message = "unusual use of `discontinue' (this should be caught by `foreach' or another iteration-methods).";


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
proto.message = "unusual use of `ignore' (this should be caught by `foreach' or another iteration-methods).";


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
proto.message = "unusual use of `return_list' (this should be caught by `foreach' or another iteration-methods).";


