//@esmodpp
//@version 0.5.0
//@namespace Data.Functional

//@require Data.Functional.Enumerable 0.5.0
//@require Data.Functional.Loop       0.5.0
//@with-namespace Data.Functional.Loop

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


proto.map = function ( f ) {
    var c = this.emptyCopy();
    f = wrap_for_map(this, f, function ( ) {
        c.add.apply(c, arguments);
    });
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            f(it.value());
        } catch ( e ) {
            if ( e instanceof EndOfLoopException ) return a;
            else                                   throw e;
        }
    }
    return c;
};


proto.filter = function ( f ) {
    return this.map(function( it ){
        if ( f.call(this, it) ) return it;
        else                    ignore();
    });
};


proto.grep = function ( re ) {
    if ( !(re instanceof RegExp) ) re = new Regex(re);
    return this.filter(function(it){
        return String(it).match(re);
    });
};


