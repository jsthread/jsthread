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

//@require Concurrent.Thread.Compiler.IdentifierSet

var hasOwnProperty = Object.prototype.hasOwnProperty;



//@export IdentifierMap
function IdentifierMap ( ) {
    this._map = {};
}

var proto = IdentifierMap.prototype;


proto.clone = function clone ( ) {
    var c = new IdentifierMap();
    for ( var i in this._map ) {
        if ( hasOwnProperty.call(this._map, i) ) c._map[i] = this._map[i];
    }
    return c;
};


proto.exists = function ( /* variable arguments */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        var key = arguments[i];
        if ( !(key instanceof Identifier) ) throw new TypeError("arguments[" + i + "] is not of type Identifier");
        if ( !hasOwnProperty.call(this._map, key.valueOf()) ) return false;
    }
    return true;
};


proto.get = function ( k ) {
    if ( !(k instanceof Identifier) ) throw new TypeError("arguments[0] is not of type Identifier");
    var s = k.valueOf();
    if ( !hasOwnProperty.call(this._map, s) ) return undefined;
    return this._map[s].value;
};


proto.put = function ( k, v ) {
    if ( !(k instanceof Identifier) ) throw new TypeError("arguments[0] is not of type Identifier");
    this._map[k.valueOf()] = {id: k, value: v};
};


proto.remove = function ( k ) {
    if ( !(k instanceof Identifier) ) throw new TypeError("arguments[0] is not of type Identifier");
    return delete this._map[k.valueOf()];
};


proto.keys = function ( ) {
    var set = new IdentifierSet();
    for ( var i in this._map ) {
        if ( hasOwnProperty.call(this._map, i) ) set.add(this._map[i].id);
    }
    return set;
};


proto.values = function ( ) {
    var vals = [];
    for ( var i in this._map ) {
        if ( hasOwnProperty.call(this._map, i) ) vals.push(this._map[i].value);
    }
    return vals;
};

