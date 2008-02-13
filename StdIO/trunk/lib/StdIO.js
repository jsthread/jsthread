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
 * The Original Code is StdIO code.
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

//@esmodpp 0.10.0
//@version 0.0.0
//@namespace StdIO

//@require Data.Error.UnimplementedMethodError 0.3.0
//@with-namespace Data.Error


//@export Out
var Out = {};

Out.write = function ( /* variable args */ ) {
    throw new UnimplementedMethodError("write", this);
};

Out.writeLine = function ( /* variable args */ ) {
    arguments.length++;
    arguments[arguments.length-1] = "\n";
    return this.write.apply(this, arguments);
};

Out.writeln = Out.writeLine;


//@export Err
var Err = {};

for ( var i in Out ) {
    Err[i] = Out[i];
}


//@export In
var In = {};

In.read = function ( n ) {
    throw new UnimplementedMethodError("read", this);
};

In.unread = function ( str ) {
    throw new UnimplementedMethodError("unread", this);
};

In.atEOS = function ( ) {
    throw new UnimplementedMethodError("atEOS", this);
};

In.readLine = function ( ) {
    if ( this.atEOS() ) return null;
    var buf = [];
    var c;
    while ( (c=this.read(1)) != null && c != "\n" ) {
        buf.push(c);
    }
    return buf.join("");
};

In.readln = In.readLine;

In.readAll = function ( ) {
    if ( this.atEOS() ) return null;
    var buf = [];
    var c;
    while ( (c=this.read(1)) != null ) {
        buf.push(c);
    }
    return buf.join("");
};

