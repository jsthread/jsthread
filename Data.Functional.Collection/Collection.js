//@esmodpp
//@version 0.3.0

//@namespace data.functional

//@require data.functional.Enumerable

//@require data.error.NotImplementedError
//@require data.error.NotSupportedError
//@with-namespace data.error



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

proto.addAll = function ( /* variable arguments */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        var c = arguments[i];
        if ( c instanceof Collection ) {
            for ( var it=c.iterator();  !it.isTail();  it=it.next() ) {
                this.add(it.value());
            }
        }
        else if ( c instanceof Array ) {
            for ( var j=0;  j < c.length;  j++ ) {
                this.add(c[j]);
            }
        }
        else {
            this.add(c);
        }
    }
};

proto.remove = function ( /* variable arguments */ ) {
    throw new NotSupportedError(undefined, "remove");
};

proto.removeAll = function ( /* variable arguments */ ) {
    var args = [];
    for ( var i=0;  i < arguments.length;  i++ ) {
        var c = arguments[i];
        if ( c instanceof Collection ) {
            c.forEach(function(it){
                args.push(it);
            });
        }
        else if ( c instanceof Array ) {
            for ( var j=0;  j < c.length;  j++ ) {
                args.push(c[j]);
            }
        }
        else {
            args.push(c);
        }
    }
    return this.remove.apply(this, args);
};

proto.isEmpty = function ( ) {
    return this.iterator().isTail();
};

proto.empty = function ( ) {
    throw new NotSupportedError(undefined, "empty");
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


