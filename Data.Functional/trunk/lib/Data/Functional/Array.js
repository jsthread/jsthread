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
 * The Original Code is Data.Functional code.
 *
 * The Initial Developer of the Original Code is
 * Daisuke Maki.
 * Portions created by the Initial Developer are Copyright (C) 2005-2007
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
//@version 0.5.0

//@require Data.Functional.List 0.5.0
//@with-namespace Data.Functional

//@require Data.Functional.Loop 0.5.0
//@with-namespace Data.Functional.Loop

//@require Data.Error.IllegalStateError
//@with-namespace Data.Error

//@require Math.ToInteger
//@with-namespace Math



var proto = Array.prototype;

for ( var i in List.prototype ) {
    if ( typeof proto[i] != "function" ) proto[i] = List.prototype[i];
}


proto.head = function ( n ) {
    if ( n < 0 ) return this.tail(-n);
    n = ToInteger(n);
    if ( n > this.length ) throw new RangeError();
    return new Iterator(this, n);
};

proto.tail = function ( n ) {
    if ( n < 0 ) return this.head(-n);
    n = ToInteger(n);
    if ( n > this.length ) throw new RangeError();
    return new Iterator(this, this.length-n);
};

proto.iterator = proto.head;

proto.reverseHead = function ( n ) {
    if ( n < 0 ) return this.reverseTail(-n);
    n = ToInteger(n);
    if ( n > this.length ) throw new RangeError();
    return new ReverseIterator(this, n);
};

proto.reverseTail = function ( n ) {
    if ( n < 0 ) return this.reverseHead(-n);
    n = ToInteger(n);
    if ( n > this.length ) throw new RangeError();
    return new ReverseIterator(this, this.length-n);
};


proto.add = function ( /* variable args */ ) {
    this.push.apply(this, arguments);
    return true;
};

proto.get = function ( it ) {
    if ( it instanceof Iterator || it instanceof ReverseIterator ) {
        if ( it.isBoundTo(this) ) return it.value();
        throw new IllegalStateError();
    }
    it = ToInteger(n);
    if ( it < 0 ) it += this.length;
    return this[it];
};

proto.set = function ( it, v ) {
    if ( it instanceof Iterator || it instanceof ReverseIterator ) {
        if ( it.isBoundTo(this) ) return it.assign(v);
        throw new IllegalStateError();
    }
    var n = ToInteger(it);
    if ( n < 0            ) n += this.length;
    if ( n < 0            ) throw new RangeError("`" + it + "' is too small.");
    if ( n >= this.length ) throw new RangeError("`" + it + "' is too large.");
    return this[n] = v;
};

proto.insertAt = function ( it, v ) {
    if ( it instanceof Iterator || it instanceof ReverseIterator ) {
        if ( it.isBoundTo(this) ) return it.insert(v);
        throw new IllegalStateError();
    }
    var n = ToInteger(it);
    if ( n < 0            ) n += this.length;
    if ( n < 0            ) throw new RangeError("`" + it + "' is too small.");
    if ( n >= this.length ) throw new RangeError("`" + it + "' is too large.");
    this.splice(n, 0, v);
    return v;
};

proto.removeAt = function ( it ) {
    if ( it instanceof Iterator || it instanceof ReverseIterator ) {
        if ( it.isBoundTo(this) ) return it.remove();
        throw new IllegalStateError();
    }
    var n = ToInteger(it);
    if ( n < 0            ) n += this.length;
    if ( n < 0            ) throw new RangeError("`" + it + "' is too small.");
    if ( n >= this.length ) throw new RangeError("`" + it + "' is too large.");
    return this.splice(n, 1)[0];
};


proto.isEmpty = function ( ) {
    return this.length == 0;
};

proto.empty = function ( ) {
    this.length = 0;
};

proto.size = function ( ) {
    return this.length;
};

proto.copy    =
proto.toArray = function ( ) {
    var a = [];
    for ( var i=0;  i < this.length;  i++ ) a[i] = this[i];
    return a;
};


proto.forEach = function ( f ) {
    f = wrap_for_forEach(this, f);
    for ( var i=0;  i < this.length;  i++ ) {
        try {
            f(this[i]);
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
    for ( var i=0;  i < this.length;  i++ ) {
        try {
            s = f(this[i]);
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
    if ( this.length == 0 ) throw new EmptyEnumerationError();
    var s = this[0];
    f = wrap_for_fold(this, f, s);
    for ( var i=1;  i < this.length;  i++ ) {
        try {
            s = f(this[i]);
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
    var g = wrap_for_fold(this, function(x,y){return f.call(this,y,x);}, s);
    for ( var i=this.length-1;  i >= 0;  i-- ) {
        try {
            s = f(this[i]);
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

proto.foldr1 = function ( f ) {
    if ( this.length == 0 ) throw new EmptyEnumerationError();
    var s = this[this.length-1];
    var g = wrap_for_fold(this, function(x,y){return f.call(this,y,x);}, s);
    for ( var i=this.length-2;  i >= 0;  i-- ) {
        try {
            s = g(this[i]);
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

proto.map = function ( f ) {
    var a = [];
    f = wrap_for_map(this, f, function(){
        a.push.apply(a, arguments);
    });
    for ( var i=0;  i < this.length;  i++ ) {
        try {
            f(this[i]);
        } catch ( e ) {
            if ( e instanceof EndOfLoopException ) return a;
            else                                   throw e;
        }
    }
    return a;
};


// Re-define concat and slice
var original_concat = proto.concat;
proto.concat = function ( /* variable argumentes */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        var v = arguments[i];
        if ( v instanceof List ) arguments[i] = v.toArray();
    }
    return original_concat.apply(this, arguments);
};

var original_slice = proto.slice;
proto.slice = function ( start, end ) {
    if (   (   start instanceof Iterator        && end instanceof Iterator
            || start instanceof ReverseIterator && end instanceof ReverseIterator )
        && start.isBoundTo(this) && end.isBoundTo(this)  )
    {
        if ( start.compareTo(end) >= 0 ) return [];
        var s = [];
        do {
            s.push(start.value());
            start = start.next();
        } while ( !start.equals(end) );
        return s;
    } else {
        return original_slice.apply(this, arguments);
    }
};



function Iterator ( a, n ) {
    this._arr = a;
    this._pos = n;
}

var proto = Iterator.prototype = new List.Iterator();
proto.constructor = Iterator;

proto.isBoundTo = function ( that ) {
    return this._arr === that;
};

proto.isHead = function ( ) {
    return ToInteger(this._pos) <= 0
        || this._arr.length == 0;
};

proto.isTail = function ( ) {
    return ToInteger(this._pos) >= this._arr.length
        || this._arr.length == 0;
};

proto.value = function ( ) {
    if ( this.isTail() ) return undefined;
    if ( this.isHead() ) return this._arr[0];
    else                 return this._arr[ToInteger(this._pos)];
};

proto.assign = function ( v ) {
    if ( this.isTail() ) return this.insert();
    if ( this.isHead() ) return this._arr[0] = v;
    else                 return this._arr[ToInteger(this._pos)] = v;
};

proto.insert = function ( v ) {
    var i = ToInteger(this._pos);
    if ( i <= 0 ) i = 0;
    else          i = min(i, this._arr.length);
    return this._arr.insertAt(i, v);
};

proto.remove = function ( ) {
    if      ( this.isTail() ) throw new IllegalStateError("can't remove at the tail of list");
    else if ( this.isHead() ) return this._arr.aplice(0, 1)[0];
    else                      return this._arr.splice(this._pos, 1)[0];
};

proto.next = function ( ) {
    if ( this.isTail() ) throw new NoSuchElement("no next element");
    if ( this.isHead() ) return new this.constructor(this._arr, 1);
    else                 return new this.constructor(this._arr, this._pos+1);
};

proto.previous = function ( ) {
    if ( this.isHead() ) throw new NoSuchElement("no previous element");
    if ( this.isTail() ) return new this.constructor(this._arr, this._arr.length-1);
    else                 return new this.constructor(this._arr, this._pos-1);
};

proto.compareTo = 
proto.distance  = function ( that ) {
    if ( !(that instanceof this.constructor) ) return undefined;
    if ( this._arr !== that._arr             ) return undefined;
    var s = this._arr.length;
    var l = ToInteger(this._pos);
    var r = ToInteger(that._pos);
    if ( l <= 0  &&  r <= 0
      || l >= s  &&  r >= s ) return 0;
    return l - r;
};


function ReverseIterator ( a, n ) {
    Iterator.apply(this, arguments);
}

var proto = ReverseIterator.prototype = new List.Iterator();

for ( var i in Iterator.prototype ) {
    if ( Iterator.prototype.hasOwnProperty(i)
      && typeof Iterator.prototype[i] == "function" )
    {
        proto[i] = Iterator.prototype[i];
    }
}

proto.constructor = ReverseIterator;

proto.value = function ( ) {
    if ( this.isTail() ) return undefined;
    if ( this.isHead() ) return this._arr[this._arr.length-1];
    else                 return this._arr[this._arr.length-1-ToInteger(this._pos)];
};

proto.assign = function ( v ) {
    if ( this.isTail() ) this.insert(v);
    if ( this.isHead() ) return this._arr[this._arr.length-1] = v;
    else                 return this._arr[this._arr.length-1-ToInteger(this._pos)] = v;
};

proto.insert = function ( v ) {
    var i = ToInteger(this._pos);
    if ( i <= 0 ) i = 0;
    else          i = min(i, this._arr.length);
    return this._arr.insertAt(this._arr.length-i, v);
};

proto.remove = function ( ) {
    if ( this.isTail() ) throw new IllegalStateError("can't remove at the tail of list");
    if ( this.isHead() ) return this._arr.splice(this._arr.length-1, 1)[0];
    else                 return this._arr.splice(this._arr.length-1-ToInteger(this._pos), 1)[0];
};

