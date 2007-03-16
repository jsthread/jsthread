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
 * The Original Code is Data.Error module.
 *
 * The Initial Developer of the Original Code is
 * Daisuke Maki.
 * Portions created by the Initial Developer are Copyright (C) 2005-2006
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
//@use-namespace Data.Error
// We declare `Error' in this namespace, while we need to access 
// ECMAScript's native `Error' object.
// That's why we don't use @namespace here.


//@shared Error
Data.Error.Error = function ( message ) {
    if ( message !== undefined ) this.message = message;
    var e = Error.apply(this, arguments);
    for ( var i in e ) {
        if ( i=='name' || i=='message' ) continue;
        this[i] = e[i];
    }
};
var proto = Data.Error.Error.prototype = new Error();
proto.constructor = Data.Error.Error;
proto.name        = NAMESPACE + ".Error";
proto.message     = "something's wrong";
proto.toString = function ( ) {
    var s = String(this.message);
    return  s  ?  this.name + ": " + s
               :  this.name;
};

//@export newErrorClass
function newErrorClass ( name, init ) {
    var c = function ( ) {
        if ( typeof init == "function" ) var ret = init.apply(this, arguments);
        if ( ret !== false ) {
            if ( arguments[0] !== undefined ) this.message = arguments[0];
            var e = Error.apply(this, arguments);
            for ( var i in e ) {
                if ( this.hasOwnProperty(i) || i=='name' || i=='message' ) continue;
                this[i] = e[i];
            }
        }
    };
    var proto = c.prototype = new Data.Error.Error();
    proto.constructor = c;
    proto.name        = name;
    return c;
}


//@export Exception
function Exception ( message ) {
    if ( message !== undefined ) this.message = message;
    var e = Error.apply(this, arguments);
    for ( var i in e ) {
        if ( i=='name' || i=='message' ) continue;
        this[i] = e[i];
    }
}
var proto = Exception.prototype = new Error();
proto.constructor = Exception;
proto.name        = NAMESPACE + ".Exception";
proto.message     = "an exception has occurred.";
proto.toString = function ( ) {
    var s = String(this.message);
    return  s  ?  this.name + ": " + s
               :  this.name;
};

//@export newExceptionClass
function newExceptionClass ( name, init ) {
    var c = function ( ) {
        if ( typeof init == "function" ) var ret = init.apply(this, arguments);
        if ( ret !== false ) {
            if ( arguments[0] !== undefined ) this.message = arguments[0];
            var e = Error.apply(this, arguments);
            for ( var i in e ) {
                if ( this.hasOwnProperty(i) || i=='name' || i=='message' ) continue;
                this[i] = e[i];
            }
        }
    };
    var proto = c.prototype = new Exception();
    proto.constructor = c;
    proto.name        = name;
    return c;
}

