// This module is to demonstrate how easily concrete sub-class of 
// Data.Functional.List can be "fully" implemented (less than 100 lines!), 
// and also for testing of default implementation of the base-classes.

//@esmodpp
//@version 0.0.0
//@namespace Data.Functional
//@require Data.Functional.List.ReverseIterator
//@require Data.Iterator.NoSuchElementError
//@require Math.ToInteger
//@with-namespace Data.Iterator Data.Error Math

//@export MinimalList
function MinimalList ( /* variable args */ ) {
    this._entity = [];
    for ( var i=0;  i < arguments.length;  i++ ) this._entity[i] = arguments[i];
}

var proto = MinimalList.prototype = new List();
proto.constructor = MinimalList;

proto.head = function ( n ) {
    return new Iterator(this, n);
};

proto.reverseHead = function ( n ) {
    return new ReverseIterator(this, n);
};


function Iterator ( l, n ) {
    if ( n < 0 ) n += l._entity.length;
    if ( n < 0 || n > l._entity.length ) throw new RangeError();
    this._list = l;
    this._pos  = ToInteger(n);
}

var proto = Iterator.prototype = new List.Iterator();
proto.constructor = Iterator;

proto.isBoundTo = function ( that ) {
    return this._list === that;
};

proto.isTail = function ( ) {
    return this._pos >= this._list._entity.length
        || this._list._entity.length == 0;
};

proto.isHead = function ( ) {
    return this._pos <= 0
        || this._list._entity.length == 0;
};

proto.next = function ( ) {
    if ( this.isTail() ) throw new NoSuchElementError();
    return new Iterator(this._list, this._pos+1);
};

proto.previous = function ( ) {
    if ( this.isHead() ) throw new NoSuchElementError();
    return new Iterator(this._list, this._pos-1);
};

proto.value = function ( ) {
    if ( this.isTail() ) throw new NoSuchElementError();
    return this._list._entity[this._pos];
};

proto.assign = function ( v ) {
    if ( this.isTail() ) throw new IllegalStateError();
    return this._list._entity[this._pos] = v;
};

proto.insert = function ( v ) {
    this._list._entity.splice(this._pos, 0, v);
    return v;
};

proto.remove = function ( ) {
    if ( this.isTail() ) throw new IllegalStateError();
    return this._list._entity.splice(this._pos, 1)[0];
};

proto.equals = function ( that ) {
    if ( !(that instanceof Iterator  &&  this.isBoundTo(that._list)) ) return false;
    return this._pos == that._pos;
};


function ReverseIterator ( l, n ) {
    if ( n < 0 ) n += l._entity.length;
    if ( n < 0 || n > l._entity.length ) throw new RangeError();
    List.ReverseIterator.call( this, new Iterator(l, l._entity.length-ToInteger(n)) );
}

var proto = ReverseIterator.prototype = new List.ReverseIterator();
proto.constructor = ReverseIterator;

