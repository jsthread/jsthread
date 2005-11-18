var List = function(){  // Name space

    function List ( /* variable arguments */ ) {
        this.value   = undefined;
        this.prev    = this;
        this.next    = this;
        this.removed = false;
        for ( var i=0;  i < arguments.length;  i++ ) this.push(arguments[i]);
    }

    List.fromArray = function ( arr ) {
        if ( !arr ) throw new TypeError("Array object is required");
        var l = new List();
        for ( var i=0;  i < arr.length;  i++ ) l.push(arr[i]);
        return l;
    };


    function makeContainer ( v ) {
        var c = new List();
        c.value = v;
        return c;
    }

    var proto = List.prototype;
    
    proto.isEmpty = function ( ) {
        return this.next == this;
    };
    
    proto.length = function ( ) {
        var l = 0;
        for ( var c=this.next;  c != this;  c=c.next ) l++;
        return l;
    };
    
    proto.clear = function ( ) {
        this.prev = this.next = this;
    };
    
    proto.copy = function ( ) {
        var l = new this.constructor();
        for ( var c=this.next;  c != this;  c=c.next ) {
            l.push(c.value);
        }
        return l;
    };
    
    proto.equals = function ( list ) {
        if ( !( list instanceof List ) ) return false;
        var c1 = this.next;
        var c2 = list.next;
        for ( ;  c1 != this  &&  c2 != list;  c1=c1.next, c2=c2.next ) {
            if ( c1.value !== c2.value ) return false;
        }
        return c1 == this  &&  c2 == list;
    };
    
    proto.head = function ( ) {
        return this.next.value;
    };
    
    proto.tail = function ( ) {
        return this.prev.value;
    };
    
    proto.get = function ( n ) {
        n = Math.floor(n);
        if ( isNaN(n) ) return;
        if ( n >= 0 ) {
            for ( var c=this.next;  n && c != this;  c=c.next, n-- );
        }
        else {
            for ( var c=this.next;  n && c != this;  c=c.next, n++ );
        }
        return c.value;
    };
    
    proto.set = function ( n, v ) {
        n = Math.floor(n);
        if ( isNaN(n) ) throw new IllegalArgumentError("index is not a number");
        if ( n >= 0 ) {
            for ( var c=this.next;  n && c != this;  c=c.next, n-- );
            if ( c == this ) throw new IndexOutOfBoundsError("index is too large");
        }
        else {
            for ( var c=this.prev;  n && c != this;  c=c.prev, n++ );
            if ( c == this ) throw new IndexOutOfBoundsError("index is too small");
        }
        var old = c.value;
        c.value = v;
        return old;
    };
    
    proto.pop = function ( ) {
        var c = this.prev;
        if ( c == this ) return;
        this.prev = c.prev;
        this.prev.next = this;
        c.removed = true;
        return c.value;
    };

    proto.push = function ( /* variable arguments */ ) {
        for ( var i=0;  i < arguments.length;  i++ ) {
            var c = new makeContainer(arguments[i]);
            c.prev = this.prev;
            c.next = this;
            this.prev.next = c;
            this.prev = c;
        }
    };
    
    proto.shift = function ( ) {
        var c = this.next;
        if ( c == this ) return;
        this.next = c.next;
        this.next.prev = this;
        c.removed = true;
        return c.value;
    };

    proto.unshift = function ( /* variable arguments */ ) {
        for ( var i=0;  i < arguments.length; i++ ) {
            var c = new makeContainer(arguments[i]);
            c.prev = this;
            c.next = this.next;
            this.next.prev = c;
            this.next = c;
        }
    };
    
    proto.concat = function ( /* variable arguments */ ) {
        var list = new List();
        arguments[-1] = this;
        for ( var i=-1;  i < arguments.length;  i++ ) {
            var e = arguments[i];
            if ( e instanceof List ) {
                e.foreach(function(x){
                    list.push(x)
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
    
    proto.toArray = function ( ) {
        var a = [];
        for ( var c=this.next;  c != this;  c=c.next ) a.push(c.value);
        return a;
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

    proto.reverse = function ( ) {
        var l = new List();
        for ( var c=this.next;  c != this;  c=c.next ) {
            l.unshift(c.value);
        }
        return l;
    };

    proto.filter = function ( f ) {
        var l = new List();
        for ( var c=this.next;  c != this;  c=c.next ) {
            if ( f(c.value) ) l.push(c.value);
        }
        return l;
    };

    proto.map = function ( f ) {
        var l = new List();
        for ( var c=this.next;  c != this;  c=c.next ) {
            try {
                l.push(f(c.value));
            }
            catch ( e ) {
                if ( e instanceof ListReturnError ) {
                    l.push.apply(l, e.args);
                }
                else if ( e instanceof DiscontinueError ) {
                    l.push.apply(l, e.args);
                    return l;
                }
                else {
                    throw e;
                }
            }
        }
        return l;
    };
    
    proto.foreach = function ( f ) {
        for ( var c=this.next;  c != this;  c=c.next ) {
            try {
                f(c.value);
            }
            catch ( e ) {
                if ( e instanceof ListReturnError ) {
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

    proto.foldl = function ( f, s ) {
        for ( var c=this.next;  c != this;  c=c.next ) {
            try {
                s = f(s, c.value);
            }
            catch ( e ) {
                if ( e instanceof ListReturnError ) {
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
        var c = this.next;
        if ( c == this ) return;
        var s = c.value;
        for ( c=c.next;  c != this;  c=c.next ) {
            try {
                s = f(s, c.value);
            }
            catch ( e ) {
                if ( e instanceof ListReturnError ) {
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
        for ( var c=this.prev;  c != this;  c=c.prev ) {
            try {
                s = f(c.value, s);
            }
            catch ( e ) {
                if ( e instanceof ListReturnError ) {
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
        var c = this.prev;
        if ( c == this ) return;
        var s = c.value;
        for ( c=c.prev;  c != this;  c=c.prev ) {
            try {
                s = f(c.value, s);
            }
            catch ( e ) {
                if ( e instanceof ListReturnError ) {
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

    proto.iterator = function ( n ) {
        n = Math.floor(n);
        if ( !n ) n = 0;
        var it;
        if ( n >= 0 ) {
            it = new Iterator(this, this.next);
            while ( n > 0  &&  !it.isTail() ) { n--; it.next() }
        }
        else {
            it = new Iterator(this, this);
            while ( n < -1  &&  !it.isHead() ) { n++; it.previous(); }
        }
        return it;
    };
    

    function Iterator ( l, c ) {
        this.top = l;  // list which this iterator points to
        this.pos = c;  // current position; abstractly iterator points to just before this container
    }
    
    var proto = Iterator.prototype;
    
    proto.copy = function ( ) {
        return new Iterator(this.top, this.pos);
    };
    
    proto.isHead = function ( ) {
        return this.pos != this.top.next;
    };

    proto.isTail = function ( ) {
        return this.pos == this.top;
    };
    
    proto.value = function ( ) {
        return this.pos.value;
    };
    
    proto.assign = function ( v ) {
        if ( this.isTail() ) throw new IllegalStateException("can't assign at the tail of list");
        var old = this.pos.value;
        this.pos.value = v;
        return old;
    };
    
    proto.next = function ( ) {
        if ( this.isTail() ) throw new NoSuchElementError("no next element");
        do{ this.pos = this.pos.next } while(this.pos.removed);
        return this.pos.value;
    };

    proto.previous = function ( ) {
        if ( this.isHead() ) throw new NoSuchElementError("no previous element");
        do{ this.pos = this.pos.prev } while(this.pos.removed);
        return this.pos.value;
    };

    proto.insert = function ( v ) {
        return this.pos.push(v);
    };

    proto.remove = function ( ) {
        if ( this.isTail() ) throw new IllegalStateException("can't remove at the tail of list");
        return this.pos.next.pop();
    };


    // Re-define Array.prototype.concat
    var original_concat = Array.prototype.concat;
    Array.prototype.concat = function ( /* variable argumentes */ ) {
        for ( var i=0;  i < arguments.length;  i++ ) {
            if ( arguments[i] instanceof List ) arguments[i] = arguments[i].toArray();
        }
        return original_concat.apply(this, arguments);
    };


    List.IndexOutOfBoundsError = function ( m ) {
        if ( m !== undefined ) this.message = m;
    };
    List.IndexOutOfBoundsError.prototype.name = "List.IndexOutOfBoundsError";

    List.NoSuchElementError = function ( m ) {
        if ( m !== undefined ) this.message = m;
    };
    List.NoSuchElementError.prototype.name = "List.NoSuchElementError";

    List.IllegalStateException = function ( m ) {
        if ( m !== undefined ) this.message = m;
    };
    List.IllegalStateException.prototype.name = "List.IllegalStateException";


    return List;
}();


