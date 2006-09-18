//@esmodpp
//@version 0.1.0
//@namespace Concurrent

//@require Data.LinkedList
//@require Data.Error
//@with-namespace Data.Error



var current_thread = null;  // Retains the current thread.

function NoExceptionHandlerException ( e ) {
    this.content = e;
}

function initial_exception_handler ( e ) {
    throw new NoExceptionHandlerException(e);
}



//@export Thread
function Thread ( ) {
    throw new Error("Thread cannot be instantiated directly.");
}

function THREAD ( t ) {
    this._tupple       = t;
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
        Number(t) || 0
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
    var tupple = this._tupple;
    this._tupple = null;
    try {
        current_thread = this;
        var limit = (new Date).valueOf() + Thread.TIME_SLICE;
        do {
            try {
                tupple = tupple.continuation.procedure.$Concurrent_Thread_call(
                             tupple.continuation.this_val, tupple.ret_val
                         );
            } catch ( e ) {
                if ( e instanceof NoExceptionHandlerException ) {
                    var joined_list   = this._joined_list;
                    this._joined_list = null;
                    this._is_ended    = -1;
                    this._result      = e.content;
                    if ( !joined_list.isEmpty() ) {
                        while ( !joined_list.isEmpty() ) {
                            var it = joined_list.head().value();
                            it.notify(e);
                        }
                    } else if ( !(e instanceof KillException) ) {
                        throw e;
                    }
                } else {
                    tupple.continuation = tupple.continuation.exception;
                    tupple.ret_val      = e;
                }
            }
        } while ( tupple
               && tupple.continuation
               && tupple.timeout === undefined
               && (new Date).valueOf() < limit );
    } finally {
        current_thread = null;
    }
    if ( tupple && tupple.continuation ) {
        this._tupple = tupple;
        if ( tupple.timeout < 0 ) { /* Do nothing. */                   }
        else                      { standBy.call(this, tupple.timeout); }
    } else {
        this._is_ended = 1;
        this._result   = tupple.ret_val;
        while ( !this._joined_list.isEmpty() ) {
            var it = this._joined_list.head().value();
            unjoin.call(it);
            it._tupple.ret_val = tupple.ret_val;
            standBy.call(it);
        }
        this._joined_list = null;
    }
}


proto.notify = function ( e ) {
    if ( current_thread === this ) throw e;
    cancel.call(this);
    unjoin.call(this);
    this._tupple.continuation = this._tupple.continuation.exception;
    this._tupple.ret_val = e;
    return e;
};

proto.kill = function ( e ) {
    return this.notify(new KillException());
};

proto.join = function ( ) {
    throw new Error("can't `join' in any non-threaded functions");
};

proto.join.$Concurrent_Thread_compiled = function ( this_val, args, cont ) {
    if ( current_thread === null ) throw new Error("can't `join' when a non-threaded function is in call-stack");
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



Thread.self = function ( ) {
    return current_thread;
};


Thread.sleep = function ( ) {
    throw new Error("can't `sleep' in any non-threaded functions");
};

Thread.sleep.$Concurrent_Thread_compiled = function ( this_val, args, cont ) {
    if ( current_thread === null ) throw new Error("can't `sleep' when a non-threaded function is in call-stack");
    return { continuation: cont,
             ret_val     : undefined,
             timeout     : args[0] > 0 ? args[0] : 0 };
};


Thread.stop = function ( ) {
    throw new Error("can't `stop' in any non-threaded functions");
};

Thread.stop.$Concurrent_Thread_compiled = function ( this_val, args, cont ) {
    if ( current_thread === null ) throw new Error("can't `stop' when a non-threaded function is in call-stack");
    return { continuation: cont,
             ret_val     : undefined,
             timeout     : -1        };
};


Thread.stop = function ( ) {
    throw new Error("can't `yield' in any non-threaded functions");
};

Thread.stop.$Concurrent_Thread_compiled = function ( this_val, args, cont ) {
    if ( current_thread === null ) throw new Error("can't `yield' when a non-threaded function is in call-stack");
    return { continuation: cont,
             ret_val     : undefined,
             timeout     : 0         };
};


var KillException = Thread.KillException = newExceptionClass("thread killed");



function exec_until_end ( tupple ) {
    while ( tupple && tupple.continuation ) {
        try {
            tupple = tupple.continuation.procedure.$Concurrent_Thread_call(
                         tupple.continuation.this_val,
                         tupple.ret_val
                     );
        } catch ( e ) {
            if ( e instanceof NoExceptionHandlerException ) {
                throw e.content;
            } else {
                tupple.continuation = tupple.continuation.exception;
                tupple.ret_val      = e;
            }
        }
    }
    return tupple ? tupple.ret_val : undefined;
}


Thread.$Concurrent_Thread_makeBase = function ( ) {
    return function ( ) {  // call as usual function
        var save = current_thread;
        try {
            return exec_until_end(
                       arguments.callee.$Concurrent_Thread_compiled(
                           this,
                           arguments,
                           {procedure:initial_exception_handler}
                       )
                   );
        } finally {
            current_thread = save;
        }
    };
};



// Extends Function object.
var proto = Function.prototype;

proto.$Concurrent_Thread_apply = proto.apply;

proto.$Concurrent_Thread_call = proto.call;

proto.apply = function ( ) {
    if ( typeof this.$Concurrent_Thread_compiled == "function" ) {
        var save = current_thread;
        try {
            return exec_until_end(
                       this.$Concurrent_Thread_compiled(
                           arguments[0],
                           arguments[1],
                           {procedure:initial_exception_handler}
                       )
                   );
        } finally {
            current_thread = save;
        }
    } else {
        return this.$Concurrent_Thread_apply(arguments[0], arguments[1]);
    }
};

proto.apply.$Concurrent_Thread_compiled = function ( this_val, args, cont ) {
    if ( typeof this_val.$Concurrent_Thread_compiled == "function" ) {
        return this_val.$Concurrent_Thread_compiled(args[0], args[1], cont);
    } else {
        return { continuation: cont,
                 ret_val     : this_val.$Concurrent_Thread_apply(args[0], args[1]) };
    }
};


proto.call = function ( ) {
    var args = [];
    for ( var i=1;  i < arguments.length;  i++ ) args[i-1] = arguments[i]; 
    if ( typeof this.$Concurrent_Thread_compiled == "function" ) {
        var save = current_thread;
        try {
            return exec_until_end(
                       this.$Concurrent_Thread_compiled(
                           arguments[0],
                           args,
                           {procedure:initial_exception_handler}
                       )
                   );
        } finally {
            current_thread = save;
        }
    } else {
        return this.$Concurrent_Thread_apply(arguments[0], args);
    }
};

proto.call.$Concurrent_Thread_compiled = function ( this_val, args, cont ) {
    var t = args[0];
    var a = [];
    for ( var i=1;  i < args.length;  i++ ) a[i-1] = args[i];
    if ( typeof this_val.$Concurrent_Thread_compiled == "function" ) {
        return this_val.$Concurrent_Thread_compiled(t, a, cont);
    } else {
        return { continuation: cont,
                 ret_val     : this_val.$Concurrent_Thread_apply(t, a) };
    }
};


proto.start = function ( this_val, args ) {
    if ( typeof this.$Concurrent_Thread_compiled != "function" ) throw new Error("this is not compiled function");
    return new THREAD(
        this.$Concurrent_Thread_compiled(this_val, args, {procedure:initial_exception_handler})
    );
};

