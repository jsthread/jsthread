//@esmodpp
//@version 0.2.1
//@namespace Data.Iterator

//@require Data.Error.NotImplementedError
//@with-namespace Data.Error



//@export Iterator
function Iterator ( ) {
    // This is a kind of abstract class.
    // Sub-classes should implement appropreate methods.
}

var proto = Iterator.prototype;

var obj_name = "[object " + NAMESPACE + ".Iterator]";

function mustImplement ( method ) {
    throw new NotImplementedError(
        [ "`", method, "' method is not implemented. ",
          "Any ", obj_name, " must implement a proper version of it." ].join(""),
        method );
}


proto.toString = function ( ) {
    return obj_name;
};


// Returns true if this iterator points to the tail of a list,
// false othersise.
// The default implementation merely throws NotImplementedError.
// Sub-classes must implement their own version of this method.
proto.isTail = function ( ) {
    mustImplement("isTail");
};


// Returns value of the element which is just after the position 
// this iterator points to.
// The default implementation merely throws NotImplementedError.
// Sub-classes must implement their own version of this method, 
// which may throws Data.Iterator.NoSuchElementError.
proto.value = function ( ) {
    mustImplement("value");
};


// Returns a new iterator that points to the next position to the 
// one which this iterator points to.
// The default implementation merely throws NotImplementedError.
// Sub-classes must implement their own version of this method, 
// which may throws Data.Iterator.NoSuchElementError.
proto.next = function ( ) {
    mustImplement("next");
};


// Returns true if and only if this iterator is associated with the 
// object specified by the argument, false otherwise.
// The default implementation just returns false.
proto.isBoundTo = function ( list ) {
    return false;
};


proto.find = function ( f ) {
    for ( var it=this;  !it.isTail();  it=it.next() ) {
        if ( f(it.value()) ) break;
    }
    return it;
};

