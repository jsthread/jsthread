//@esmodpp
//@version 0.2.0

//@namespace data


//@require data.functional.List
//@with-namespace data.functional

//@require data.iterator
//@with-namespace data.iterator

//@require util.equivalent
//@with-namespace util

//@require data.error.IndexOutOfBoundsError
//@with-namespace data.error



//@export LinkedList
function LinkedList ( /* variable arguments */ ) {
    this._value   = undefined;
    this._prev    = this;
    this._next    = this;
    this._removed = false;
    for ( var i=0;  i < arguments.length;  i++ ) this.push(arguments[i]);
}

LinkedList.fromArray = function ( arr ) {
    if ( !arr ) throw new TypeError("Array object is required");
    var l = new LinkedList();
    for ( var i=0;  i < arr.length;  i++ ) l.push(arr[i]);
    return l;
};


function makeContainer ( v ) {
    var c = new LinkedList();
    c._value = v;
    return c;
}


var proto = LinkedList.prototype = new List();
proto.constructor = LinkedList;

proto.isEmpty = function ( ) {
    return this._next === this;
};

proto.empty = function ( ) {
    this._prev = this._next = this;
};

proto.size = function ( ) {
    var l = 0;
    for ( var c=this._next;  c !== this;  c=c._next ) l++;
    return l;
};

proto.copy = function ( ) {
    var l = new this.constructor();
    for ( var c=this._next;  c !== this;  c=c._next ) {
        l.push(c._value);
    }
    return l;
};

proto.equals = function ( list ) {
    if ( !( list instanceof LinkedList ) ) return false;
    var c1 = this._next;
    var c2 = list._next;
    for ( ;  c1 !== this  &&  c2 !== list;  c1=c1._next, c2=c2._next ) {
        if ( c1._value !== c2._value ) return false;
    }
    return c1 === this  &&  c2 === list;
};

proto.head = function ( ) {
    return this._next._value;
};

proto.tail = function ( ) {
    return this._prev._value;
};

proto.get = function ( n ) {
    n = Math.floor(n);
    if ( isNaN(n) ) return;
    if ( n >= 0 ) {
        for ( var c=this._next;  n && c !== this;  c=c._next, n-- );
    }
    else {
        for ( var c=this._next;  n && c !== this;  c=c._next, n++ );
    }
    return c._value;
};

proto.set = function ( n, v ) {
    n = Math.floor(n);
    if ( isNaN(n) ) throw new IllegalArgumentError("index is not a number");
    if ( n >= 0 ) {
        for ( var c=this._next;  n && c !== this;  c=c._next, n-- );
        if ( c === this ) throw new IndexOutOfBoundsError("index is too large");
    }
    else {
        for ( var c=this._prev;  n && c !== this;  c=c._prev, n++ );
        if ( c === this ) throw new IndexOutOfBoundsError("index is too small");
    }
    var old = c._value;
    c._value = v;
    return old;
};

proto.pop = function ( ) {
    var c = this._prev;
    if ( c === this ) return;
    this._prev = c._prev;
    this._prev._next = this;
    c._removed = true;
    return c._value;
};

proto.push = function ( /* variable arguments */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        var c = new makeContainer(arguments[i]);
        c._prev = this._prev;
        c._next = this;
        this._prev._next = c;
        this._prev = c;
    }
};

proto.add = proto.push;

proto.shift = function ( ) {
    var c = this._next;
    if ( c === this ) return;
    this._next = c._next;
    this._next._prev = this;
    c._removed = true;
    return c._value;
};

proto.unshift = function ( /* variable arguments */ ) {
    for ( var i=0;  i < arguments.length; i++ ) {
        var c = new makeContainer(arguments[i]);
        c._prev = this;
        c._next = this._next;
        this._next._prev = c;
        this._next = c;
    }
};

proto.remove = function ( /* variable arguments */ ) {
    var changed = 0;
    for ( var i=0;  i < arguments.length;  i++ ) {
        var arg = arguments[i];
        for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
            if ( equivalent(arg, it.value()) ) {
                it.remove();
                changed++;
                break;
            }
        }
    }
    return changed;
};

proto.removeAt = function ( x ) {
    i = Math.floor(x);
    if ( isNaN(i)                    ) throw new TypeError("`" + x + "' is not a number");
    if ( i < 0  &&  i < -this.size() ) throw new IndexOutOfBoundsError("`" + x + "' is too small.");
    i = this.iterator(i);
    if ( i.isTail()                  ) throw new IndexOutOfBoundsError("`" + x + "' is too large.");
    return i.remove();
};

proto.toArray = function ( ) {
    var a = [];
    for ( var c=this._next;  c !== this;  c=c._next ) a.push(c._value);
    return a;
};

proto.iterator = function ( n ) {
    n = Math.floor(n);
    if ( !n ) n = 0;
    var it;
    if ( n >= 0 ) {
        for ( it=new Iterator(this, this._next);  n > 0  &&  !it.isTail();  n-- ) it = it.next();
    }
    else {
        for ( it=new Iterator(this, this);        n < 0  &&  !it.isHead();  n++ ) it = it.previous();
    }
    return it;
};

proto.reverseIterator = function ( n ) {
    n = Math.floor(n);
    if ( !n ) n = 0;
    var it;
    if ( n >= 0 ) {
        for ( it=new ReverseIterator(this, this._prev);  n > 0  &&  !it.isTail();  n-- ) it = it.next();
    }
    else {
        for ( it=new ReverseIterator(this, this);        n < 0  &&  !it.isHead();  n++ ) it = it.previous();
    }
    return it;
};



function Iterator ( l, c ) {
    this._top = l;  // LinkedList object which this iterator belongs to.
    this._pos = c;  // Current position; abstractly iterator points to just before this container
}

var proto = Iterator.prototype = new data.iterator.Iterator();
proto.constructor = Iterator;

proto.copy = function ( ) {
    return new Iterator(this._top, this._pos);
};

proto.compareTo = function ( another ) {
    if ( !(another instanceof Iterator) ) throw new TypeError("`" + another + "' is not a iterator of " + NAMESPACE + ".LinkedList");
    if ( this._top !== another._top     ) throw new IllegalStateError("Two iterators belong to different lists.");
    var l = this._pos;
    var r = another._pos;
    if ( l === r ) return 0;
    for ( ;  l !== this._top;  l=l._next ) {
        if ( l === r ) return -1;
    }
    return 1;
};

proto.equals = function ( another ) {
    return  another instanceof Iterator
        &&  this._top === another._top
        &&  this._pos === another._pos;
};

proto.distance = function ( another ) {
    if ( !(another instanceof Iterator) ) return undefined;
    if ( this._top !== another._top     ) return undefined;
    var l = this._pos;
    var r = another._pos;
    for ( var i=0, it=l;  it !== this._top;  i++, it=it._next ) {
        if ( it === r ) return i;
    }
    for ( var i=0, it=r;  it !== this._top;  i--, it=it._next ) {
        if ( it === l ) return i;
    }
    return undefined;
};

proto.isHead = function ( ) {
    return this._pos === this._top._next;
};

proto.isTail = function ( ) {
    return this._pos === this._top;
};

proto.value = function ( ) {
    return this._pos._value;
};

proto.assign = function ( v ) {
    if ( this.isTail() ) throw new IllegalStateError("can't assign at the tail of list");
    return this._pos._value = v;
};

proto.next = function ( ) {
    if ( this.isTail() ) throw new NoSuchElementError("no next element");
    var it = this.copy();
    do{ it._pos = it._pos._next } while( it._pos._removed );
    return it;
};

proto.previous = function ( ) {
    if ( this.isHead() ) throw new NoSuchElementError("no previous element");
    var it = this.copy();
    do{ it._pos = it._pos._prev } while( it._pos._removed );
    return it;
};

proto.insert = function ( v ) {
    if ( this._pos._removed ) throw new IllegalStateError("can't insert before a removed element");
    return this._pos.push(v);
};

proto.remove = function ( ) {
    if ( this.isTail() )      throw new IllegalStateError("can't remove at the tail of list");
    if ( this._pos._removed ) throw new IllegalStateError("element already removed");
    return this._pos._next.pop();
};



function ReverseIterator ( l, c ) {
    this._top = l;  // LinkedList object which this iterator belongs to.
    this._pos = c;  // Current position; abstractly iterator points to just before this container
}

var proto = ReverseIterator.prototype = new data.iterator.Iterator();
for ( var i in Iterator.prototype ) proto[i] = Iterator.prototype[i];
proto.constructor = ReverseIterator;

proto.copy = function ( ) {
    return new ReverseIterator(this._top, this._pos);
};

proto.compareTo = function ( another ) {
    if ( !(another instanceof ReverseIterator) ) throw new TypeError("`" + another + "' is not a reverse-iterator of " + NAMESPACE + ".LinkedList");
    if ( this._top !== another._top            ) throw new IllegalStateError("Two iterators belong to different lists.");
    var l = this._pos;
    var r = another._pos;
    if ( l === r ) return 0;
    for ( ;  l !== this._top;  l=l._next ) {
        if ( l === r ) return 1;
    }
    return -1;
};

proto.equals = function ( another ) {
    return  another instanceof ReverseIterator
        &&  this._top === another._top
        &&  this._pos === another._pos;
};

proto.distance = function ( another ) {
    if ( !(another instanceof ReverseIterator) ) return undefined;
    if ( this._top !== another._top             ) return undefined;
    var l = this._pos;
    var r = another._pos;
    for ( var i=0, it=l;  it !== this._top;  i++, it=it._prev ) {
        if ( it === r ) return i;
    }
    for ( var i=0, it=r;  it !== this._top;  i--, it=it._prev ) {
        if ( it === l ) return i;
    }
    return undefined;
};

proto.isHead = function ( ) {
    return this._pos === this._top._prev;
};

proto.next = function ( ) {
    if ( this.isTail() ) throw new NoSuchElementError("no next element");
    var it = this.copy();
    do{ it._pos = it._pos._prev } while( it._pos._removed );
    return it;
};

proto.previous = function ( ) {
    if ( this.isHead() ) throw new NoSuchElementError("no previous element");
    var it = this.copy();
    do{ it._pos = it._pos._next } while( it._pos._removed );
    return it;
};

proto.insert = function ( v ) {
    if ( this._pos._removed ) throw new IllegalStateError("can't insert before a removed element");
    return this._pos.unshift(v);
};

proto.remove = function ( ) {
    if ( this.isTail() )      throw new IllegalStateError("can't remove at the tail of list");
    if ( this._pos._removed ) throw new IllegalStateError("element already removed");
    return this._pos._next.pop();
};


