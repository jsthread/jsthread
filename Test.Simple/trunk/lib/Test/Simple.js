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
 * The Original Code is Test.Simple module.
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
//@namespace Test.Simple
//@version   0.1.0

//@require StdIO
//@require Data.Error
//@with-namespace Data.Error


var n_of_test = undefined;
var i_of_test = undefined;

//@export test
function test ( n, t ) {
    if ( isNaN(n)               ) throw new TypeError("Number of tests must be a postive integer.  You gave it '" + n + "'.");
    if ( n == 0                 ) throw new RangeError("You said to run 0 tests!  You've got to run something.");
    if ( n <  0                 ) throw new RangeError("Number of tests must be a postive integer.  You gave it '" + n + "'.");
    if ( n != Math.floor(n)     ) throw new TypeError("Number of tests must be a postive integer.  You gave it '" + n + "'.");
    if ( typeof t != "function" ) throw new TypeError("Test case must be of type Function.");
    var old_n = n_of_test;
    var old_i = i_of_test;
    n_of_test = Number(n);
    i_of_test = 0;
    StdIO.Out.writeln("1.." + n);
    try {
        t();
    } catch ( e ) {
        StdIO.Err.writeln("# Exception thrown: " + e);
        if ( e.stack ) {
            StdIO.Err.writeln("# Stack trace ----- ");
            StdIO.Err.write(e.stack);
            StdIO.Err.writeln("# ----------------- ");
        }
        throw e;
    } finally {
        if ( i_of_test == 0 )        StdIO.Out.writeln("# No tests run!");
        if ( i_of_test < n_of_test ) StdIO.Out.writeln("# Looks like you planned " + n_of_test + " tests but only ran " + i_of_test + ".");
        if ( i_of_test > n_of_test ) StdIO.Out.writeln("# Looks like you planned " + n_of_test + " tests but ran " + (i_of_test-n_of_test) + " extra.");
        n_of_test = old_n;
        i_of_test = old_i;
    }
}


//@export ok
function ok ( e, m ) {
    if ( n_of_test == undefined ) throw UninitializedError("Test environment has not been initialized.");
    var str = "";
    if ( e ) str += "ok";
    else     str += "not ok";
    str += " " + ++i_of_test;
    if ( arguments.length >= 2 ) str += " - " + m;
    StdIO.Out.writeln(str);
}


//@export UninitializedError
var UninitializedError = newErrorClass(NAMESPACE + ".UninitializedError");
