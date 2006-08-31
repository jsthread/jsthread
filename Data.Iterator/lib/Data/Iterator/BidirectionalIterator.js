//@esmodpp
//@version 0.2.0
//@namespace Data.Iterator

//@require Data.Iterator.Iterator

//@require Data.Error.NotImplementedError
//@with-namespace Data.Error



//@export BidirectionalIterator
function BidirectionalIterator ( ) {
    // This is a kind of abstract class.
    // Sub-classes should implement appropreate methods.
}

var proto = BidirectionalIterator.prototype = new Iterator();
proto.constructor = BidirectionalIterator;

var obj_name = "[object " + NAMESPACE + ".BidirectionalIterator]";

function mustImplement ( method ) {
    throw new NotImplementedError(
        [ "`", method, "' method is not implemented. ",
          "Any ", obj_name, " must implement a proper version of it." ].join(""),
        method );
}


proto.toString = function ( ) {
    return obj_name;
};


// Returns true if this iterator points to the head of a list,
// false othersise.
// The default implementation merely throws NotImplementedError.
// Sub-classes must implement their own version of this method.
proto.isHead = function ( ) {
    mustImplement("isHead");
};


// Returns a new iterator that points to the previous position to 
// the one which this iterator points to.
// The default implementation merely throws NotImplementedError.
// Sub-classes must implement their own version of this method.
proto.previous = function ( ) {
    mustImplement("previous");
};

