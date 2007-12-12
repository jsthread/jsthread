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

//@extend    StdIO
//@namespace StdIO

//@require Math.ToInteger
//@with-namespace Math

//@with-namespace WScript


Out.write = function ( /* variable args */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        StdOut.Write(arguments[i]);
    }
};


Err.write = function ( /* variable args */ ) {
    for ( var i=0;  i < arguments.length;  i++ ) {
        StdErr.Write(arguments[i]);
    }
};



var buffer = "";

In.read = function ( n ) {
    if ( this.atEOS() ) return null;
    n = ToInteger(n);
    while ( !StdIn.AtEndOfStream && buffer.length < n ) {
        buffer += StdIn.ReadLine() + "\n";
    }
    var r = buffer.substring(0, n);
    buffer = buffer.substring(n);
    return r;
};

In.unread = function ( str ) {
    buffer = str + buffer;
};

In.atEOS = function ( ) {
    return !buffer && StdIn.AtEndOfStream;
};

In.readLine = function ( ) {
    if ( this.atEOS() ) return null;
    var i, r;
    if ( (i=buffer.indexOf("\n")) >= 0 ) {
        r = buffer.substring(0, i);
        buffer = buffer.substring(i + 1);
    } else {
        r = buffer + StdIn.ReadLine();
        buffer = "";
    }
    return r;
};

In.readAll = function ( ) {
    if ( this.atEOS() ) return null;
    var t = buffer;
    buffer = "";
    if ( StdIn.AtEndOfStream ) {
        return t;
    } else {
        return t + StdIn.ReadAll();
    }
};

