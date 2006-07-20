//@esmodpp
//@version 0.3.0

//@namespace Data.Functional

//@require Data.Functional.Collection

//@require Data.Error.NotImplementedError
//@require Data.Error.NotSupportedError
//@with-namespace Data.Error



//@export List
function List ( ) {
    // This is a kind of abstract class.
}

var proto = List.prototype = new Collection();
proto.constructor = List;

proto.removeAt = function ( ) {
    throw new NotSupportedError(undefined, "removeAt");
};

proto.pop = function ( ) {
    throw new NotImplementedError(undefined, "pop");
};

proto.push = function ( ) {
    throw new NotImplementedError(undefined, "push");
};

proto.shift = function ( ) {
    throw new NotImplementedError(undefined, "shift");
};

proto.unshift = function ( ) {
    throw new NotImplementedError(undefined, "unshift");
};

proto.equals = function ( another ) {
    if ( !(another instanceof List) ) return false;
    return Collection.prototype.equals.call(this, another);
};

proto.head = function ( ) {
    return this.iterator().value();
};

proto.tail = function ( ) {
    return this.reverseIterator().value();
};

proto.join = function ( /* delegate */ ) {
    return Array.prototype.join.apply(this.toArray(), arguments);
};

proto.toString = function ( /* delegate */ ) {
    return Array.prototype.toString.apply(this.toArray(), arguments);
};

proto.toLocaleString = function ( /* delegate */ ) {
    return Array.prototype.toLocaleString.apply(this.toArray(), arguments);
};

proto.reverseIterator = function ( ) {
    throw new NotImplementedError(undefined, "reverseIterator");
};

proto.reverse = function ( ) {
    var r = new this.constructor();
    for ( var it=this.reverseIterator();  !it.isTail();  it=it.next() ) {
        r.push(it.value());
    }
    return r;
};

proto.concat = function ( /* variable arguments */ ) {
    var list = new this.constructor();
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
    for ( var it=this.reverseIterator();  !it.isTail();  it=it.next() ) {
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
    var it = this.reverseIterator();
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


// Re-define Array.prototype.concat
var original_concat = Array.prototype.concat;
Array.prototype.concat = function ( /* variable argumentes */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        var v = arguments[i];
        if ( v instanceof List ) arguments[i] = v.toArray();
    }
    return original_concat.apply(this, arguments);
};


