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

//@require Data.Functional.Loop 0.5.0
//@with-namespace Data.Functional.Loop

//@require Data.Error 0.3.0
//@require Data.Error.UnimplementedMethodError 0.3.0
//@with-namespace Data.Error



//@export Enumerable
function Enumerable ( ) {
    // This is a kind of abstract class.
}

var proto = Enumerable.prototype;

var obj_name = "[object " + NAMESPACE + ".Enumerable]";


proto.toString = function ( ) {
    return obj_name;
};


proto.iterator = function ( ) {
    throw new UnimplementedMethodError("iterator", this);
};


proto.forEach = function ( f ) {
    var ret_val;
    f = wrap_for_forEach(this, f);
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            f(it.value());
        } catch ( e ) {
            if ( e instanceof EndOfLoopException ) return;
            else                                   throw e;
        }
    }
};


proto.fold = function ( f, s ) {
    f = wrap_for_fold(this, f, s);
    for ( var it=this.iterator();  !it.isTail();  it=it.next() ) {
        try {
            s = f(it.value());
        } catch ( e ) {
            if ( e instanceof EndOfLoopException ) return e.result;
            else                                   throw e;
        }
    }
    return s;
};


proto.fold1 = function ( f ) {
    var it = this.iterator();
    if ( it.isTail() ) throw new EmptyEnumerationError();
    var s = it.value();
    it = it.next();
    f = wrap_for_fold(this, f, s);
    for ( ;  !it.isTail();  it=it.next() ) {
        try {
            s = f(it.value());
        } catch ( e ) {
            if ( e instanceof EndOfLoopException ) return e.result;
            else                                   throw e;
        }
    }
    return s;
};


proto.and = function ( ) {
    return this.fold(function ( x, y ) {
        return y || discontinue(y);
    }, true);
};

proto.or = function ( ) {
    return this.fold(function ( x, y ) {
        return y && discontinue(y);
    }, false);
};

proto.all = function ( f ) {
    return this.fold(function ( x, y ) {
        y = f.call(this, y);
        return y || discontinue(y);
    }, true);
};

proto.any = function ( f ) {
    return this.fold(function ( x, y ) {
        y = f.call(this, y);
        return y && discontinue(y);
    }, false);
};



//@export EmptyEnumerationError
var EmptyEnumerationError = Error.extend(
    function ( $super, message ) { $super(message); },
    {
        name   : NAMESPACE + ".EmptyEnumerationError",
        message: "empty enumeration"
    }
);

