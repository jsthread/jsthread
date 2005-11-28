//@jsmodpp
//@require data.error
//@require data.error.NotSuppotedError
//@with-namespace data.error

//@namespace data.iterator


//@export Iterator
function Iterator ( ) {
    // This is kind of abstract class.
    // Sub-classes should implement appropreate methods.
}

var proto = Iterator.prototype;

// Returns a copy of this iterator.
// The default implementation makes and returns a shallow-copy of this iterator.
proto.copy = function ( ) {
    var copy = new this.constructor();
    for ( var i in this ) {
        if ( this.hasOwnProperty(i) ) copy[i] = this[i];
    }
    return copy;
};

// Returns true if this iterator points to the head of a list,
// false othersise.
// The default implementation merely throws NotSupportedError.
// Sub-classes should implement their own version of this method.
proto.isHead = function ( ) {
    throw new NotSupportedError("`isHead' method is not supported.");
};

// Returns true if this iterator points to the head of a list,
// false othersise.
// The default implementation merely throws NotSupportedError.
// Sub-classes should implement their own version of this method.
proto.isTail = function ( ) {
    throw new NotSupportedError("`isTail' method is not supported.");
};

// Returns the value of the element which is just after the position 
// this iterator points to.
// The default implementation merely throws NotSupportedError.
// Sub-classes should implement their own version of this method, 
// which may throws NoSuchElementError.
proto.value = function ( ) {
    throw new NotSupportedError("`value' method is not supported.");
};

// Assign the argument to the element which is just after the position 
// this iterator points to, then returns the new value of the element, 
// which can be defferent from the argument.
// The default implementation merely throws NotSupportedError.
proto.assign = function ( v ) {
    throw new NotSupportedError("`assign' method is not supported.");
};

// Returns the iterator that points to the next position to the one 
// which this iterator points to.
// The default implementation merely throws NotSupportedError.
// Sub-classes must implement their own version of this method, 
// which may throws NoSuchElementError.
proto.next = function ( ) {
    throw new NotSupportedError("`next' method is not supported.");
};

// Returns the iterator that points to the previous position to the one 
// which this iterator points to.
// The default implementation merely throws NotSupportedError.
proto.previous = function ( ) {
    throw new NotSupportedError("`previous' method is not supported.");
};

// Returns 0 if both this iterator and the argument points to the same position,
// -1 if the position this iterator points to precedes the one of the argument,
// 1 if the position this iterator points to succedes the one of the argument,
// throws IllegalStateError otherwise.
// The default implementation is based on `equals', `next' and `isTail' methods.
proto.compareTo = function ( r ) {
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
    throw new IllegalStateError("Two iterators points to defferent data-sets from each other.");
};

// Returns true if both this iterator and the argument points to the same position,
// false otherwise.
// The default implementation is based on `compareTo' method.
proto.equals = function ( another ) {
    this.compareTo(another) == 0;
};

// Returns integer reqpresenting the distance of this iterator and an iterator specified by the argument,
// or undefined if the iterators seem to point to defferent sets.
// The default implementation is based on `next', `equals' and `isTail' method.
proto.distance = function ( another ) {
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



//@export compare
function compare ( it1, it2 ) {
    return it1.compareTo(it2);
}

//@export distance
function distance ( it1, it2 ) {
    return it1.distance(it2);
}



//@export NoSuchElementError
var NoSuchElementError = makeErrorClass(NAMESPACE + "NoSuchElementError");

//@export IllegalStateError
var IllegalStateError = makeErrorClass(NAMESPACE + "IllegalStateError");

