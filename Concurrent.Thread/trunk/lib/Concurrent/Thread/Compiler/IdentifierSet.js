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
 * The Original Code is Concurrent.Thread code.
 *
 * The Initial Developer of the Original Code is
 * Daisuke Maki.
 * Portions created by the Initial Developer are Copyright (C) 2006-2007
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
//@namespace Concurrent.Thread.Compiler
//@require   Concurrent.Thread

//@require Data.Functional.Set
//@with-namespace Data.Functional
//@require Data.Iterator.Iterator
//@require Data.Iterator.NoSuchElementError
//@with-namespace Data.Iterator
//@require Data.Error.IllegalStateError
//@with-namespace Data.Error



var MIN_INT = Math.pow(-2, 53);

//@export IdentifierSet
function IdentifierSet ( ) {
    this._set      = {};
    this._state_no = MIN_INT;
}

var proto = IdentifierSet.prototype = new Set();
proto.constructor = IdentifierSet;


var hasOwnProperty = Object.prototype.hasOwnProperty;

proto.contains = function ( /* variable arguments */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        var id = arguments[i];
        if ( !(id instanceof Identifier) ) throw new TypeError("arguments[" + i + "] is not of type Identifier");
        // Because "hasOwnProperty" itself can be used as identifier,
        // we need to avoid "this._set.hasOwnProperty".
        if ( !hasOwnProperty.call(this._set, id.valueOf()) ) return false;
    }
    return true;
};


proto.add = function ( /* variable arguments */ ) {
    var changed = false;
    for ( var i=0;  i < arguments.length;  i++ ) {
        var id = arguments[i];
        if ( !(id instanceof Identifier) ) throw new TypeError("arguments[" + i + "] is not of type Identifier");
        var p = id.valueOf();
        if ( this._set[p] !== id ) {
            this._set[p] = id;
            this._state_no++;
            changed = true;
        }
    }
    return changed;
};


proto.remove = function ( /* variable arguments */ ) {
    var changed = false;
    for ( var i=0;  i < arguments.length;  i++ ) {
        var id = arguments[i];
        if ( !(id instanceof Identifier) ) throw new TypeError("argument is not of type Identifier");
        var p = id.valueOf();
        if ( hasOwnProperty.call(this._set, p) ) {
            delete this._set[p];
            this._state_no++;
            changed = true;
        }
    }
    return changed;
};


proto.toArray = function ( ) {
    var arr = [];
    for ( var i in this._set ) {
        if ( hasOwnProperty.call(this._set, i) ) arr.push(this._set[i]);
    }
    return arr;
};


proto.iterator = function ( ) {
    return new IdIterator(this, this.toArray(), 0);
};



function IdIterator ( parent, elems, index ) {
    this._parent = parent;
    this._elems  = elems;
    this._index  = index;
    this._state_no = parent._state_no;
}

var proto = IdIterator.prototype = new Iterator();
proto.constructor = IdIterator;

proto.isBoundTo = function ( o ) {
    return this._parent === o;
};

proto.isTail = function ( ) {
    if ( this._state_no !== this._parent._state_no ) throw new IllegalStateError("parent IdentifierSet object's state has been changed");
    return this._index >= this._elems.length;
};

proto.next = function ( ) {
    if ( this._state_no !== this._parent._state_no ) throw new IllegalStateError("parent IdentifierSet object's state has been changed");
    if ( this.isTail() ) throw new NoSuchElementError("no more element after the tail");
    return new IdIterator(this._parent, this._elems, this._index+1);
};

proto.value = function ( ) {
    if ( this._state_no !== this._parent._state_no ) throw new IllegalStateError("parent IdentifierSet object's state has been changed");
    return this._elems[this._index];
};
