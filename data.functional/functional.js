//@esmodpp
//@version 0.1.0

//@require data.enumerable
//@with-namespace data.enumerable

//@require data.error.NotImplementedError
//@with-namespace data.error

//@require oop.SUPER


//@namespace data.functional


//@export Collection
function Collection ( ) {
    // This is kind of abstract class.
}

var proto = Collection.prototype = new Enumerable();
proto.constructor = Collection;

+function(){  //closure
    var obj_name = "[object " + NAMESPACE + ".Collection]";
    proto.toString = function ( ) {
        return obj_name;
    };
};

proto.add = function ( ) {
    throw new NotImplementedError(undefined, "add");
};

proto.isEmpty = function ( ) {
    return this.iterator().isTail();
};

proto.empty = function ( ) {
    throw new NotImplementedError(undefined, "empty");
};

proto.size = function ( ) {
    for ( var i=0, it=this.iterator();  !it.isTail();  i++, it=it.next() );
    return i;
};

proto.copy = function ( ) {
    var c = new this.constructor();
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        c.add(it.value());
    }
    return c;
};

proto.equals = function ( another ) {
    if ( !(another instanceof Collection) ) return false;
    var it1 = this.iterator(), it2 = another.iterator();
    for ( ;  !it1.isTail() && !it2.isTail();  it1=it1.next(), it2=it2.next() ) {
        var l = it1.value();
        var r = it2.value();
        if ( typeof l.equals == "function" ) {
            if ( !l.equals(r) ) return false;
        }
        else {
            if ( l !== r ) return false;
        }
    }
    return it1.isTail() && it2.isTail();
};

proto.filter = function ( f ) {
    var c = new this.constructor();
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        var v = it.value();
        if ( f(v) ) c.add(v);
    }
    return c;
};

proto.grep = function ( re ) {
    if ( !(re instanceof RegExp) ) re = new Regex(re);
    return this.filter(function(it){
        return String(it).match(re);
    });
};

proto.map = function ( f ) {
    var c = new this.constructor();
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            c.add( f(it.value()) );
        }
        catch ( e ) {
            if ( e instanceof DiscontinueException ) {
                for ( var i=0;  i < e.args.length;  i++ ) c.add(e.args[i]);
                return c;
            }
            else if ( e instanceof IgnoreException ) {
                // Do nothing.
            }
            else if ( e instanceof ReturnListException ) {
                for ( var i=0;  i < e.args.length;  i++ ) c.add(e.args[i]);
            }
            else {
                throw e;
            }
        }
    }
    return c;
};

proto.foldl = function ( f, s ) {
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            s = f(s, it.value());
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

proto.foldl1 = function ( f ) {
    var it = this.iterator();
    if ( it.isTail() ) return undefined;
    var s = it.value();
    it = it.next();
    for ( ;  !it.isTail();  it=it.next() ) {
        try {
            s = f(s, it.value());
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



//@export List
function List ( ) {
    // This is a kind of abstract class.
}

var proto = List.prototype = new Collection();
proto.constructor = List;

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
    return this.Super(List)("equals")(another);
};

proto.head = function ( ) {
    return this.iterator().value();
};

proto.tail = function ( ) {
    return this.reverse_iterator().value();
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

proto.reverse_iterator = function ( ) {
    throw new NotImplementedError(undefined, "reverse_iterator");
};

proto.reverse = function ( ) {
    var r = new this.constructor();
    for ( var it=this.reverse_iterator();  !it.isTail();  it=it.next() ) {
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
            e.foreach(function(it){
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

proto.foldr = function ( f, s ) {
    for ( var it=this.reverse_iterator();  !it.isTail();  it=it.next() ) {
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
    var it = this.reverse_iterator();
    if ( it.isTail() ) return undefined;
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


