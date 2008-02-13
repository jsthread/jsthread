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
//@namespace Data.Functional

//@require Data.Functional.Enumerable 0.5.0
//@require Data.Functional.Loop       0.5.0
//@with-namespace Data.Functional.Loop

//@require Data.Error.UnimplementedMethodError 0.3.0
//@with-namespace Data.Error



//@export Collection
function Collection ( ) {
    // This is kind of abstract class.
}

var proto = Collection.prototype = new Enumerable();
proto.constructor = Collection;

var obj_name = "[object " + NAMESPACE + ".Collection]";


proto.toString = function ( ) {
    return obj_name;
};


proto.toArray = function ( ) {
    var a = [];
    this.forEach(function( it ){
        a.push(it);
    });
    return a;
};


proto.add = function ( /* variable args */ ) {
    throw new UnimplementedMethodError("add", this);
};


proto.addAll = function ( /* variable arguments */ ) {
    var self    = this;
    var changed = false;
    for ( var i=0;  i < arguments.length;  i++ ) {
        var c = arguments[i];
        if ( c instanceof Collection ) {
            c.forEach(function( it ){
                changed = self.add(it) || changed;
            });
        } else if ( c instanceof Array ) {
            changed = this.add.apply(this, c) || changed;
        } else {
            chagned = this.add(c) || changed;
        }
    }
    return changed;
};


proto.removeAt = function ( it ) {
    throw new UnimplementedMethodError("removeAt", this);
};


proto.isEmpty = function ( ) {
    return this.iterator().isTail();
};


proto.empty = function ( ) {
    var it;
    while ( !(it=this.iterator()).isTail() ) this.removeAt(it);
};


proto.size = function ( ) {
    var i = 0;
    this.forEach(function(){ ++i; });
    return i;
};


proto.emptyCopy = function ( ) {
    return new this.constructor();
};


proto.copy = function ( ) {
    var c = this.emptyCopy();
    this.forEach(function( it ){
        c.add(it);
    });
    return c;
};


proto.map = function ( f ) {
    var c = this.emptyCopy();
    f = wrap_for_map(this, f, function ( ) {
        c.add.apply(c, arguments);
    });
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            f(it.value());
        } catch ( e ) {
            if ( e instanceof EndOfLoopException ) return c;
            else                                   throw e;
        }
    }
    return c;
};


proto.filter = function ( f ) {
    return this.map(function( it ){
        if ( f.call(this, it) ) return it;
        else                    ignore();
    });
};


proto.grep = function ( re ) {
    if ( !(re instanceof RegExp) ) re = new Regex(re);
    return this.filter(function(it){
        return String(it).match(re);
    });
};


