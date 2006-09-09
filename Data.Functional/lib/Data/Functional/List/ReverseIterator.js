//@esmodpp
//@version 0.4.0
//@namespace Data.Functional.List

//@require Data.Functional.List.Iterator 0.4.0
//@require Oop.Spawn


// This module provides convinient wrapper to construct 
// reverse iterator from normal list iterator.


//@export ReverseIterator
function ReverseIterator ( it ) {
    this._it = it;
}

var proto = ReverseIterator.prototype = new Iterator();
proto.constructor = ReverseIterator;


proto.isBoundTo = function ( that ) {
    return this._it.isBoundTo(that);
};

proto.isTail = function ( ) {
    return this._it.isHead();
};

proto.isHead = function ( ) {
    return this._it.isTail();
};

proto.next = function ( ) {
    return this._it.previous();
};

proto.previous = function ( ) {
    return this._it.next();
};

proto.value = function ( ) {
    return this._it.previous().value();
};

proto.assign = function ( v ) {
    return this._it.previous().assign(v);
};

proto.insert = function ( v ) {
    return this._it.insert(v);
};

proto.remove = function ( ) {
    return this._it.previous().remove();
};

proto.equals = function ( that ) {
    if ( !(that instanceof ReverseIterator) ) return false;
    return this._it.equal(taht._it);
};

proto.compareTo = function ( that ) {
    if ( !(that instanceof ReverseIterator) ) return undefined;
    var c = this._it.compareTo(that._it);
    if ( isNaN(d) ) return c;
    return -c;
};

proto.distance = function ( that ) {
    if ( !(that instanceof ReverseIterator) ) return undefined;
    var d = this._it.distance(that._it);
    if ( isNaN(d) ) return d;
    return -d;
};

