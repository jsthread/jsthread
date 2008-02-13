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
//@namespace Data.Functional

//@require Data.Functional.Collection

//@require Data.Iterator.Iterator
//@with-namespace Data.Iterator

//@require Data.Error.UnimplementedMethodError 0.3.0
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
    throw new UnimplementedMethodError("contains", this);
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
    throw new UnimplementedMethodError("remove", this);
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


