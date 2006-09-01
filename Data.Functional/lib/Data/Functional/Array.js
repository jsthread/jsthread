//@esmodpp
//@version 0.4.0

//@require Data.Functional.List 0.4.0
//@with-namespace Data.Functional

//@require Data.Error.IndexOutOfBoundsError
//@require Data.Error.IllegalStateError
//@with-namespace Data.Error



var proto = Array.prototype;

for ( var i in List.prototype ) {
    if ( typeof proto[i] != "function" ) proto[i] = List.prototype[i];
}


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


proto.add = proto.push;

proto.get = function ( it ) {
    if ( it instanceof Iterator || it instanceof ReverseIterator ) return it.value();
    it = Math.floor(it) || 0;
    if ( it < 0 ) it += this.length;
    return this[it];
};

proto.set = function ( it, v ) {
    if ( it instanceof Iterator || it instanceof ReverseIterator ) return it.assign(v);
    it = Math.floor(it) || 0;
    if ( it < 0 ) it += this.length;
    if ( it < 0 || this.length <= it ) throw new IndexOutOfBoundsError();
    return this[it] = v;
};

proto.insertAt = function ( it, v ) {
    if ( it instanceof Iterator || it instanceof ReverseIterator ) return it.insert(v);
    it = Math.floor(it) || 0;
    if ( it < 0 ) it += this.length;
    if ( it < 0 || this.length < it ) throw new IndexOutOfBoundsError();
    for ( var i=this.length-1;  i >= it;  i-- ) this[i+1] = this[i];
    return this[it] = v;
};

proto.removeAt = function ( it ) {
    if ( (it instanceof Iterator || it instanceof ReverseIterator) && it.isBoundTo(this) ) {
        return it.remove();
    }
    i = Math.floor(it);
    if ( isNaN(i) ) {
        throw new TypeError("`" + it + "' is neither number nor iterator.");
    } else {
        if ( i < 0            ) i += this.length;
        if ( i < 0            ) throw new IndexOutOfBoundsError("`" + it + "' is too small.");
        if ( i >= this.length ) throw new IndexOutOfBoundsError("`" + it + "' is too large.");
        return this.splice(i, 1)[0];
    }
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

proto.toArray = proto.copy;


// Re-define concat and slice
var original_concat = proto.concat;
proto.concat = function ( /* variable argumentes */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        var v = arguments[i];
        if ( v instanceof List ) arguments[i] = v.toArray();
    }
    return original_concat.apply(this, arguments);
};

var original_slice = proto.slice;
proto.slice = function ( start, end ) {
    if (   (   start instanceof Iterator        && end instanceof Iterator
            || start instanceof ReverseIterator && end instanceof ReverseIterator )
        && start.isBoundTo(this) && end.isBoundTo(this)  )
    {
        if ( start.compareTo(end) >= 0 ) return [];
        var s = [];
        do {
            s.push(start.value());
            start = start.next();
        } while ( !start.equals(end) );
        return s;
    } else {
        return original_slice.apply(this, arguments);
    }
};


function Iterator ( a, n ) {
    this._arr = a;
    this._pos = n;
}

var proto = Iterator.prototype = new List.Iterator();
proto.constructor = Iterator;

proto.isBoundTo = function ( that ) {
    return this._arr === that;
};

proto.isHead = function ( ) {
    return this._pos <= 0
        || this._arr.length == 0;
};

proto.isTail = function ( ) {
    return this._pos >= this._arr.length
        || this._arr.length == 0;
};

proto.value = function ( ) {
    if ( this.isTail()  ) return undefined;
    if ( this._pos <= 0 ) return this._arr[0];
    else                  return this._arr[Math.floor(this._pos)];
};

proto.assign = function ( v ) {
    if ( this.isTail()  ) this.insert();
    if ( this._pos <= 0 ) return this._arr[0] = v;
    else                  return this._arr[Math.floor(this._pos)] = v;
};

proto.insert = function ( v ) {
    var i = Math.floor(this._pos);
    if ( i <= 0 ) i = 0;
    else          i = Math.min(i, this._arr.length);
    return this._arr.insertAt(i, v);
};

proto.remove = function ( ) {
    if ( this.isTail() ) throw new IllegalStateError("can't remove at the tail of list");
    return this._arr.splice(this._pos, 1)[0];
};

proto.next = function ( ) {
    if ( this.isTail()  ) throw new NoSuchElement("no next element");
    if ( this._pos <= 0 ) return new this.constructor(this._arr, 1);
    else                  return new this.constructor(this._arr, this._pos+1);
};

proto.previous = function ( ) {
    if ( this.isHead()                 ) throw new NoSuchElement("no previous element");
    if ( this._pos >= this._arr.length ) return new this.constructor(this._arr, this._arr.length-1);
    else                                 return new this.constructor(this._arr, this._pos-1);
};

proto.compareTo = function ( that ) {
    if ( !(that instanceof this.constructor) ) return undefined;
    if ( this._arr !== that._arr             ) return undefined;
    var a = this._arr;
    var l = this._pos;
    var r = that._pos;
    if ( l <= 0         &&  r <= 0
      || l >= a.length  &&  r >= a.length ) return 0;
    return l < r  ?  -1  :
           l > r  ?   1  :  0;
};

proto.distance = function ( that ) {
    if ( !(that instanceof this.constructor) ) return undefined;
    if ( this._arr !== that._arr             ) return undefined;
    var l = this._pos;
    var r = that._pos;
    if ( l <= 0         &&  r <= 0
      || l >= a.length  &&  r >= a.length ) return 0;
    return r - l;
};


function ReverseIterator ( a, n ) {
    Iterator.apply(this, arguments);
}

var proto = ReverseIterator.prototype = new List.Iterator();

for ( var i in Iterator.prototype ) {
    if ( Iterator.prototype.hasOwnProperty(i)
      && typeof Iterator.prototype[i] == "function" )
    {
        proto[i] = Iterator.prototype[i];
    }
}

proto.constructor = ReverseIterator;

proto.value = function ( ) {
    if ( this.isTail()  ) return undefined;
    if ( this._pos <= 0 ) return this._arr[this._arr.length-1];
    else                  return this._arr[this._arr.length-1-Math.floor(this._pos)];
};

proto.assign = function ( v ) {
    if ( this.isTail()  ) this.insert(v);
    if ( this._pos <= 0 ) return this._arr[this._arr.length-1] = v;
    else                  return this._arr[this._arr.length-1-Math.floor(this._pos)] = v;
};

proto.insert = function ( v ) {
    var i = Math.floor(this._pos);
    if ( i <= 0 ) i = 0;
    else          i = Math.min(i, this._arr.length);
    return this._arr.insertAt(this._arr.length-i, v);
};

proto.remove = function ( ) {
    if ( this.isTail()  ) throw new IllegalStateError("can't remove at the tail of list");
    if ( this._pos <= 0 ) return this._arr.splice(this._arr.length-1, 1)[0];
    else                  return this._arr.splice(this._arr.length-1-Math.floor(this._pos), 1)[0];
};

