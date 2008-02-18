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
 * The Original Code is Concurrent.Thread.Generator module.
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
//@namespace Concurrent.Thread

//@require        Concurrent.Thread.Compiler
//@require        Concurrent.Thread.Continuation
//@require        Concurrent.Thread.Mutex
//@with-namespace Concurrent
//@with-namespace Concurrent.Thread.Continuation



//@export Generator
function Generator ( f ) {
    if ( typeof f != "function" ) throw new TypeError("not a function");
    if ( typeof f.$Concurrent_Thread_compiled != "function" ) f = Thread.compile(f);
    this._mutex       = new Mutex();
    this._cont_caller = null;
    this._buf         = null;
    this._got         = false;
    
    var self = this;
    
    var generate = eval(Thread.prepare(function( x ){
        self._buf = x;
        self._got = true;
        try {
            self._cont_iter = currentContinuation();
            self._cont_caller();
        } catch ( e ) {
            self._cont_iter = null;
            if ( e instanceof ContinuationCalledException ) {
                return;  // resume iteration
            } else {
                throw e;
            }
        }
        // execution never reaches here
    }));
    
    this._cont_iter = eval(Thread.prepare(function(){
        f(generate);
        self._got       = false;
        self._cont_iter = null;  // null means that the iteration function has finished
        self._cont_caller();
    }));
}


var proto = Generator.prototype;


proto.hasNext = function ( ) {
    // This definition is called when generator is used in non-converted context.
    // The implementation is quite tricky and strongly dependent on the internal
    // implementation of Concurrent.Thread.

    if ( !this._mutex.isAcquirable() ) this._mutex.acquire();  // must throw an error
    if ( this._got            ) return true;
    if ( !this._cont_iter     ) return false;
    
    var is_called = false;
    this._cont_caller = eval(Thread.prepare(function(){
        is_called = true;
        Thread.stop();
    }));

    var triplet = Thread.create(this._cont_iter)._triplet;
    triplet.timeout = void 0;
    while ( 1 ) {
        while ( triplet.timeout === void 0 ) {
            try {
                triplet = triplet.continuation.procedure.call(
                              triplet.continuation.this_val, triplet.ret_val
                         );
            } catch ( e ) {
                if ( e instanceof NoContinuationException ) {
                    return this._got;
                } else if ( e instanceof NoExceptionHandlerException ) {
                    throw e.thrown;
                } else {
                    triplet.continuation = triplet.continuation.exception;
                    triplet.ret_val      = e;
                }
            }
        }
        if ( is_called ) {
            break;
        } else {
            triplet.continuation = triplet.continuation.exception;
            triplet.ret_val      = new Error("can't suspend in non-converted context");
        }
    }
    this._cont_caller = null;
    return this._got;
};


proto.hasNext.$Concurrent_Thread_compiled = eval(Thread.prepare(
    function ( ) {
        this._mutex.acquire();
        try {
            if ( this._got        ) return true;
            if ( !this._cont_iter ) return false;
            try {
                this._cont_caller = currentContinuation();
                this._cont_iter();
            } catch ( e ) {
                this._cont_caller = null;
                if ( e instanceof ContinuationCalledException ) {
                    return this._got;
                } else {
                    throw e;
                }
            }
        } finally {
            this._mutex.release();
        }
        // execution never reaches here
    }
)).$Concurrent_Thread_compiled;


proto.next = eval(Thread.prepare(
    function ( ) {
        if ( this.hasNext() ) {
            var x = this._buf;
            this._buf = void 0;
            this._got = false;
            return x;
        } else {
            return void 0;
        }
    }
));
