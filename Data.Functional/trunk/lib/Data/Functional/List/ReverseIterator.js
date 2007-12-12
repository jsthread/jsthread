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
//@namespace Data.Functional.List

//@require Data.Functional.List.Iterator 0.4.0
//@require Oop.Spawn


// This module provides convinient wrapper to construct 
// reverse iterator from normal list iterator.


//@export ReverseIterator
function ReverseIterator ( it ) {
    this._it = it;
}

var proto = ReverseIterator.prototype = new Iterator();
proto.constructor = ReverseIterator;


proto.isBoundTo = function ( that ) {
    return this._it.isBoundTo(that);
};

proto.isTail = function ( ) {
    return this._it.isHead();
};

proto.isHead = function ( ) {
    return this._it.isTail();
};

proto.next = function ( ) {
    return new ReverseIterator(this._it.previous());
};

proto.previous = function ( ) {
    return new ReverseIterator(this._it.next());
};

proto.value = function ( ) {
    return this._it.previous().value();
};

proto.assign = function ( v ) {
    return this._it.previous().assign(v);
};

proto.insert = function ( v ) {
    return this._it.insert(v);
};

proto.remove = function ( ) {
    return this._it.previous().remove();
};

proto.equals = function ( that ) {
    if ( !(that instanceof ReverseIterator) ) return false;
    return this._it.equal(taht._it);
};

proto.compareTo = function ( that ) {
    if ( !(that instanceof ReverseIterator) ) return undefined;
    var c = this._it.compareTo(that._it);
    if ( isNaN(d) ) return c;
    return -c;
};

proto.distance = function ( that ) {
    if ( !(that instanceof ReverseIterator) ) return undefined;
    var d = this._it.distance(that._it);
    if ( isNaN(d) ) return d;
    return -d;
};

