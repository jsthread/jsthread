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
//@namespace Data.Functional.List

//@require Data.Functional.List.list 0.5.0

//@require        Data.Iterator.BidirectionalIterator
//@with-namespace Data.Iterator

//@require Data.Error.UnimplementedMethodError 0.3.0
//@with-namespace Data.Error



//@export Iterator
function Iterator ( ) {
    // This is a kind of abstract class.
}

var proto = Iterator.prototype = new BidirectionalIterator();
proto.constructor = Iterator;

var obj_name = "[object " + NAMESPACE + ".Iterator]";


proto.toString = function ( ) {
    return obj_name;
};


// Assign the argument to the element which is just after the position 
// this iterator points to, then returns the new value of the element, 
// which can be defferent from the argument.
// The effect of assignment at the tail of a list should be identical 
// to the one of insertion.
// The default implementation merely throws UnimplementedMethodError.
proto.assign = function ( v ) {
    throw new UnimplementedMethodError("assign", this);
};


// Inserts a new container at the position which this iterator points 
// to and sets the argument to the container, then, returns the value 
// of the container, which can be defferent from the argument.
// The position which the iterator points to after insertion is 
// implementation-dependent.
// The default implementation merely throws UnimplementedMethodError.
proto.insert = function ( v ) {
    throw new UnimplementedMethodError("insert", this);
};


// Removes the container just after the position which this iterator 
// points, then, returns the value of the container.
// The position which the iterator points to after removal is 
// implementation-dependent.
// The default implementation merely throws UnimplementedMethodError.
proto.remove = function ( ) {
    throw new UnimplementedMethodError("remove", this);
};


// Returns true if both this iterator and the argument points to the same position,
// false otherwise.
// The default implementation is based on `compareTo' method.
proto.equals = function ( that ) {
    return this.compareTo(that) === 0;
};


// Returns the distance of this iterator and the argument,
// or undefined if the iterators seem to point to defferent list.
// A negative return value means the arguments succeeds this iterator
// and its magnitude represents the distance of them. Thus, this can be 
// used as comparison-function.
// The default implementation is based on `next', `equals' and `isTail' method.
proto.distance  = 
proto.compareTo = function ( that ) {
    if ( !(that instanceof Iterator) ) return undefined;
    for ( var i=0, l=this, r=that;  ;  i--, l=l.next() ) {
        if ( l.equals(r) ) return i;
        if ( l.isTail() ) break;
    }
    for ( var i=1, l=that.next(), r=this;  ;  i++, l=l.next() ) {
        if ( l.equals(r) ) return i;
        if ( l.isTail() ) break;
    }
    return undefined;
};


