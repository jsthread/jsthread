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
 * The Original Code is Data.Iterator code.
 *
 * The Initial Developer of the Original Code is
 * Daisuke Maki.
 * Portions created by the Initial Developer are Copyright (C) 2006
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
//@version 0.2.1
//@namespace Data.Iterator

//@require Data.Error.UnimplementedMethodError 0.3.0
//@with-namespace Data.Error



//@export Iterator
function Iterator ( ) {
    // This is a kind of abstract class.
    // Sub-classes should implement appropreate methods.
}

var proto = Iterator.prototype;

var obj_name = "[object " + NAMESPACE + ".Iterator]";


proto.toString = function ( ) {
    return obj_name;
};


// Returns true if this iterator points to the tail of a list,
// false othersise.
// The default implementation merely throws UnimplementedMethodError.
// Sub-classes must implement their own version of this method.
proto.isTail = function ( ) {
    throw new UnimplementedMethodError("isTail", this);
};


// Returns value of the element which is just after the position 
// this iterator points to.
// The default implementation merely throws UnimplementedMethodError.
// Sub-classes must implement their own version of this method, 
// which may throws Data.Iterator.NoSuchElementError.
proto.value = function ( ) {
    throw new UnimplementedMethodError("value", this);
};


// Returns a new iterator that points to the next position to the 
// one which this iterator points to.
// The default implementation merely throws UnimplementedMethodError.
// Sub-classes must implement their own version of this method, 
// which may throws Data.Iterator.NoSuchElementError.
proto.next = function ( ) {
    throw new UnimplementedMethodError("next", this);
};


// Returns true if and only if this iterator is associated with the 
// object specified by the argument, false otherwise.
// The default implementation just returns false.
proto.isBoundTo = function ( list ) {
    return false;
};


proto.find = function ( f ) {
    for ( var it=this;  !it.isTail();  it=it.next() ) {
        if ( f(it.value()) ) break;
    }
    return it;
};

