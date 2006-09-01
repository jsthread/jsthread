// This module should not be required directly.
// Require Data.Functional.List instead.

//@esmodpp
//@version 0.4.0
//@namespace Data.Functional

//@require Data.Functional.Collection 0.4.0

//@require Data.Error.NotImplementedError
//@require Data.Error.IndexOutOfBoundsError
//@with-namespace Data.Error



//@export List
function List ( ) {
    // This is a kind of abstract class.
}

var proto = List.prototype = new Collection();
proto.constructor = List;


// PRIVATE
// Returns iterator corresponding to index n.
function index2iterator ( l, n ) {
    n = Math.floor(n) || 0;
    var it;
    if ( n < 0 ) {
        n  = -n;
        it = l.tail();
    } else {
        it = l.head();
    }
    for ( var i=0;  ;  i++, it=it.next() ) {
        if ( i === n     ) return it;
        if ( it.isTail() ) return null;
    }
}


// Iterator methods.
proto.iterator = function ( /* delegate */ ) {
    this.head.apply(this, arguments);
};

proto.head = function ( n ) {
    throw new NotImplementedError(undefined, "head");
};

proto.tail = function ( n ) {
    throw new NotImplementedError(undefined, "tail");
};

proto.reverseHead = function ( n ) {
    throw new NotImplementedError(undefined, "reverseHead");
};

proto.reverseTail = function ( n ) {
    throw new NotImplementedError(undefined, "reverseTail");
};


// Returns the value indexed by the argument.
// If there is no corresponding value in this list, returns undefined.
// The argument can be either number or iterator.
proto.get = function ( it ) {
    if ( it instanceof List.Iterator  &&  it.isBoundTo(this) ) {
        if ( it.isTail() ) return undefined;
        else               return it.value();
    }
    it = index2iterator(this, it);
    if ( it==null || it.isTail() ) return undefined;
    return it.value();
};

// Assigns the second argument to the container indexed by the first 
// argument.
// The argument can be either number or iterator.
proto.set = function ( it, v ) {
    if ( !(it instanceof List.Iterator  &&  it.isBoundTo(this)) ) {
        it = index2iterator(this, it);
        if ( it == null ) throw new IndexOutOfBoundsError("index is out of bounds");
    }
    return it.assign(v);
};

// Inserts a new container at the position indexed by the first 
// argument, and sets the second argument to the container, then, 
// returns the value of the container.
// The argument can be either number or iterator.
// The position which this iterator points to after insertion is 
// implementation-dependent.
proto.insertAt = function ( it, v ) {
    if ( !(it instanceof List.Iterator  &&  it.isBoundTo(this)) ) {
        it = index2iterator(this, it);
        if ( it == null ) throw new IndexOutOfBoundsError("index is out of bounds");
    }
    return it.insert(v);
};

// Removes the container indexed by the argument, then, returns the 
// value of the container.
// The argument can be either number or iterator.
// The position which this iterator points to after removal is 
// implementation-dependent.
proto.removeAt = function ( it ) {
    if ( !(it instanceof List.Iterator  &&  it.isBoundTo(this)) ) {
        it = index2iterator(this, it);
        if ( it == null ) throw new IndexOutOfBoundsError("index is out of bounds");
    }
    return it.remove();
};


proto.pop = function ( ) {
    return this.reverseHead().remove();
};

proto.push = function ( /* variable args */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        this.reverseHead().insert(arguments[i]);
    }
    return this.size();
};

proto.shift = function ( ) {
    return this.head().remove();
};

proto.unshift = function ( /* variable args */ ) {
    for ( var i=arguments.length-1;  i >= 0;  i-- ) {
        this.head().insert(arguments[i]);
    }
    return this.size();
};


proto.join = function ( /* delegate */ ) {
    var arr = this.toArray();
    return arr.join.apply(arr, arguments);
};

proto.toString = function ( /* delegate */ ) {
    var arr = this.toArray();
    return arr.join.toString(arr, arguments);
};

proto.toLocaleString = function ( /* delegate */ ) {
    var arr = this.toArray();
    return arr.toLocaleString.apply(arr, arguments);
};


proto.reverse = function ( ) {
    var r = this.emptyCopy();
    for ( var it=this.reverseHead();  !it.isTail();  it=it.next() ) {
        r.push(it.value());
    }
    return r;
};

proto.slice = function ( start, end ) {
    if ( !(    start instanceof List.Iterator
            &&   end instanceof List.Iterator
            && start.isBoundTo(this) && end.isBoundTo(this)
            && start.constructor === end.constructor ) )  // one can be reverse-iterator even though the other is iterator.
    {
        start = this.head(start);
        end   = this.head(end);
    }
    var l = this.emptyCopy();
    while ( !start.equals(end) ) {
        l.push(start.value());
        start = start.next();
    }
};

proto.concat = function ( /* variable arguments */ ) {
    var list = this.emptyCopy();
    arguments[-1] = this;
    for ( var i=-1;  i < arguments.length;  i++ ) {
        var e = arguments[i];
        if ( e instanceof List ) {
            e.forEach(function(it){
                list.push(it)
            });
        }
        else if ( e instanceof Array ) {
            for ( var j=0;  j < e.length;  j++ ) list.push(e[j])
        }
        else {
            list.push(e);
        }
    }
    return list;
};


proto.foldl = proto.fold;

proto.foldl1 = proto.fold1;

proto.foldr = function ( f, s ) {
    for ( var it=this.reverseHead();  !it.isTail();  it=it.next() ) {
        try {
            s = f(it.value(), s);
        }
        catch ( e ) {
            if ( e instanceof DiscontinueException ) {
                return e.args[e.args.length-1];
            }
            else if ( e instanceof IgnoreException ) {
                // Do nothing.
            }
            else if ( e instanceof ReturnListException ) {
                s = e.args[e.args.length-1];
            }
            else {
                throw e;
            }
        }
    }
    return s;
};

proto.foldr1 = function ( f ) {
    var it = this.reverseHead();
    if ( it.isTail() ) return new EmptyEnumerationError();
    var s = it.value();
    it = it.next();
    for ( ;  !it.isTail();  it=it.next() ) {
        try {
            s = f(it.value(), s);
        }
        catch ( e ) {
            if ( e instanceof DiscontinueException ) {
                return e.args[e.args.length-1];
            }
            else if ( e instanceof IgnoreException ) {
                // Do nothing.
            }
            else if ( e instanceof ReturnListException ) {
                s = e.args[e.args.length-1];
            }
            else {
                throw e;
            }
        }
    }
    return s;
};

