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

// This module is to demonstrate how easily concrete sub-class of 
// Data.Functional.List can be "fully" implemented (less than 100 lines!), 
// and also for testing of default implementation of the base-classes.

//@esmodpp
//@version 0.0.0
//@namespace Data.Functional
//@require Data.Functional.List.ReverseIterator
//@require Data.Iterator.NoSuchElementError
//@require Math.ToInteger
//@with-namespace Data.Iterator Data.Error Math

//@export MinimalList
function MinimalList ( /* variable args */ ) {
    this._entity = [];
    for ( var i=0;  i < arguments.length;  i++ ) this._entity[i] = arguments[i];
}

var proto = MinimalList.prototype = new List();
proto.constructor = MinimalList;

proto.head = function ( n ) {
    return new Iterator(this, n);
};

proto.reverseHead = function ( n ) {
    return new ReverseIterator(this, n);
};


function Iterator ( l, n ) {
    if ( n < 0 ) n += l._entity.length;
    if ( n < 0 || n > l._entity.length ) throw new RangeError();
    this._list = l;
    this._pos  = ToInteger(n);
}

var proto = Iterator.prototype = new List.Iterator();
proto.constructor = Iterator;

proto.isBoundTo = function ( that ) {
    return this._list === that;
};

proto.isTail = function ( ) {
    return this._pos >= this._list._entity.length
        || this._list._entity.length == 0;
};

proto.isHead = function ( ) {
    return this._pos <= 0
        || this._list._entity.length == 0;
};

proto.next = function ( ) {
    if ( this.isTail() ) throw new NoSuchElementError();
    return new Iterator(this._list, this._pos+1);
};

proto.previous = function ( ) {
    if ( this.isHead() ) throw new NoSuchElementError();
    return new Iterator(this._list, this._pos-1);
};

proto.value = function ( ) {
    if ( this.isTail() ) throw new NoSuchElementError();
    return this._list._entity[this._pos];
};

proto.assign = function ( v ) {
    if ( this.isTail() ) throw new IllegalStateError();
    return this._list._entity[this._pos] = v;
};

proto.insert = function ( v ) {
    this._list._entity.splice(this._pos, 0, v);
    return v;
};

proto.remove = function ( ) {
    if ( this.isTail() ) throw new IllegalStateError();
    return this._list._entity.splice(this._pos, 1)[0];
};

proto.equals = function ( that ) {
    if ( !(that instanceof Iterator  &&  this.isBoundTo(that._list)) ) return false;
    return this._pos == that._pos;
};


function ReverseIterator ( l, n ) {
    if ( n < 0 ) n += l._entity.length;
    if ( n < 0 || n > l._entity.length ) throw new RangeError();
    List.ReverseIterator.call( this, new Iterator(l, l._entity.length-ToInteger(n)) );
}

var proto = ReverseIterator.prototype = new List.ReverseIterator();
proto.constructor = ReverseIterator;

