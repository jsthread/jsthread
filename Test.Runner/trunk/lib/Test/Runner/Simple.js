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
//@extend    Test.Runner

//@require StdIO
//@require        Util.Arrayize
//@with-namespace Util.Arrayize


var all_tests = [];

//@export _addTest
function _addTest ( name, tests, test_case ) {
    all_tests.push(new Simple(name, tests, test_case));
}


//@export run
function run ( ) {
    for ( var i=0;  i < all_tests.length;  i++ ) {
        all_tests[i].run();
    }
}



//@export Simple
function Simple ( name, tests, test_case ) {
    this._name      = name;
    this._tests     = tests;
    this._test_case = test_case;
    this._progress  = 0;
    this._failed    = 0;
}
var proto = Simple.prototype;

proto.ok = function ( p, m ) {
    if ( !p ) {
        this._failed++;
        StdIO.Out.write("not ");
    }
    StdIO.Out.write("ok ", ++this._progress);
    if ( arguments.length >= 2 ) StdIO.Out.write(" - ", m);
    StdIO.Out.writeln();
};

proto.diag = function ( /* variable args */ ) {
    StdIO.Err.writeln(arrayize(arguments).join("").replace(/^/mg, "# "));
};

proto.run = function ( ) {
    StdIO.Out.writeln('Testing ', this._name ? '"'+this._name+'" ' : '', '1..', this._tests);
    try {
        this._test_case();
    } catch ( e ) {
        if ( this._progress === 0 ) {
            this.diag("Looks like your test finished with an exception before it could output anything.");
        } else {
            this.diag("Looks like your test finished with an exception just after ", this._progress);
        }
        this.diag("Exception thrown: ", e);
        if ( e.stack ) {  // Mozilla can retrieve stack trace
            this.diag("----- Stack trace -----\n", e.stack, "-----------------------");
        }
    } finally {
        if        ( this._progress === 0         ) {
            this.diag("No tests run!");
        } else if ( this._progress < this._tests ) {
            this.diag("Looks like you planned ", this._tests, " tests but only ran ", this._progress, ".");
        } else if ( this._progress > this._tests ) {
            this.diag("Looks like you planned ", this._tests, " tests but ran ", this._progress - this._tests, " extra.");
        }
        if ( this._failed > 0 ) {
            this.diag("Looks like you failed ", this._failed, " tests of ", this._progress, " run.");
        }
    }
};
