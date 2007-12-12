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
//@version 0.1.0
//@namespace Concurrent

//@require Data.LinkedList
//@require Data.Error
//@with-namespace Data.Error



var current_thread = null;  // Retains the current thread.


function ConsumedException ( t ) {
    this.triplet = t;
}


function NoContinuationException ( r ) {
    this.ret_val = r;
}

function initial_continuation_procedure ( ret_val ) {
    throw new NoContinuationException(ret_val);
}

function NoExceptionHandlerException ( e ) {
    this.thrown = e;
}

function initial_exception_handler ( e ) {
    throw new NoExceptionHandlerException(e);
}

var initial_continuation = {
    this_val : null,
    procedure: initial_continuation_procedure,
    exception: {
        this_val : null,
        procedure: initial_exception_handler
    }
};



//@export Thread
function Thread ( ) {
    throw new Error("Thread cannot be instantiated directly.");
}

function THREAD ( t ) {
    this._triplet      = t;  // {continuation:{...}, timeout:int|undefined, ret_val:any}
    this._is_ended     = 0;  // 0:running, -1:throw, 1:return
    this._join_thread  = null;
    this._joined_list  = new Data.LinkedList();
    this._timerID      = undefined;
    standBy.call(this, 0);
}

var proto = THREAD.prototype = Thread.prototype;

+function(){
    var name = "[object " + NAMESPACE + ".Thread]"
    proto.toString = function ( ) {
        return name;
    };
}();


// Cancel timeout event.
function cancel ( ) {
    if ( this._timerID ) {
        clearTimeout(this._timerID);
        this._timerID = undefined;
    }
}

// Reserve execution of the next step after t msec.
function standBy ( t ) {
    cancel.call(this);
    var self = this;
    this._timerID = setTimeout(
        function(){ doNext.call(self); },
        Number(t) || 2  // some version of IE occationally fails to 
                        // context-switch with timeout interval less than 2.
    );
}

// Cut "join" link.
function unjoin ( ) {
    if ( this._join_thread ) {
        var it = this._join_thread._joined_list.head().find(function( that ){
            return that === this;
        });
        it.remove();
        this._join_thread = null;
    }
}


Thread.TIME_SLICE = 20;

function doNext ( ) {
    cancel.call(this);
    var triplet = this._triplet;
    this._triplet = null;
    try {
        current_thread = this;
        triplet.continuation.procedure.call(
            triplet.continuation.this_val,
            triplet.ret_val,
            (new Date).valueOf() + Thread.TIME_SLICE
        );
    } catch ( e ) {
        if ( e instanceof ConsumedException ) {
            triplet = e.triplet;
        } else if ( e instanceof NoContinuationException ) {
            this._is_ended = 1;
            this._result   = e.ret_val;
            while ( !this._joined_list.isEmpty() ) {
                var it = this._joined_list.head().value();
                unjoin.call(it);
                it._triplet.ret_val = e.ret_val;
                standBy.call(it);
            }
            this._joined_list = null;
            return;
        } else if ( e instanceof NoExceptionHandlerException ) {
            e = e.thrown;
            var joined_list   = this._joined_list;
            this._joined_list = null;
            this._is_ended    = -1;
            this._result      = e;
            if ( !joined_list.isEmpty() ) {
                while ( !joined_list.isEmpty() ) {
                    joined_list.head().value().notify(e);  // "notify" implies "unjoin".
                }
            } else if ( !(e instanceof KillException) ) {
                throw e;
            }
            return;
        } else {
            triplet.continuation = triplet.continuation.exception;
            triplet.ret_val      = e;
        }
    } finally {
        current_thread = null;
    }
    this._triplet = triplet;
    if ( triplet.timeout < 0 ) { /* Do nothing. */                   }
    else                       { standBy.call(this, triplet.timeout); }
}


proto.notify = function ( e ) {
    if ( current_thread === this ) throw e;
    if ( this._is_ended ) throw new NotAliveError();
    cancel.call(this);
    unjoin.call(this);
    this._triplet.continuation = this._triplet.continuation.exception;
    this._triplet.ret_val = e;
    standBy.call(this);
    return e;
};

proto.kill = function ( s ) {
    return this.notify( arguments.length ? new KillException(s) : new KillException() );
};

proto.join = function ( ) {
    throw new Error("can't `join' in non-compiled functions");
};

proto.join.$Concurrent_Thread_compiled = function ( this_val, args, cont ) {
    //!TODO: check cyclic-join
    if ( this_val._is_ended > 0 ) {  // this thread has already ended normally
        return { continuation:cont, ret_val:this_val._result, timeout:undefined };
    } else if ( this_val._is_ended < 0 ) {  // this thread has already ended by exception
        throw this_val._result;
    } else {
        this_val._joined_list.add(current_thread);
        current_thread._join_thread = this_val;
        return { continuation:cont, timeout:-1 };
    }
};



Thread.create = function ( /* variable args */ ) {
    var f = arguments[0];
    if ( typeof f != "function" ) throw new TypeError("can't create new thread from non-function value");
    return this.compile(f).async(null, Array.prototype.slice.call(arguments, 1, arguments.length));
};


Thread.self = function ( ) {
    return current_thread;
};


Thread.sleep = function ( ) {
    throw new Error("can't `sleep' in non-compiled functions");
};

Thread.sleep.$Concurrent_Thread_compiled = function ( this_val, args, cont ) {
    return { continuation: cont,
             ret_val     : undefined,
             timeout     : args[0] > 0 ? args[0] : 0 };
};


Thread.stop = function ( ) {
    throw new Error("can't `stop' in non-compiled functions");
};

Thread.stop.$Concurrent_Thread_compiled = function ( this_val, args, cont ) {
    return { continuation: cont,
             ret_val     : undefined,
             timeout     : -1        };
};


Thread.yield = function ( ) {
    throw new Error("can't `yield' in non-compiled functions");
};

Thread.yield.$Concurrent_Thread_compiled = function ( this_val, args, cont ) {
    return { continuation: cont,
             ret_val     : undefined,
             timeout     : 0         };
};


var KillException = Thread.KillException = newExceptionClass("Concurrent.Thread.KillException");
KillException.prototype.message = "thread killed";

var NotAliveError = Thread.NotAliveError = newErrorClass("Concurrent.Thread.NotAliveError");
NotAliveError.prototype.message = "thread not alive";



// Extends Function object.
var proto = Function.prototype;

proto.apply.$Concurrent_Thread_compiled = function ( this_val, args, cont ) {
    if ( typeof this_val.$Concurrent_Thread_compiled == "function" ) {
        return this_val.$Concurrent_Thread_compiled(args[0], args[1], cont);
    } else {
        return { continuation: cont,
                 ret_val     : this_val.apply(args[0], args[1]) };
    }
};

proto.call.$Concurrent_Thread_compiled = function ( this_val, args, cont ) {
    if ( typeof this_val.$Concurrent_Thread_compiled == "function" ) {
        return this_val.$Concurrent_Thread_compiled(args[0], Array.prototype.slice.call(args, 1, args.length), cont);
    } else {
        return { continuation: cont,
                 ret_val     : this_val.apply(args[0], Array.prototype.slice.call(args, 1, args.length)) };
    }
};

proto.async = function ( this_val, args ) {
    if ( typeof this.$Concurrent_Thread_compiled != "function" ) throw new Error("this is not a compiled function");
    if ( args === void 0 ) args = [];  // IE6 does not allow null or undefined-value as the second argument of Function.prototype.apply. That does not conform to ECMA262-3!
    var func = this.$Concurrent_Thread_compiled;
    return new THREAD({
        continuation: {
            procedure: function( ret_val, timelimit ){
                return func(this_val, args, initial_continuation, ConsumedException, timelimit);
            },
            this_val: null,
            exception: {procedure:initial_exception_handler, this_val:null}
        },
        ret_val: void 0,
        timeout: void 0
    });
};

