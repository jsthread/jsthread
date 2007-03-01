//@esmodpp
//@version 0.3.0
//@namespace Data

//@require Data.Functional.List
//@with-namespace Data.Functional

//@require Data.Iterator.NoSuchElementError
//@with-namespace Data.Iterator

//@require Data.Error.IllegalStateError
//@with-namespace Data.Error

//@require Math.ToInteger
//@with-namespace Math



//@export LinkedList
function LinkedList ( /* variable arguments */ ) {
    this._value   = undefined;
    this._prev    = this;
    this._next    = this;
    this._removed = false;
    this.add.apply(this, arguments);
}

LinkedList.fromCollection = function ( /* variable args */ ) {
    var l = new LinkedList();
    l.addAll.apply(l, arguments);
    return l;
};


function makeContainer ( v ) {
    return { _value: v, _removed: false };
}


var proto = LinkedList.prototype = new List();
proto.constructor = LinkedList;


function nForward ( top, c, n ) {
    if ( n == 0 ) return c;
    c = c._next;
    while ( --n > 0 ) {
        if ( c === top ) throw new RangeError();
        c = c._next;
    }
    return c;
}

function nBackward ( top, c, n ) {
    if ( n == 0 ) return c;
    c = c._prev;
    while ( --n > 0 ) {
        if ( c === top ) throw new RangeError();
        c = c._prev;
    }
    return c;
}


proto.head = function ( n ) {
    if ( n < 0 ) return this.tail(-n);
    return new Iterator( this, nForward(this, this._next, ToInteger(n)) );
};

proto.tail = function ( n ) {
    if ( n < 0 ) return this.head(-n);
    return new Iterator( this, nBackward(this, this, ToInteger(n)) );
};

proto.reverseHead = function ( n ) {
    if ( n < 0 ) return this.reverseTail(-n);
    return new ReverseIterator( this, nBackward(this, this._prev, ToInteger(n)) );
};

proto.reverseTail = function ( n ) {
    if ( n < 0 ) return this.reverseHead(-n);
    return new ReverseIterator( this, nBackward(this, this, ToInteger(n)) );
};

proto.iterator = proto.head;


proto.add = function ( /* variable args */ ) {
    if ( !arguments.length ) return false;
    var it = new Iterator(this, this);
    for ( var i=0;  i < arguments.length;  i++ ) it.insert(arguments[i]);
    return true;
};

proto.pop = function ( ) {
    return (new Iterator(this, this._prev)).remove();
};

proto.shift = function ( ) {
    return (new Iterator(this, this._next)).remove();
};

proto.unshift = function ( /* variable arguments */ ) {
    var it = new Iterator(this, this._next);
    for ( var i=0;  i < arguments.length;  i++ ) it.insert(arguments[i]);
    return this.size();
};


proto.isEmpty = function ( ) {
    return this._next === this;
};

proto.empty = function ( ) {
    this._prev = this._next = this;
};

proto.size = function ( ) {
    for ( var i=0, c=this._next;  c !== this;  ++i, c=c._next );
    return i;
};

proto.copy = function ( ) {
    var l = this.emptyCopy();
    for ( var c=this._next;  c !== this;  c=c._next ) l.add(c._value);
    return l;
};

proto.toArray = function ( ) {
    var a = [];
    for ( var c=this._next;  c !== this;  c=c._next ) a.push(c._value);
    return a;
};



// comparison function about containers
function comp ( top, l, r ) {
    if ( l === r ) return 0;
    do {
        l = l._next;
        if ( l === r ) return -1;
    } while ( l !== top );
    return 1;
}

// distance function about containers
function dist ( top, l, r ) {
    for ( var i=0, it=l;  it !== top;  i--, it=it._next ) {
        if ( it === r ) return i;
    }
    for ( var i=1, it=r._next;  it !== top;  i++, it=it._next ) {
        if ( it === l ) return i;
    }
    return undefined;
}


function Iterator ( l, c ) {
    this._top = l;  // LinkedList object which this iterator belongs to.
    this._pos = c;  // Current position; abstractly iterator points to just before this container
}

var proto = Iterator.prototype = new List.Iterator();
proto.constructor = Iterator;

function validate ( it ) {
    while ( it._pos._removed ) {
        it._pos = it._pos._next;
    }
}

proto.isBoundTo = function ( that ) {
    return this._top === that;
};

proto.equals = function ( that ) {
    if ( !(that instanceof Iterator && that.isBoundTo(this._top)) ) return false;
    validate(this);
    validate(that);
    return  this._pos === that._pos;
};

proto.compareTo = function ( that ) {
    if ( !(that instanceof Iterator && that.isBoundTo(this._top)) ) return undefined;
    validate(this);
    validate(that);
    return comp(this._top, this._pos, that._pos);
};

proto.distance = function ( that ) {
    if ( !(that instanceof Iterator && that.isBoundTo(this._top)) ) return undefined;
    validate(this);
    validate(that);
    return dist(this._top, this._pos, that._pos);
};

proto.isHead = function ( ) {
    validate(this);
    return this._pos === this._top._next;
};

proto.isTail = function ( ) {
    validate(this);
    return this._pos === this._top;
};

proto.next = function ( ) {
    if ( this.isTail() ) throw new NoSuchElementError("no next element");
    return new Iterator(this._top, this._pos._next);
};

proto.previous = function ( ) {
    if ( this.isHead() ) throw new NoSuchElementError("no previous element");
    return new Iterator(this._top, this._pos._prev);
};

proto.value = function ( ) {
    validate(this);
    return this._pos._value;
};

proto.assign = function ( v ) {
    if ( this.isTail() ) return this.insert(v);
    else                 return this._pos._value = v;
};

proto.insert = function ( v ) {
    validate(this);
    var c = makeContainer(v);
    c._prev = this._pos._prev;
    c._next = this._pos;
    this._pos._prev = this._pos._prev._next = c;
    return v;
};

proto.remove = function ( ) {
    if ( this.isTail() ) throw new IllegalStateError("can't remove at the tail of list");
    this._pos._prev._next = this._pos._next;
    this._pos._next._prev = this._pos._prev;
    this._pos._removed = true;
    return this._pos._value;
};



function ReverseIterator ( l, c ) {
    this._top = l;  // LinkedList object which this iterator belongs to.
    this._pos = c;  // Current position; abstractly iterator points to just before this container
}

var proto = ReverseIterator.prototype = new List.Iterator();
for ( var i in Iterator.prototype ) proto[i] = Iterator.prototype[i];
proto.constructor = ReverseIterator;

function rvalidate ( it ) {
    while ( it._pos._removed ) {
        it._pos = it._pos._prev;
    }
}

proto.isBoundTo = Iterator.prototype.isBoundTo;

proto.equals = function ( that ) {
    if ( !(that instanceof Iterator && that.isBoundTo(this._top)) ) return false;
    rvalidate(this);
    rvalidate(that);
    return  this._pos === that._pos;
};

proto.compareTo = function ( that ) {
    if ( !(that instanceof Iterator && that.isBoundTo(this._top)) ) return undefined;
    rvalidate(this);
    rvalidate(that);
    return -comp(this._top, this._pos, that._pos);
};

proto.distance = function ( that ) {
    if ( !(that instanceof Iterator && that.isBoundTo(this._top)) ) return undefined;
    rvalidate(this);
    rvalidate(that);
    var d = dist(this._top, this._pos, that._pos);
    return isNaN(d) ? d : -d;
};

proto.isHead = function ( ) {
    rvalidate(this);
    return this._pos === this._top._prev;
};

proto.isTail = function ( ) {
    rvalidate(this);
    return this._pos === this._top;
};

proto.next = function ( ) {
    if ( this.isTail() ) throw new NoSuchElementError("no next element");
    return new ReverseIterator(this._top, this._pos._prev);
};

proto.previous = function ( ) {
    if ( this.isHead() ) throw new NoSuchElementError("no previous element");
    return new ReverseIterator(this._top, this._pos._next);
};

proto.value = function ( ) {
    rvalidate(this);
    return this._pos._value;
};

proto.assign = Iterator.prototype.assign;

proto.insert = function ( v ) {
    rvalidate(this);
    var c = makeContainer(v);
    c._next = this._pos._next;
    c._prev = this._pos;
    this._pos._next = this._pos._next._prev = c;
    return v;
};

proto.remove = Iterator.prototype.remove;

