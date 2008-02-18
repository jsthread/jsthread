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
//@namespace Concurrent.Thread.Continuation

//@require Concurrent.Thread

//@require        Data.Error 0.3.0
//@with-namespace Data.Error



//@export callcc
function callcc ( ) {
    throw new Error("can't call `" + NAMESPACE + ".callcc' in non-threaded functions");
}

callcc.$Concurrent_Thread_compiled = function ( $this, $args, $cont ) {
    function continuation ( ) {
        throw new Error("can't call any captured continuation in non-threaded functions");
    }
    continuation.$Concurrent_Thread_compiled = function ( $this, $args, _ ) {
        return { continuation: $cont ,
                 timeout     : void 0,
                 ret_val     : $args[0] };
    };
    var f = $args[0];
    return f && typeof f.$Concurrent_Thread_compiled === "function"
             ?  f.$Concurrent_Thread_compiled(null, [continuation], $cont)
             :  {continuation:$cont, ret_val:f(continuation), timeout:void 0};
};


//@export getCC
function getCC ( ) {
    throw new Error("can't call `" + NAMESPACE + ".getCC' in non-threaded functions");
}

getCC.$Concurrent_Thread_compiled = function ( $this, $args, $cont ) {
    function continuation ( ) {
        throw new Error("can't call any captured continuation in non-threaded functions");
    }
    continuation.$Concurrent_Thread_compiled = function ( $this, $args, _ ) {
        return { continuation: $cont ,
                 timeout     : void 0,
                 ret_val     : $args[0] };
    };
    return {continuation:$cont, ret_val:continuation, timeout:void 0};
};


//@export currentContinuation
function currentContinuation ( ) {
    throw new Error("can't call `" + NAMESPACE + ".currentContinuation' in non-threaded functions");
}

currentContinuation.$Concurrent_Thread_compiled = function ( $this, $args, $cont ) {
    function continuation ( ) {
        throw new Error("can't call any captured continuation in non-threaded functions");
    }
    continuation.$Concurrent_Thread_compiled = function ( $this, $args, _ ) {
        return { continuation: $cont.exception,
                 timeout     : void 0          ,
                 ret_val     : new ContinuationCalledException($args) };
    };
    return { continuation: $cont ,
             timeout     : void 0,
             ret_val     : continuation };
};


//@export ContinuationCalledException
var ContinuationCalledException = Exception.extend(
    function ( $super, args ) {
        $super("continuation called");
        this.args = args;
    },
    { name: NAMESPACE + ".ContinuationCalledException" }
);
