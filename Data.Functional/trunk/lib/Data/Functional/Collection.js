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
    this.forEach(function( it ){
        a.push(it);
    });
    return a;
};


proto.add = function ( /* variable args */ ) {
    throw new NotImplementedError(undefined, "add");
};


proto.addAll = function ( /* variable arguments */ ) {
    var self    = this;
    var changed = false;
    for ( var i=0;  i < arguments.length;  i++ ) {
        var c = arguments[i];
        if ( c instanceof Collection ) {
            c.forEach(function( it ){
                changed = self.add(it) || changed;
            });
        } else if ( c instanceof Array ) {
            changed = this.add.apply(this, c) || changed;
        } else {
            chagned = this.add(c) || changed;
        }
    }
    return changed;
};


proto.removeAt = function ( it ) {
    throw new NotImplementedError(undefined, "removeAt");
};


proto.isEmpty = function ( ) {
    return this.iterator().isTail();
};


proto.empty = function ( ) {
    var it;
    while ( !(it=this.iterator()).isTail() ) this.removeAt(it);
};


proto.size = function ( ) {
    var i = 0;
    this.forEach(function(){ ++i; });
    return i;
};


proto.emptyCopy = function ( ) {
    return new this.constructor();
};


proto.copy = function ( ) {
    var c = this.emptyCopy();
    this.forEach(function( it ){
        c.add(it);
    });
    return c;
};


proto.filter = function ( f ) {
    var c = this.emptyCopy();
    this.forEach(function( it ){
        if ( f.call(this, it) ) c.add(it);
    });
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


