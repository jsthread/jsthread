//@esmodpp
//@version 0.0.1

//@require data.iterator
//@with-namespace data.iterator

//@require data.functional
//@require data.functional.array

//@require data.error.NotSupportedError
//@with-namespace data.error


var proto = String.prototype;

for ( var i in data.functional.List.prototype ) {
    if ( !proto.hasOwnProperty(i) ) proto[i] = data.functional.List.prototype[i];
}

proto.add = function ( ) {
    throw new NotSupportedError("String objects do not support `add' method. They are immutable.", "add");
};

proto.pop = function ( ) {
    throw new NotSupportedError("String objects do not support `pop' method. They are immutable.", "pop");
};

proto.push = function ( ) {
    throw new NotSupportedError("String objects do not support `push' method. They are immutable.", "push");
};

proto.shift = function ( ) {
    throw new NotSupportedError("String objects do not support `shift' method. They are immutable.", "shift");
};

proto.unshift = function ( ) {
    throw new NotSupportedError("String objects do not support `unshift' method. They are immutable.", "unshift");
};

proto.isEmpty = function ( ) {
    return this.length == 0;
};

proto.empty = function ( ) {
    throw new NotSupportedError("String objects do not support `empty' method. They are immutable.", "empty");
};

proto.size = function ( ) {
    return this.length;
};

proto.copy = function ( ) {
    return new String(this);
};

proto.equals = function ( str ) {
    return this.toString() === str.toString();
};

proto.head = function ( ) {
    return this.charAt(0);
};

proto.tail = function ( ) {
    return this.charAt(this.length-1);
}

proto.toArray = function ( ) {
    return this.split("");
};

proto.iterator = function ( n ) {
    return new Iterator(this, n);
};

proto.reverse_iterator = function ( n ) {
    return new ReverseIterator(this, n);
};


// We define String-specifc-version of "map" and "filter",
// because we can not implement "add" method on String.
proto.map = function ( f ) {
    return this.split("").map(f).join("");
};

proto.filter = function ( f ) {
    return this.split("").filter(f).join("");
};



function Iterator ( s, n ) {
    n = Math.floor(n);
    if ( !n ) n = 0;
    if      ( n < -s.length ) n = 0;
    else if ( n < 0         ) n = n + s.length;
    else if ( n >  s.length ) n = s.length;
    this._str = s;
    this._pos = n;
}

var proto = Iterator.prototype = new data.iterator.Iterator();
proto.constructor = Iterator;

proto.copy = function ( ) {
    return new this.constructor(this._str, this._pos);
};

proto.isHead = function ( ) {
    return this._pos <= 0;
};

proto.isTail = function ( ) {
    return this._pos >= this._str.length;
};

proto.value = function ( ) {
    if ( this._pos < 0 ) this._pos = 0;
    return this._str.charAt(Math.floor(this._pos));
};

proto.next = function ( ) {
    if ( this.isTail() ) throw new NoSuchElement("no next element");
    if ( this._pos < 0 ) this._pos = 0;
    return new this.constructor(this._str, this._pos+1);
};

proto.previous = function ( ) {
    if ( this.isHead()                ) throw new NoSuchElement("no previous element");
    if ( this._pos > this._str.length ) this._pos = this._str.length;
    return new this.constructor(this._str, this._pos-1);
};

proto.compareTo = function ( another ) {
    if ( !(another instanceof this.constructor) ) throw new TypeError("String-iterators cannot be compared to values of the other types.");
    if ( this._str != another._str      ) throw new IllegalStateException("Two iterators belong to different strings.");
    var l = this._pos;
    var r = another._pos;
    return l < r  ?  -1  :
           l > r  ?   1  :  0;
};

proto.equals = function ( another ) {
    if ( this.constructor != another.constructor ) return false;
    if ( this._str != another._str ) return false;
    return this._pos == another._pos;
};

proto.distance = function ( another ) {
    if ( this.constructor != another.constructor ) return undefined;
    if ( this._str != another._str ) return undefined;
    return another._pos - this._pos;
};


function ReverseIterator ( s, n ) {
    Iterator.apply(this, arguments);
}

var proto = ReverseIterator.prototype = new data.iterator.Iterator();

for ( var i in Iterator.prototype ) {
    if ( typeof Iterator.prototype[i] == "function"  &&  Iterator.prototype.hasOwnProperty(i) ) {
        proto[i] = Iterator.prototype[i];
    }
}

proto.constructor = ReverseIterator;

proto.value = function ( ) {
    if ( this._pos <  0                ) this._pos = 0;
    if ( this._pos >= this._str.length ) return undefined;
    return this._str.charAt(this._str.length-1-Math.floor(this._pos));
};

