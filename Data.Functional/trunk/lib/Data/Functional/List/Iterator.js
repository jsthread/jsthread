//@esmodpp
//@version 0.5.0
//@namespace Data.Functional.List

//@require Data.Functional.List.list 0.5.0

//@require        Data.Iterator.BidirectionalIterator
//@with-namespace Data.Iterator

//@require Data.Error.NotImplementedError
//@with-namespace Data.Error



//@export Iterator
function Iterator ( ) {
    // This is a kind of abstract class.
}

var proto = Iterator.prototype = new BidirectionalIterator();
proto.constructor = Iterator;

var obj_name = "[object " + NAMESPACE + ".Iterator]";


proto.toString = function ( ) {
    return obj_name;
};


// Assign the argument to the element which is just after the position 
// this iterator points to, then returns the new value of the element, 
// which can be defferent from the argument.
// The effect of assignment at the tail of a list should be identical 
// to the one of insertion.
// The default implementation merely throws NotImplementedError.
proto.assign = function ( v ) {
    throw new NotImplementedError(undefined, "assign");
};


// Inserts a new container at the position which this iterator points 
// to and sets the argument to the container, then, returns the value 
// of the container, which can be defferent from the argument.
// The position which the iterator points to after insertion is 
// implementation-dependent.
// The default implementation merely throws NotImplementedError.
proto.insert = function ( v ) {
    throw new NotImplementedError(undefined, "insert");
};


// Removes the container just after the position which this iterator 
// points, then, returns the value of the container.
// The position which the iterator points to after removal is 
// implementation-dependent.
// The default implementation merely throws NotImplementedError.
proto.remove = function ( ) {
    throw new NotImplementedError(undefined, "remove");
};


// Returns true if both this iterator and the argument points to the same position,
// false otherwise.
// The default implementation is based on `compareTo' method.
proto.equals = function ( that ) {
    return this.compareTo(that) === 0;
};


// Returns the distance of this iterator and the argument,
// or undefined if the iterators seem to point to defferent list.
// A negative return value means the arguments succeeds this iterator
// and its magnitude represents the distance of them. Thus, this can be 
// used as comparison-function.
// The default implementation is based on `next', `equals' and `isTail' method.
proto.distance  = 
proto.compareTo = function ( that ) {
    if ( !(that instanceof Iterator) ) return undefined;
    for ( var i=0, l=this, r=that;  ;  i--, l=l.next() ) {
        if ( l.equals(r) ) return i;
        if ( l.isTail() ) break;
    }
    for ( var i=1, l=that.next(), r=this;  ;  i++, l=l.next() ) {
        if ( l.equals(r) ) return i;
        if ( l.isTail() ) break;
    }
    return undefined;
};


