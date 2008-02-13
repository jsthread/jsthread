/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Data.Cons code.
 *
 * The Initial Developer of the Original Code is
 * Daisuke Maki.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

//@esmodpp
//@version 0.2.0
//@namespace Data.Cons
//@extend    Data.Cons

//@require Data.Functional.List 0.5.0
//@with-namespace Data.Functional

//@require Data.Functional.Loop 0.5.0
//@with-namespace Data.Functional.Loop

//@require Data.Functional.List.Iterator
//@require Data.Functional.List.ReverseIterator
//@require Data.Iterator.NoSuchElementError
//@with-namespace Data.Iterator

//@require Data.Error 0.3.0
//@require Data.Error.IllegalStateError
//@with-namespace Data.Error

//@require Math.ToInteger
//@with-namespace Math



var proto = new List();
proto.toString       = Cell.prototype.toString;
proto.toLocaleString = Cell.prototype.toLocaleString;
proto.isNil          = Cell.prototype.isNil;
Cell.prototype = proto;
proto.constructor = Cell;

proto = new Cell();
proto.toString       = Nil.prototype.toString;
proto.toLocaleString = Nil.prototype.toLocaleString;
proto.isNil          = Nil.prototype.isNil;
Nil.prototype = proto;
proto.constructor = Nil;


//@export list
function list ( /* variable args */ ) {
    var head, cell;
    head = cell = new Cell(null, new Nil());
    for ( var i=0;  i < arguments.length;  i++ ) {
        cell = cell.cdr = new Cell(arguments[i], cell.cdr);
    }
    return head.cdr;
}



proto = Cell.prototype;


proto.iterator = 
proto.head     = function ( n ) {
    n = ToInteger(n);
    if ( n < 0 ) return this.tail(-n);
    try {
        for ( var it=new Iterator(this, this, null);  n > 0;  it=it.next(), n-- );
        return it;
    } catch ( e ) {
        if ( e instanceof NoSuchElementError ) {
            throw new RangeError();
        } else {
            throw e;
        }
    }
};

proto.tail = function ( n ) {
    n = ToInteger(n);
    if ( n < 0 ) return this.head(-n);
    for ( var it=new Iterator(this, this, null);  !it.isTail();  it=it.next() );
    try {
        for ( ;  n > 0;  it=it.previous(), n-- );
        return it;
    } catch ( e ) {
        if ( e instanceof NoSuchElementError ) {
            throw new RangeError();
        } else {
            throw e;
        }
    }
};

proto.reverseHead = function ( n ) {
    return new ReverseIterator(this.tail(n));
};

proto.reverseTail = function ( n ) {
    return new ReverseIterator(this.head(n));
};


proto.get = function ( n ) {
    if ( n instanceof Iterator || n instanceof ReverseIterator ) {
        if ( !n.isBoundTo(this) ) throw new IllegalStateError();
        return n.value();
    }
    n = ToInteger(n);
    if ( n < 0 ) return this.reverse().get(-n-1);
    var c = this;
    while ( n !== 0 ) {
        c = c.cdr;
        if ( c.isNil() ) return undefined;
        n--;
    }
    return c.car;
};

proto.set = function ( n, v ) {
    if ( n instanceof Iterator || n instanceof ReverseIterator ) {
        if ( !n.isBoundTo(this) ) throw new IllegalStateError();
        return n.assign(v);
    }
    return this.head(n).assign(v);
};


proto.add = function ( /* variable args */ ) {
    if ( arguments.length == 0 ) return false;
    if ( this.isNil() ) throw new InsertAtHeadError();
    for ( var c=this;  !c.cdr.isNil();  c=c.cdr );
    for ( var i=0;  i < arguments.length;  i++ ) {
        c = c.cdr = new Cell(arguments[i], new Nil());
    }
    return true;
};

proto.shift = function ( ) {
    throw new RemoveHeadError();
};

proto.unshift = function ( ) {
    throw new InsertAtHeadError();
};

proto.pop = function ( ) {
    if ( this.isNil() ) return undefined;
    if ( this.cdr.isNil() ) throw new RemoveHeadError();
    for ( var c=this.cdr;  !c.cdr.cdr.isNil();  c=c.cdr );
    var r = c.cdr.car;
    c.cdr = c.cdr.cdr;
    return r;
};

proto.push = function ( /* variable args */ ) {
    if ( arguments.length == 0 ) return this.size();
    if ( this.isEmpty() ) throw new InsertAtHeadError();
    for ( var l=1, c=this;  !c.cdr.isNil();  l++, c=c.cdr );
    for ( var i=0;  i < arguments.length;  i++, l++ ) {
        c = c.cdr = new Cell(arguments[i], c.cdr);
    }
    return l;
};


proto.isEmpty = function ( ) {
    return this.isNil();
};

proto.empty = function ( ) {
    if ( this.isEmpty() ) return;
    throw new RemoveHeadError();
};

proto.size = function ( ) {
    for ( var i=0, c=this;  !c.isNil();  i++, c=c.cdr );
    return i;
};

proto.copy = function ( ) {
    if ( this.isNil() ) return new Nil();
    var head, cell;
    head = cell = new Cell(this.car, new Nil());
    for ( var c=this.cdr;  !c.isNil();  c=c.cdr ) {
        cell = cell.cdr = new Cell(c.car, cell.cdr);
    }
    return head;
};

proto.toArray = function ( ) {
    var a = [];
    for ( var c=this;  !c.isNil();  c=c.cdr ) a.push(c.car);
    return a;
};

proto.reverse = function ( ) {
    var r = new Nil();
    for ( var c=this;  !c.isNil();  c=c.cdr ) r = new Cell(c.car, r);
    return r;
};

proto.concat = function ( /* variable args */ ) {
    var head, cell;
    head = cell = new Cell(null, new Nil());
    arguments[-1] = this;
    for ( var i=-1;  i < arguments.length;  i++ ) {
        var c = arguments[i];
        if ( c instanceof List ) {
            c.forEach(function( it ){
                cell = cell.cdr = new Cell(it, cell.cdr);
            });
        } else if ( c instanceof Array ) {
            for ( var j=0;  j < c.length;  j++ ) {
                cell = cell.cdr = new Cell(c[j], cell.cdr);
            }
        } else {
            cell = cell.cdr = new Cell(c, cell.cdr);
        }
    }
    return head.cdr;
};

proto.slice = function ( start, end ) {
    if ( !( (   start instanceof Iterator        && end instanceof Iterator
             || start instanceof ReverseIterator && end instanceof ReverseIterator )
           && start.isBoundTo(this) && end.isBoundTo(this) ) )
    {   try {
            start = this.head(start);
        } catch ( e ) {
            if ( e instanceof RangeError ) {
                start = start < 0 ? this.head() : this.tail();
            } else {
                throw e;
            }
        }
        if ( end === undefined ) {
            end = this.tail();
        } else {
            try {
                end = this.head(end);
            } catch ( e ) {
                if ( e instanceof RangeError ) {
                    end = end < 0 ? this.head() : this.tail();
                } else {
                    throw e;
                }
            }
        }
    }
    if ( start.compareTo(end) >= 0 ) return new Nil();
    var head, cell;
    head = cell = new Cell(null, new Nil());
    while ( !start.equals(end) ) {
        cell = cell.cdr = new Cell(start.value(), cell.cdr);
        start = start.next();
    }
    return head.cdr;
}


proto.forEach = function ( f ) {
    f = wrap_for_forEach(this, f);
    for ( var c=this;  !c.isNil();  c=c.cdr ) {
        try {
            f(c.car);
        } catch ( e ) {
            if ( e instanceof EndOfLoopException ) {
                return;
            } else {
                throw e;
            }
        }
    }
};

proto.fold  =
proto.foldl = function ( f, s ) {
    f = wrap_for_fold(this, f, s);
    for ( var c=this;  !c.isNil();  c=c.cdr ) {
        try {
            s = f(c.car);
        } catch ( e ) {
            if ( e instanceof EndOfLoopException ) {
                return e.result;
            } else {
                throw e;
            }
        }
    }
    return s;
};

proto.fold1  =
proto.foldl1 = function ( f ) {
    if ( this.isEmpty() ) throw new EmptyEnumerationError();
    var s = this.car;
    f = wrap_for_fold(this, f, s);
    for ( var c=this.cdr;  !c.isNil();  c=c.cdr ) {
        try {
            s = f(c.car);
        } catch ( e ) {
            if ( e instanceof EndOfLoopException ) {
                return e.result;
            } else {
                throw e;
            }
        }
    }
    return s;
};

proto.foldr = function ( f, s ) {
    return this.reverse().foldl(function(x,y){return f.call(this,y,x);}, s);
};

proto.foldr1 = function ( f ) {
    return this.reverse().foldl1(function(x,y){return f.call(this,y,x);});
};

proto.map = function ( f ) {
    if ( this.isNil() ) return new Nil();
    var head, cell;
    head = cell = new Cell(null, new Nil());
    f = wrap_for_map(this, f, function(){
        for ( var i=0;  i < arguments.length;  i++ ) {
            cell = cell.cdr = new Cell(arguments[i], cell.cdr);
        }
    });
    for ( var c=this;  !c.isNil();  c=c.cdr ) {
        try {
            f(c.car);
        } catch ( e ) {
            if ( e instanceof EndOfLoopException ) {
                return head.cdr;
            } else {
                throw e;
            }
        }
    }
    return head.cdr;
}



function Iterator ( head, cell, prev ) {
    this._head = head;
    this._cell = cell;
    this._prev = prev;
}

var proto = Iterator.prototype = new List.Iterator();
proto.constructor = Iterator;

proto.isBoundTo = function ( that ) {
    return this._head === that;
};

proto.isHead = function ( ) {
    return this._head === this._cell;
};

proto.isTail = function ( ) {
    return this._cell.isNil();
};

proto.value = function ( ) {
    return this._cell.car;
};

proto.assign = function ( v ) {
    if ( this.isTail() ) this.insert(v);
    else                 this._cell.car = v;
    return v;
};

proto.insert = function ( v ) {
    if ( this.isHead() ) throw new InsertAtHeadError();
    this._cell = this._prev._cell.cdr = new Cell(v, this._cell.cdr);
    return v;
};

proto.remove = function ( ) {
    if ( this.isHead() ) throw new RemoveHeadError();
    if ( this.isTail() ) throw new IllegalStateError("can't remove at tail");
    var r = this._cell.car;
    this._cell = this._prev._cell.cdr = this._cell.cdr;
    return r;
};

proto.next = function ( ) {
    if ( this.isTail() ) throw new NoSuchElementError("no next element");
    return new Iterator(this._head, this._cell.cdr, this);
};

proto.previous = function ( ) {
    if ( this.isHead() ) throw new NoSuchElementError("no previous element");
    return this._prev;
};

proto.equals = function ( that ) {
    return that instanceof Iterator
        && that.isBoundTo(this._head)
        && this._cell === that._cell;
};

proto.compareTo =
proto.distance  = function ( that ) {
    if ( !(that instanceof Iterator && that.isBoundTo(this._head)) ) return undefined;
    for ( var i=0, l=this._cell, r=that._cell;  !l.isNil();  i++, l=l.cdr ) {
        if ( l === r ) return -i;
    }
    for ( var i=1, l=that._cell.cdr, r=this._cell;  !l.isNil();  i++, l=l.cdr ) {
        if ( l === r ) return i;
    }
    return void 0;
};


function ReverseIterator ( ) {
    return List.ReverseIterator.apply(this, arguments);
}

var proto = ReverseIterator.prototype = new List.ReverseIterator();
proto.constructor = ReverseIterator;



//@export InsertAtHeadError
var InsertAtHeadError = Error.extend(
    function ( $super, message ) { $super(message); },
    {
        name   : NAMESPACE + ".InsertAtHeadError",
        message: "can't insert at head of cons-list"
    }
);

//@export RemoveHeadError
var RemoveHeadError = Error.extend(
    function ( $super, message ) { $super(message); },
    {
        name   : NAMESPACE + ".RemoveHeadError",
        message: "can't remove head of cons-list"
    }
);

