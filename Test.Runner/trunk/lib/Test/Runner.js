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
 * The Original Code is Test.Runner code.
 *
 * The Initial Developer of the Original Code is
 * Daisuke Maki.
 * Portions created by the Initial Developer are Copyright (C) 2008
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
//@version 0.0.0
//@namespace Test.Runner

//@require Data.Error.UnimplementedMethodError


//@export addTest
function addTest ( name, tests, test_case ) {
    var name      = String(name);
    
    var tests     = Number(tests);
    if ( isNaN(tests)               ) throw new TypeError("Number of tests must be a postive integer.  You gave it '" + tests + "'.");
    if ( tests == 0                 ) throw new RangeError("You said to run 0 tests!  You've got to run something.");
    if ( tests <  0                 ) throw new RangeError("Number of tests must be a postive integer.  You gave it '" + tests + "'.");
    if ( tests != Math.floor(tests) ) throw new TypeError("Number of tests must be a postive integer.  You gave it '" + tests + "'.");
    
    if ( typeof test_case != "function" ) throw new TypeError("Test case must be of type Function.");
    
    return this._addTest(name, tests, test_case);
}


//@export _addTest
function _addTest ( name, tests, test_case ) {
    throw new UnimplementedMethodError("_addTest", this, "`"+NAMESPACE+"._addTest' is not implemented. You must require one of the Test.Runner-implementation modules");
}


//@export run
function run ( ) {
    throw new UnimplementedMethodError("run", this, "`"+NAMESPACE+".run' is not implemented. You must require one of the Test.Runner-implementation modules");
}
