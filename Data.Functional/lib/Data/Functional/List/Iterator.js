//@esmodpp
//@version 0.4.0
//@namespace Data.Functional.List

//@require Data.Functional.List.list 0.4.0

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


// Returns true if and only if this iterator is bound to a list 
// specified by the argument, false otherwise.
// The default implementation merely throws NotImplementedError.
proto.isBoundTo = function ( list ) {
    throw new NotImplementedError(undefined, "isBoundTo");
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


// Returns 0 if both this iterator and the argument points to the same position,
// -1 if the position this iterator points to precedes the one of the argument,
// 1 if the position this iterator points to succedes the one of the argument,
// undefined otherwise.
// The default implementation is based on `equals', `next' and `isTail' methods.
proto.compareTo = function ( r ) {
    if ( !(r instanceof Iterator) ) return undefined;
    var l = this;
    if ( l.equals(r) ) return 0;
    while ( !l.isTail() ) {
        l = l.next();
        if ( l.equals(r) ) return -1;
    }
    l = this;
    while ( !r.isTail() ) {
        r = r.next();
        if ( r.equals(l) ) return 1
    }
    return undefined;
};


// Returns true if both this iterator and the argument points to the same position,
// false otherwise.
// The default implementation is based on `compareTo' method.
proto.equals = function ( that ) {
    return this.compareTo(that) === 0;
};


// Returns the distance of this iterator and the argument,
// or undefined if the iterators seem to point to defferent sets.
// A negative return value means the arguments precedes this iterator
// and the absolute value of it represents the distance of them.
// The default implementation is based on `next', `equals' and `isTail' method.
proto.distance = function ( that ) {
    if ( !(that instanceof Iterator) ) return undefined;
    for ( var i=0, l=this, r=another;  ;  i++, l=l.next() ) {
        if ( l.equals(r) ) return i;
        if ( l.isTail() ) break;
    }
    for ( var i=-1, l=another.next(), r=this;  ;  i--, l=l.next() ) {
        if ( l.equals(r) ) return i;
        if ( l.isTail() ) break;
    }
    return undefined;
};


