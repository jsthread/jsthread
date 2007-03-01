//@esmodpp
//@version 0.4.0

//@require Data.Functional.List  0.4.0
//@require Data.Functional.Array 0.4.0
//@with-namespace Data.Functional

//@require Data.Error.NotSupportedError
//@with-namespace Data.Error


var proto = String.prototype;

for ( var i in List.prototype ) {
    if ( !proto.hasOwnProperty(i) ) proto[i] = List.prototype[i];
}

proto.get = function ( it ) {
    if ( it instanceof Iterator || it instanceof ReverseIterator ) return it.value();
    it = Math.floor(it) || 0;
    if ( it < 0 ) it += this.length;
    if ( it < 0 || it >= this.length ) return undefined;
    return this.charAt(i);
};

proto.isEmpty = function ( ) {
    return this.length == 0;
};

proto.size = function ( ) {
    return this.length;
};

proto.copy = function ( ) {
    return new String(this);
};

proto.toArray = function ( ) {
    return this.split("");
};


proto.head = function ( n ) {
    if ( n < 0 ) return this.tail(-n);
    n = Math.floor(n) || 0;
    if ( n > this.length ) n = this.length;
    return new Iterator(this, n);
};

proto.tail = function ( n ) {
    if ( n < 0 ) return this.head(-n);
    n = Math.floor(n) || 0;
    if ( n > this.length ) n = this.length;
    return new Iterator(this, this.length-n);
};

proto.iterator = proto.head;

proto.reverseHead = function ( n ) {
    if ( n < 0 ) return this.reverseTail(-n);
    n = Math.floor(n) || 0;
    if ( n > this.length ) n = this.length;
    return new ReverseIterator(this, n);
};

proto.reverseTail = function ( n ) {
    if ( n < 0 ) return this.reverseHead(-n);
    n = Math.floor(n) || 0;
    if ( n > this.length ) n = this.length;
    return new ReverseIterator(this, this.length-n);
};


// Generate non-supported methods.
[ "add" , "addAll"  , "empty", "insertAt", "pop"    ,
  "push", "removeAt", "set"  , "shift"   , "unshift" ].forEach(function( it )
{
    proto[it] = function ( ) {
        throw new NotSupportedError("String does not support `" + it + "' method, because it is immutable.", it);
    };
});


// We define String-specifc-version of "filter", "map" and "reverse",
// because we can not implement "add" method on String.
proto.filter = function ( f ) {
    return this.split("").filter(f).join("");
};

proto.map = function ( f ) {
    return this.split("").map(f).join("");
};

proto.reverse = function ( ) {
    return this.split("").reverse().join("");
};



function Iterator ( s, n ) {
    this._str = s;
    this._pos = n;
}

var proto = Iterator.prototype = new List.Iterator();
proto.constructor = Iterator;

proto.isBoundTo = function ( that ) {
    return String(this._str) === String(that);
};

proto.isHead = function ( ) {
    return this._pos <= 0;
};

proto.isTail = function ( ) {
    return this._pos >= this._str.length;
};

proto.value = function ( ) {
    if ( this._pos <  0                ) this._pos = 0;
    if ( this._pos >= this._str.length ) return undefined;
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

proto.compareTo = function ( that ) {
    if ( !(that instanceof this.constructor) ) return undefined;
    if ( that.isBoundTo(this._str)           ) return undefined;
    var l = this._pos;
    var r = that._pos;
    return l < r  ?  -1  :
           l > r  ?   1  :  0;
};

proto.equals = function ( that ) {
    if ( !(that instanceof this.constructor) ) return false;
    if ( that.isBoundTo(this._str)           ) return false;
    return this._pos == that._pos;
};

proto.distance = function ( that ) {
    if ( !(that instanceof this.constructor) ) return undefined;
    if ( that.isBoundTo(this._str)           ) return undefined;
    if ( this._str != that._str ) return undefined;
    return that._pos - this._pos;
};


// Generate non-supported methods.
[ "assign", "insert", "remove" ].forEach(function( it ){
    proto[it] = function ( ) {
        throw new NotSupportedError("string-iterator does not support `" + it + "' method, because string is immutable.", it);
    };
});



function ReverseIterator ( s, n ) {
    Iterator.apply(this, arguments);
}

var proto = ReverseIterator.prototype = new List.Iterator();

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

