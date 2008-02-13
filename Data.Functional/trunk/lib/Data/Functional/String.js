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
//@version 0.4.0

//@require Data.Functional.List  0.4.0
//@require Data.Functional.Array 0.4.0
//@with-namespace Data.Functional

//@require Data.Error.UnsupportedMethodError 0.3.0
//@with-namespace Data.Error


var proto = String.prototype;

for ( var i in List.prototype ) {
    if ( !proto.hasOwnProperty(i) ) proto[i] = List.prototype[i];
}

proto.get = function ( it ) {
    if ( it instanceof Iterator || it instanceof ReverseIterator ) return it.value();
    it = Math.floor(it) || 0;
    if ( it < 0 ) it += this.length;
    if ( it < 0 || it >= this.length ) return undefined;
    return this.charAt(i);
};

proto.isEmpty = function ( ) {
    return this.length == 0;
};

proto.size = function ( ) {
    return this.length;
};

proto.copy = function ( ) {
    return new String(this);
};

proto.toArray = function ( ) {
    return this.split("");
};


proto.head = function ( n ) {
    if ( n < 0 ) return this.tail(-n);
    n = Math.floor(n) || 0;
    if ( n > this.length ) n = this.length;
    return new Iterator(this, n);
};

proto.tail = function ( n ) {
    if ( n < 0 ) return this.head(-n);
    n = Math.floor(n) || 0;
    if ( n > this.length ) n = this.length;
    return new Iterator(this, this.length-n);
};

proto.iterator = proto.head;

proto.reverseHead = function ( n ) {
    if ( n < 0 ) return this.reverseTail(-n);
    n = Math.floor(n) || 0;
    if ( n > this.length ) n = this.length;
    return new ReverseIterator(this, n);
};

proto.reverseTail = function ( n ) {
    if ( n < 0 ) return this.reverseHead(-n);
    n = Math.floor(n) || 0;
    if ( n > this.length ) n = this.length;
    return new ReverseIterator(this, this.length-n);
};


// Generate non-supported methods.
[ "add" , "addAll"  , "empty", "insertAt", "pop"    ,
  "push", "removeAt", "set"  , "shift"   , "unshift" ].forEach(function( it )
{
    proto[it] = function ( ) {
        throw new UnsupportedMethodError(it, this, "String does not support `" + it + "' method, because it is immutable");
    };
});


// We define String-specifc-version of "filter", "map" and "reverse",
// because we can not implement "add" method on String.
proto.filter = function ( f ) {
    return this.split("").filter(f).join("");
};

proto.map = function ( f ) {
    return this.split("").map(f).join("");
};

proto.reverse = function ( ) {
    return this.split("").reverse().join("");
};



function Iterator ( s, n ) {
    this._str = s;
    this._pos = n;
}

var proto = Iterator.prototype = new List.Iterator();
proto.constructor = Iterator;

proto.isBoundTo = function ( that ) {
    return String(this._str) === String(that);
};

proto.isHead = function ( ) {
    return this._pos <= 0;
};

proto.isTail = function ( ) {
    return this._pos >= this._str.length;
};

proto.value = function ( ) {
    if ( this._pos <  0                ) this._pos = 0;
    if ( this._pos >= this._str.length ) return undefined;
    return this._str.charAt(Math.floor(this._pos));
};

proto.next = function ( ) {
    if ( this.isTail() ) throw new NoSuchElement("no next element");
    if ( this._pos < 0 ) this._pos = 0;
    return new this.constructor(this._str, this._pos+1);
};

proto.previous = function ( ) {
    if ( this.isHead()                ) throw new NoSuchElement("no previous element");
    if ( this._pos > this._str.length ) this._pos = this._str.length;
    return new this.constructor(this._str, this._pos-1);
};

proto.compareTo = function ( that ) {
    if ( !(that instanceof this.constructor) ) return undefined;
    if ( that.isBoundTo(this._str)           ) return undefined;
    var l = this._pos;
    var r = that._pos;
    return l < r  ?  -1  :
           l > r  ?   1  :  0;
};

proto.equals = function ( that ) {
    if ( !(that instanceof this.constructor) ) return false;
    if ( that.isBoundTo(this._str)           ) return false;
    return this._pos == that._pos;
};

proto.distance = function ( that ) {
    if ( !(that instanceof this.constructor) ) return undefined;
    if ( that.isBoundTo(this._str)           ) return undefined;
    if ( this._str != that._str ) return undefined;
    return that._pos - this._pos;
};


// Generate non-supported methods.
[ "assign", "insert", "remove" ].forEach(function( it ){
    proto[it] = function ( ) {
        throw new UnsupportedMethodError(it, this, "string-iterator does not support `" + it + "' method, because string is immutable.");
    };
});



function ReverseIterator ( s, n ) {
    Iterator.apply(this, arguments);
}

var proto = ReverseIterator.prototype = new List.Iterator();

for ( var i in Iterator.prototype ) {
    if ( typeof Iterator.prototype[i] == "function"  &&  Iterator.prototype.hasOwnProperty(i) ) {
        proto[i] = Iterator.prototype[i];
    }
}

proto.constructor = ReverseIterator;

proto.value = function ( ) {
    if ( this._pos <  0                ) this._pos = 0;
    if ( this._pos >= this._str.length ) return undefined;
    return this._str.charAt(this._str.length-1-Math.floor(this._pos));
};

