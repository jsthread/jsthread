//@jsmodpp

//@require data.error.NotImplementedError
//@with-namespace data.error


//@namespace data.functional


//@export Collection
function Collection ( ) {
    // This is kind of abstract class.
}

var proto = Collection.prototype;

proto.add = function ( ) {
    throw new NotImplementedError("`add' method is not implemented");
};

proto.isEmpty = function ( ) {
    return this.iterator().isTail();
};

proto.empty = function ( ) {
    throw new NotImplementedError("`empty' method is not implemented");
};

proto.size = function ( ) {
    for ( var i=0, it=this.iterator();  !it.isTail();  i++, it=it.next() );
    return i;
};

proto.iterator = function ( ) {
    throw new NotImplementedError("`iterator' method is not implemented");
};

proto.copy = function ( ) {
    var c = new this.constructor();
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        c.add(it.value());
    }
    return c;
};

proto.equals = function ( another ) {
    var it1 = this.iterator(), it2 = another.iterator();
    for ( ;  !it1.isTail() && !it2.isTail();  it1=it1.next(), it2=it2.next() ) {
        if ( it1.value() !== it2.value() ) return false;
    }
    return it1.isTail() && it2.isTail();
};

proto.toArray = function ( ) {
    var a = [];
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) a.push(it.value());
    return a;
};

proto.toString = function ( /* delegate */ ) {
    return Array.prototype.toString.apply(this.toArray(), arguments);
};

proto.toLocaleString = function ( /* delegate */ ) {
    return Array.prototype.toLocaleString.apply(this.toArray(), arguments);
};


proto.filter = function ( f ) {
    var c = new this.constructor();
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        var v = it.value();
        if ( f(v) ) c.add(v);
    }
    return c;
};

proto.map = function ( f ) {
    var c = new this.constructor();
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            c.add( f(it.value()) );
        }
        catch ( e ) {
            if ( e instanceof ReturnListError ) {
                for ( var i=0;  i < e.args.length;  i++ ) c.add(e.args[i]);
            }
            else if ( e instanceof DiscontinueError ) {
                for ( var i=0;  i < e.args.length;  i++ ) c.add(e.args[i]);
                return c;
            }
            else {
                throw e;
            }
        }
    }
    return c;
};

proto.foreach = function ( f ) {
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            f( it.value() );
        }
        catch ( e ) {
            if ( e instanceof ReturnListError ) {
                // Do nothimg.
            }
            else if ( e instanceof DiscontinueError ) {
                return;
            }
            else {
                throw e;
            }
        }
    }
};



//@export List
function List ( ) {
    // This is a kind of abstract class.
}

var proto = List.prototype = new Collection();


proto.foldl = function ( f, s ) {
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            s = f(s, it.value());
        }
        catch ( e ) {
            if ( e instanceof ReturnListError ) {
                s = e.args[0];
            }
            else if ( e instanceof DiscontinueError ) {
                return e.args[0];
            }
            else {
                throw e;
            }
        }
    }
    return s;
};

proto.foldl1 = function ( f ) {
    if ( this.isEmpty() ) return;
    var it = this.iterator();
    var s = it.value();
    it = it.next();
    for ( ;  !it.isTail();  it=it.next() ) {
        try {
            s = f(s, it.value());
        }
        catch ( e ) {
            if ( e instanceof ReturnListError ) {
                s = e.args[0];
            }
            else if ( e instanceof DiscontinueError ) {
                return e.args[0];
            }
            else {
                throw e;
            }
        }
    }
    return s;
};

proto.foldr = function ( f, s ) {
    var a = this.toArray().reverse();
    for ( var i=a.length-1;  i >= 0;  i-- ) {
        try {
            s = f(a[i], s);
        }
        catch ( e ) {
            if ( e instanceof ReturnListError ) {
                s = e.args[0];
            }
            else if ( e instanceof DiscontinueError ) {
                return e.args[0];
            }
            else {
                throw e;
            }
        }
    }
    return s;
};

proto.foldr1 = function ( f ) {
    if ( this.isEmpty() ) return;
    var a = this.toArray().reverse();
    var s = a[a.length-1];
    for ( var i=a.length-2;  i >= 0;  i-- ) {
        try {
            s = f(a[i], s);
        }
        catch ( e ) {
            if ( e instanceof ReturnListError ) {
                s = e.args[0];
            }
            else if ( e instanceof DiscontinueError ) {
                return e.args[0];
            }
            else {
                throw e;
            }
        }
    }
    return s;
};



//@export return_list
function return_list ( /* variable arguments */ ) {
    throw new ReturnListError(arguments);
}

//@export ReturnListError
function ReturnListError ( args ) {
    this.args    = args;
    this.message = "invalid use of `multi_return' (used outside of map)";
}

ReturnListError.prototype.name = NAMESPACE + ".ReturnListError";


//@export discontinue
function discontinue ( /* variable arguments */ ) {
    throw new DiscontinueError(arguments);
}

//@export DiscontinueError
function DiscontinueError ( args ) {
    this.args = args;
    this.message = "invalid use of `discontinue'";
}

DiscontinueError.prototype.name = NAMESPACE + ".DiscontinueError";

