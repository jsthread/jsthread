//@esmodpp
//@version 0.1.0

//@require Data.Error
//@require Data.Error.NotImplementedError
//@require Data.Error.NotSupportedError
//@with-namespace Data.Error


//@namespace Data.Iterator


//@export Iterator
function Iterator ( ) {
    // This is a kind of abstract class.
    // Sub-classes should implement appropreate methods.
}

var proto = Iterator.prototype;

+function(){  // closure
    var obj_name = "[object " + NAMESPACE + ".Iterator]";
    proto.toString = function ( ) {
        return obj_name;
    };
}();

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
    throw new NotSupportedError(undefined, "isHead");
};

// Returns true if this iterator points to the head of a list,
// false othersise.
// The default implementation merely throws NotImplementedError.
// Sub-classes must implement their own version of this method.
proto.isTail = function ( ) {
    throw new NotImplementedError("`isTail' method is not implemented. Any " + Iterator.prototype.toString() + " must implement a proper version of it.", "isTail");
};

// Returns the value of the element which is just after the position 
// this iterator points to.
// The default implementation merely throws NotImplementedError.
// Sub-classes must implement their own version of this method, 
// which may throws NoSuchElementError.
proto.value = function ( ) {
    throw new NotImplementedError("`value' method is not implemented. Any " + Iterator.prototype.toString() + " must implement a proper version of it.", "value");
};

// Assign the argument to the element which is just after the position 
// this iterator points to, then returns the new value of the element, 
// which can be defferent from the argument.
// The default implementation merely throws NotSupportedError.
proto.assign = function ( v ) {
    throw new NotSupportedError(undefined, "assign");
};

// Returns the iterator that points to the next position to the one 
// which this iterator points to.
// The default implementation merely throws NotImplementedError.
// Sub-classes must implement their own version of this method, 
// which may throws NoSuchElementError.
proto.next = function ( ) {
    throw new NotImplementedError("`next' method is not implemented. Any " + Iterator.prototype.toString() + " must implement a proper version of it.", "next");
};

// Returns the iterator that points to the previous position to the one 
// which this iterator points to.
// The default implementation merely throws NotSupportedError.
proto.previous = function ( ) {
    throw new NotSupportedError(undefined, "previous");
};

// Returns 0 if both this iterator and the argument points to the same position,
// -1 if the position this iterator points to precedes the one of the argument,
// 1 if the position this iterator points to succedes the one of the argument,
// throws IllegalStateError otherwise.
// The default implementation is based on `equals', `next' and `isTail' methods.
proto.compareTo = function ( r ) {
    if ( !(r instanceof Iterator) ) throw new TypeError("`" + r + "' is not Iterator object.");
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
    if ( !(another instanceof Iterator) ) return false;
    this.compareTo(another) == 0;
};

// Returns the distance of this iterator and the argument,
// or undefined if the iterators seem to point to defferent sets.
// A negative return value means the arguments precedes this iterator
// and the absolute value of it represents the distance of them.
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
var NoSuchElementError = newErrorClass(NAMESPACE + ".NoSuchElementError");
NoSuchElementError.prototype.message = "no such element";

//@export IllegalStateError
var IllegalStateError = newErrorClass(NAMESPACE + ".IllegalStateError");

