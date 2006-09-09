//@esmodpp
//@version 0.0.0
//@namespace Data

//@require Data.Functional.Set
//@with-namespace Data.Functional

//@require Data.Iterator.Iterator
//@require Data.Iterator.NoSuchElementError
//@with-namespace Data.Iterator

//@require Data.Error.IllegalStateError
//@with-namespace Data.Error



var MIN_INT = Math.pow(-2, 53);

//@export StringSet
function StringSet ( /* variable args */ ) {
    this._entity   = {};
    this._state_no = MIN_INT;
    // _state_no is incremented by 1 whenever the state of this set is chaned.
    // That enables iterators to check whether the state of the associated set is changed.
    for ( var i=0;  i < arguments.length;  i++ ) this._entity[arguments[i]] = 1;
}

var proto = StringSet.prototype = new Set();
proto.constructor = StringSet;

var obj_name = "[object " + NAMESPACE + ".StringSet]";


proto.toString = function ( ) {
    return obj_name;
};


proto.add = function ( /* variable args */ ) {
    var changed = false;
    for ( var i=0;  i < arguments.length;  i++ ) {
        var s = String(arguments[i]);
        if ( !this._entity.hasOwnProperty(s) ) {
            this._entity[s] = 1;
            changed = true;
        }
    }
    if ( changed ) {
        ++this._state_no;
        return true;
    }
    return false;
};

proto.contains = function ( /* variable args */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        if ( !this._entity.hasOwnProperty(arguments[i]) ) return false;
    }
    return true;
};

proto.remove = function ( /* variable args */ ) {
    var changed = false;
    for ( var i=0;  i < arguments.length;  i++ ) {
        var s = String(arguments[i]);
        if ( this._entity.hasOwnProperty(s) ) {
            delete this._entity[s];
            changed = true;
        }
    }
    if ( changed ) {
        ++this._state_no;
        return true;
    }
    return false;
};


proto.iterator = function ( ) {
    return new Iterator(this, this._state_no, this.toArray(), 0);
};

proto.removeAt = function ( it ) {
    if ( !(it instanceof Iterator) ) throw new TypeError("invalid argument");
    if ( !it.isBoundTo(this) ) throw new IllegalStateError("invalid argument");
    mustBeUnchanged(this, it);
    var s = it.value();
    this.remove(s);
    return s;
};

proto.toArray = function ( ) {
    var arr = [];
    for ( var i in this._entity ) {
        if ( this._entity.hasOwnProperty(i) ) arr.push(i);
    }
    return arr;
};


function mustBeUnchanged ( set, it ) {
    if ( set._state_no !== it._state_no )
        throw new IllegalStateError("state of the set is changed after the iterator is yielded");
}



function Iterator ( p, s, a, i ) {
    this._parent   = p;
    this._state_no = s;
    this._elements = a;
    this._index    = i;
}

var proto = Iterator.prototype = new Data.Iterator.Iterator();
proto.constructor = Iterator;

proto.value = function ( ) {
    mustBeUnchanged(this._parent, this);
    if ( this.isTail() )
        throw new NosuchElementError("there's no value on the tail");
    return this._elements[this._index];
};

proto.isBoundTo = function ( that ) {
    return this._parent === that;
};

proto.isTail = function ( ) {
    return this._index === this._elements.length;
};

proto.next = function ( ) {
    mustBeUnchanged(this._parent, this);
    if ( this.isTail() )
        throw new NosuchElementError("there's no element after the tail");
    return new Iterator(this._parent, this._state_no, this._elements, this._index+1);
};

