//@esmodpp
//@version 0.4.0
//@namespace Data.Functional

//@require Data.Functional.Enumerable 0.4.0

//@require Data.Error.NotImplementedError
//@with-namespace Data.Error



//@export Collection
function Collection ( ) {
    // This is kind of abstract class.
}

var proto = Collection.prototype = new Enumerable();
proto.constructor = Collection;

var obj_name = "[object " + NAMESPACE + ".Collection]";


proto.toString = function ( ) {
    return obj_name;
};


proto.toArray = function ( ) {
    var a = [];
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) a.push(it.value());
    return a;
};


proto.add = function ( /* variable args */ ) {
    throw new NotImplementedError(undefined, "add");
};


proto.addAll = function ( /* variable arguments */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        var c = arguments[i];
        if ( c instanceof Collection ) {
            for ( var it=c.iterator();  !it.isTail();  it=it.next() ) {
                this.add(it.value());
            }
        }
        else if ( c instanceof Array ) {
            this.add.apply(this, c);
        }
        else {
            this.add(c);
        }
    }
};


proto.removeAt = function ( it ) {
    throw new NotImplementedError(undefined, "removeAt");
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


proto.emptyCopy = function ( ) {
    return new this.constructor();
};


proto.copy = function ( ) {
    var c = this.emptyCopy();
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        c.add(it.value());
    }
    return c;
};


proto.filter = function ( f ) {
    var c = this.emptyCopy();
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        var v = it.value();
        if ( f.call(this, v) ) c.add(v);
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
    var c = this.emptyCopy();
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            c.add( f.call(this, it.value()) );
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


