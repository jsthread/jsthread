//@esmodpp
//@version 0.1.0

//@require data.iterator
//@with-namespace data.iterator

//@require data.functional.List
//@with-namespace data.functional

//@require util.equivalent
//@with-namespace util

//@require data.error.IndexOutOfBoundsError
//@with-namespace data.error



var proto = Array.prototype;

for ( var i in List.prototype ) {
    if ( !proto.hasOwnProperty(i) ) proto[i] = List.prototype[i];
}

proto.add = proto.push;

proto.remove = function ( /* variable arguments */ ) {
    var changed = 0;
    for ( var i=0;  i < arguments.length;  i++ ) {
        var arg = arguments[i];
        for ( var j=0;  j < this.length;  j++ ) {
            if ( equivalent(arg, this[j]) ) {
                this.splice(j, 1);
                changed++;
                break;
            }
        }
    }
    return changed;
};

proto.removeAt = function ( x ) {
    i = Math.floor(x);
    if ( isNaN(i)         ) throw new TypeError("`" + x + "' is not a number");
    if ( i < 0            ) i += this.length;
    if ( i < 0            ) throw new IndexOutOfBoundsError("`" + x + "' is too small.");
    if ( i >= this.length ) throw new IndexOutOfBoundsError("`" + x + "' is too large.");
    return this.splice(i, 1)[0];
};

proto.isEmpty = function ( ) {
    return this.length == 0;
};

proto.empty = function ( ) {
    this.length = 0;
};

proto.size = function ( ) {
    return this.length;
};

proto.copy = function ( ) {
    var a = [];
    for ( var i=0;  i < this.length;  i++ ) a.push(this[i]);
    return a;
};

proto.equals = function ( a ) {
    if ( !(a instanceof Array)   ) return false;
    if ( a.length != this.length ) return false;
    for ( var i=0, j=0;  i < this.length;  i++, j++ ) {
        if ( this[i] !== a[j] ) return false;
    }
    return true;
};

proto.head = function ( ) {
    return this[0];
};

proto.tail = function ( ) {
    return this[this.length-1];
}

proto.toArray = proto.copy;

proto.iterator = function ( n ) {
    return new Iterator(this, n);
};

proto.reverseIterator = function ( n ) {
    return new ReverseIterator(this, n);
};



function Iterator ( a, n ) {
    n = Math.floor(n);
    if ( !n ) n = 0;
    if      ( n < -a.length ) n = 0;
    else if ( n < 0         ) n = n + a.length;
    else if ( n >  a.length ) n = a.length;
    this._arr = a;
    this._pos = n;
}

var proto = Iterator.prototype = new data.iterator.Iterator();
proto.constructor = Iterator;

proto.copy = function ( ) {
    return new this.constructor(this._arr, this._pos);
};

proto.isHead = function ( ) {
    return this._pos <= 0;
};

proto.isTail = function ( ) {
    return this._pos >= this._arr.length;
};

proto.value = function ( ) {
    if ( this._pos < 0 ) this._pos = 0;
    return this._arr[Math.floor(this._pos)];
};

proto.assign = function ( v ) {
    if ( this.isTail() ) throw new IllegalStateError("can't assign at the tail of list");
    if ( this._pos < 0 ) this._pos = 0;
    return this._arr[Math.floor(this._pos)] = v;
};

proto.next = function ( ) {
    if ( this.isTail() ) throw new NoSuchElement("no next element");
    if ( this._pos < 0 ) this._pos = 0;
    return new this.constructor(this._arr, this._pos+1);
};

proto.previous = function ( ) {
    if ( this.isHead()                ) throw new NoSuchElement("no previous element");
    if ( this._pos > this._arr.length ) this._pos = this._arr.length;
    return new this.constructor(this._arr, this._pos-1);
};

proto.compareTo = function ( another ) {
    if ( !(another instanceof this.constructor) ) throw new TypeError("Array-iterators cannot be compared to values of the other types.");
    if ( this._arr != another._arr      ) throw new IllegalStateException("Two iterators belong to different arrays.");
    var l = this._pos;
    var r = another._pos;
    return l < r  ?  -1  :
           l > r  ?   1  :  0;
};

proto.equals = function ( another ) {
    if ( this.constructor != another.constructor ) return false;
    if ( this._arr != another._arr ) return false;
    return this._pos == another._pos;
};

proto.distance = function ( another ) {
    if ( this.constructor != another.constructor ) return undefined;
    if ( this._arr != another._arr ) return undefined;
    return another._pos - this._pos;
};


function ReverseIterator ( a, n ) {
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
    if ( this._pos < 0 ) this._pos = 0;
    return this._arr[this._arr.length-1-Math.floor(this._pos)];
};

proto.assign = function ( v ) {
    if ( this.isTail() ) throw new IllegalStateError("can't assign at the tail of list");
    if ( this._pos < 0 ) this._pos = 0;
    return this._arr[this._arr.length-1-Math.floor(this._pos)] = v;
};

