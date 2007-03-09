//@esmodpp
//@version 0.4.0
//@namespace Data.Functional

//@require Data.Functional.Collection

//@require Data.Iterator.Iterator
//@with-namespace Data.Iterator

//@require Data.Error.NotImplementedError
//@require Data.Error.IllegalStateError
//@with-namespace Data.Error



//@export Set
function Set ( ) {
    // This is kind of interface.
}

var proto = Set.prototype = new Collection();
proto.constructor = Set;

var obj_name = "[object " + NAMESPACE + ".Set]";


proto.toString = function ( ) {
    return obj_name;
};


proto.contains = function ( /* variable args */ ) {
    throw new NotImplementedError(undefined, "contains")
};

proto.containsAll = function ( /* variable args */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        var e = arguments[i];
        if ( e instanceof Array ) {
            if ( !this.contains.apply(this, e) ) return false;
        } else if ( e instanceof Collection ) {
            var self = this;
            if ( !e.all(function(it){ return self.contains(it); }) ) return false;
        } else {
            if ( !this.contains(e) ) return false;
        }
    }
    return true;
};


proto.remove = function ( /* variable args */ ) {
    throw new NotImplementedError(undefined, "remove")
};

proto.removeAll = function ( /* variable args */ ) {
    var changed = false;
    for ( var i=0;  i < arguments.length;  i++ ) {
        var e = arguments[i];
        if ( e instanceof Array ) {
            changed = this.remove.apply(this, e) || changed;
        } else if ( e instanceof Collection ) {
            var self = this;
            e.forEach(function( it ){
                changed = self.remove(it) || changed;
            });
        } else {
            changed = this.remove(e) || changed;
        }
    }
    return changed;
};

proto.removeAt = function ( it ) {
    if ( !(it instanceof Iterator) ) throw new TypeError("the argument is not of type Data.Iterator.Iterator");
    if ( !it.isBoundTo(this)       ) throw new IllegalStateError();
    var v = it.value();
    this.remove(v);
    return v;
};


proto.retainAll = function ( /* variable args */ ) {
    var temp = this.emptyCopy();
    temp.addAll.apply(temp, arguments);
    return this.removeAll( this.filter(function(it){
        return !temp.contains(it);
    }) );
};


