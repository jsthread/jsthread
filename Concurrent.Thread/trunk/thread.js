//@esmodpp

//@namespace concurrent.thread

//@require data.LinkedList
//@with-namespace data

//@require data.error
//@with-namespace data.error



//@export Continuation
function Continuation ( p, t, a ) {
    this._procedure  = p;
    this._this_value = t;
    this._arguments  = a;
}

var proto = Continuation.prototype;

proto.call = function ( r ) {
    return this._procedure(this._this_value, this._arguments, r);
};

+function(){
    var name = "[object " + NAMESPACE + ".Continuation]"
    proto.toString = function ( ) {
        return name;
    };
}();



//@export ThreadedFunction
function ThreadedFunction ( f ) {
    this._func = f;
}

var proto = ThreadedFunction.prototype;

proto.start = function ( /* valargs */ ) {
    var func = this._func;
    var args = arguments;
    return new THREAD(function(r){
        return func(null, args, null);
    });
};

+function(){
    var name = "[object " + NAMESPACE + ".ThreadedFunction]"
    proto.toString = function ( ) {
        return name;
    };
}();



//@export Thread
function Thread ( ) {
    throw new Error("Thread cannot be instantiated directly via the constructor.");
}

//@export THREAD
function THREAD ( c ) {
    this._continuation = c;
    this._ret_val      = undefined;
    this._is_ended     = 0;  // 0:running, -1:throw, 1:return
    this._join_thread  = null;
    this._joined_list  = new LinkedList();
    this._timerID      = standBy.call(this, 0);
}

var proto = THREAD.prototype = Thread.prototype;

+function(){
    var name = "[object " + NAMESPACE + ".Thread]"
    proto.toString = function ( ) {
        return name;
    };
}();


var current_thread = null;  // Retains the current thread.


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
        this._join_thread._joined_list.remove(this);
        this._join_thread = null;
    }
}

//@shared TIME_SLICE
TIME_SLICE = 20;

function doNext ( ) {
    this.timerID = undefined;
    try {
        var tupple;
        try {
            current_thread = this;
            var limit = (new Date()).valueOf() + TIME_SLICE;
            do {
                tupple = this._continuation.call(this._ret_val);
                this._continuation = tupple.continuation;
                this._ret_val      = tupple.ret_val;
            } while ( tupple.continuation  &&  tupple.timeout == undefined  &&  (new Date()).valueOf() < limit );
        }
        finally {
            current_thread = null;
        }
        if ( tupple.continuation ) {
            if ( tupple.timeout < 0 ) { /* Do nothing. */                   }
            else                      { standBy.call(this, tupple.timeout); }
        }
        else {
            this._is_ended     = 1;
            this._continuation = null;
            this._joined_list.forEach(function(it){
                unjoin.call(it);
                it._ret_val = tupple.ret_val;
                standBy.call(it);
            });
        }
    }
    catch ( e ) {
        if ( e  &&  typeof e == "object" ) e.thread = this;
        this.notify(e);
    }
}

proto.notify = function ( e ) {
    if ( current_thread == this ) throw e;
    cancel.call(this);
    unjoin.call(this);
    this._ret_val = e;
    if ( this._continuation.exception ) {
        this._continuation = this._continuation.exception;
        standBy.call(this, 0);
    }
    else {
        this._is_ended = -1;
        if ( !this._joined_list.isEmpty() ) {
            this._joined_list.forEach(function(it){
                it.notify(e);
            });
        }
        else {
            if ( !(e instanceof KillException) ) {
                var self = this;
                setTimeout(function(){
                    if      ( typeof self.onError   == "function" ) self.onError(e);
                    else if ( typeof Thread.onError == "function" ) Thread.onError(e);
                    else                                            throw e;
                }, 0);
            }
        }
    }
    return e;
};

proto.kill = function ( e ) {
    return this.notify(new KillException());
};

proto.join = new ThreadedFunction(
    function($this_val, $arguments, $continuation){
        this._joined_list.push(current_thread);
        current_thread._join_thread = this;
        return { continuation:$continuation, timeout:-1 };
    }
);



Thread.self = function ( ) {
    return current_thread;
};

Thread.sleep = new ThreadedFunction(
    function($this_val, $arguments, $continuation){
        var t = $arguments[0];
        if ( !(t > 0) ) t = 0;
        return { continuation:$continuation, timeout:t };
    }
);

Thread.stop = new ThreadedFunction(
    function($this_val, $arguments, $continuation){
        return { continuation:$continuation, timeout:-1 };
    }
);

Thread.yield = new ThreadedFunction(
    function($this_val, $arguments, $continuation){
        return { continuation:$continuation, timeout:0 };
    }
);



var KillException = newExceptionClass("thread killed");
