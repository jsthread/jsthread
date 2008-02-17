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
 * The Original Code is Concurrent.Thread.Ports.Test.Runner code.
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
//@version   0.2.0
//@namespace Test.Simple
//@extend    Test.Simple

//@require Test.Runner



var tester = null;


//@export test
function test ( n, t ) {
    var name, tests, test_case;
    if ( n instanceof Object ) {
        name      = n.name;
        tests     = n.tests;
        test_case = n.test_case;
    } else {
        name      = "";
        tests     = n;
        test_case = t;
    }
    if ( typeof test_case !== "function" ) {
        throw new TypeError("Test case must be of type Function.");
    }
    return Test.Runner.addTest(name, tests,
        // #generated# Last update: Mon, 18 Feb 2008 05:33:54 +0900
        (function () {
        var $Concurrent_Thread_self=(function () {
        (tester = this);
        try 
        {
        test_case.call(this);
        }
        finally 
        {
        (tester = null);
        }
        });
        ;
        ($Concurrent_Thread_self.$Concurrent_Thread_compiled = (function ($Concurrent_Thread_this, $Concurrent_Thread_arguments, $Concurrent_Thread_continuation) {
        return (function () {
        var $Concurrent_Thread_stack0, $Concurrent_Thread_stack1;
        function $Concurrent_Thread_null_function () {
        }
        ($Concurrent_Thread_arguments = arguments);
        (arguments.callee = $Concurrent_Thread_self);
        var $Concurrent_Thread_label20={procedure:(function ($Concurrent_Thread_intermediate) {
        (arguments = $Concurrent_Thread_arguments);
        
        {
        ($Concurrent_Thread_stack0 = $Concurrent_Thread_intermediate);
        ($Concurrent_Thread_stack1 = (tester = null));
        return {continuation:$Concurrent_Thread_label21, ret_val:void 0, timeout:void 0};
        }
        }), this_val:this, exception:$Concurrent_Thread_continuation.exception};
        var $Concurrent_Thread_label14={procedure:(function ($Concurrent_Thread_intermediate) {
        (arguments = $Concurrent_Thread_arguments);
        
        {
        ($Concurrent_Thread_stack0 = (tester = this));
        ($Concurrent_Thread_stack0 = test_case);
        if (($Concurrent_Thread_stack0.call && (typeof $Concurrent_Thread_stack0.call.$Concurrent_Thread_compiled === "function"))) return $Concurrent_Thread_stack0.call.$Concurrent_Thread_compiled($Concurrent_Thread_stack0, [this], $Concurrent_Thread_label15);
        else return {continuation:$Concurrent_Thread_label15, ret_val:$Concurrent_Thread_stack0.call(this), timeout:void 0};
        }
        }), this_val:this, exception:$Concurrent_Thread_label20};
        var $Concurrent_Thread_label15={procedure:(function ($Concurrent_Thread_intermediate) {
        (arguments = $Concurrent_Thread_arguments);
        
        {
        ($Concurrent_Thread_stack0 = $Concurrent_Thread_intermediate);
        return {continuation:$Concurrent_Thread_label16, ret_val:void 0, timeout:void 0};
        }
        }), this_val:this, exception:$Concurrent_Thread_label20};
        var $Concurrent_Thread_label16={procedure:(function ($Concurrent_Thread_intermediate) {
        (arguments = $Concurrent_Thread_arguments);
        
        {
        return {continuation:$Concurrent_Thread_label17, ret_val:void 0, timeout:void 0};
        }
        }), this_val:this, exception:$Concurrent_Thread_label20};
        var $Concurrent_Thread_label17={procedure:(function ($Concurrent_Thread_intermediate) {
        (arguments = $Concurrent_Thread_arguments);
        
        {
        ($Concurrent_Thread_stack0 = (tester = null));
        return {continuation:$Concurrent_Thread_label18, ret_val:void 0, timeout:void 0};
        }
        }), this_val:this, exception:$Concurrent_Thread_continuation.exception};
        var $Concurrent_Thread_label18={procedure:(function ($Concurrent_Thread_intermediate) {
        (arguments = $Concurrent_Thread_arguments);
        
        {
        return {continuation:$Concurrent_Thread_label19, ret_val:void 0, timeout:void 0};
        }
        }), this_val:this, exception:$Concurrent_Thread_continuation.exception};
        var $Concurrent_Thread_label19={procedure:(function ($Concurrent_Thread_intermediate) {
        (arguments = $Concurrent_Thread_arguments);
        
        {
        return {continuation:$Concurrent_Thread_continuation, ret_val:void 0, timeout:void 0};
        }
        }), this_val:this, exception:$Concurrent_Thread_continuation.exception};
        var $Concurrent_Thread_label21={procedure:(function ($Concurrent_Thread_intermediate) {
        (arguments = $Concurrent_Thread_arguments);
        
        {
        return {continuation:$Concurrent_Thread_continuation.exception, ret_val:$Concurrent_Thread_stack0, timeout:void 0};
        }
        }), this_val:this, exception:$Concurrent_Thread_continuation.exception};
        return {continuation:$Concurrent_Thread_label14, ret_val:void 0, timeout:void 0};
        }).apply($Concurrent_Thread_this, $Concurrent_Thread_arguments);
        }));
        return $Concurrent_Thread_self;
        })()
        // #/generated#
    );
};


ok = eval("0, " + ok);
