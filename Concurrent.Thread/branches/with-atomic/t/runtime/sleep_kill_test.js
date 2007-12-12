//@esmodpp
//@require Concurrent.Thread
//@with-namespace Concurrent

//@require StdIO
//@with-namespace StdIO


/*
    function f ( out, str, interval ) {
        var i = 0;
        while ( 1 ) {
            out.writeln(++i, ": ", str);
            Thread.sleep(interval);
        }
    }
    
    function f ( out, str, interval ) {
        var i;
        var $Concurrent_Thread_stack0, $Concurrent_Thread_stack1, $Concurrent_Thread_stack2;
        label0:
            i = 0;
            goto label1;
        label1:
            if ( !(1) ) goto label2;
            $Concurrent_Thread_stack0 = ++i;
            call[label3]{ out.writeln($Concurrent_Thread_stack0, ": ", str) };
        label3:
            $Concurrent_Thread_intermediate;
            call[label4]{ Thread.sleep(interval) };
        label4:
            $Concurrent_Thread_intermediate;
            goto label1;
        label2:
            return undefined;
    }
 */

var f = (function(){
    var $Concurrent_Thread_self = Concurrent.Thread.$Concurrent_Thread_makeBase();
    
    $Concurrent_Thread_self.$Concurrent_Thread_compiled = function (
        $Concurrent_Thread_this,
        $Concurrent_Thread_arguments,
        $Concurrent_Thread_continuation
    ) {
        return function ( out, str, interval ) {
            var i;
            var $Concurrent_Thread_stack0, $Concurrent_Thread_stack1, $Concurrent_Thread_stack2;
            $Concurrent_Thread_arguments = arguments;
            $Concurrent_Thread_arguments.callee = $Concurrent_Thread_self;
            var $Concurrent_Thread_label0 = {
                procedure: function ( $Concurrent_Thread_intermediate ) {
                    arguments = $Concurrent_Thread_arguments;
                    i = 0;
                    return {
                        continuation: $Concurrent_Thread_label1,
                        timeout     : undefined,
                        ret_val     : undefined
                    };
                },
                this_val : this,
                exception: $Concurrent_Thread_continuation.exception
            };
            var $Concurrent_Thread_label1 = {
                procedure: function ( $Concurrent_Thread_intermediate ) {
                    arguments = $Concurrent_Thread_arguments;
                    if ( !(1) ) return {continuation:$Concurrent_Thread_label2, ret_val:undefined, timeout:undefined};
                    $Concurrent_Thread_stack0 = ++i;
                    if ( typeof out.writeln.$Concurrent_Thread_compiled == "function" ) {
                        return out.writeln.$Concurrent_Thread_compiled(out, [$Concurrent_Thread_stack_0, ": ", str], $Concurrent_Thread_label3);
                    } else {
                        return {
                            continuation: $Concurrent_Thread_label3,
                            timeout     : undefined,
                            ret_val     : out.writeln($Concurrent_Thread_stack0, ": ", str)
                        };
                    }
                },
                this_val : this,
                exception: $Concurrent_Thread_continuation.exception
            };
            var $Concurrent_Thread_label3 = {
                procedure: function ( $Concurrent_Thread_intermediate ) {
                    arguments = $Concurrent_Thread_arguments;
                    $Concurrent_Thread_intermediate;
                    if ( typeof Thread.sleep.$Concurrent_Thread_compiled == "function" ) {
                        return Thread.sleep.$Concurrent_Thread_compiled(Thread, [interval], $Concurrent_Thread_label4);
                    } else {
                        return {
                            continuation: $Concurrent_Thread_label4,
                            timeout     : undefined,
                            ret_val     : Thread.sleep(interval)
                        };
                    }
                },
                this_val : this,
                exception: $Concurrent_Thread_continuation.exception
            };
            var $Concurrent_Thread_label4 = {
                procedure: function ( $Concurrent_Thread_intermediate ) {
                    arguments = $Concurrent_Thread_arguments;
                    $Concurrent_Thread_intermediate;
                    return {
                        continuation: $Concurrent_Thread_label1,
                        timeout     : undefined,
                        ret_val     : undefined
                    };
                },
                this_val : this,
                exception: $Concurrent_Thread_continuation.exception
            };
            var $Concurrent_Thread_label2 = {
                procedure: function ( $Concurrent_Thread_intermediate ) {
                    arguments = $Concurrent_Thread_arguments;
                    return {
                        continuation: $Concurrent_Thread_continuation,
                        timeout     : undefined,
                        ret_val     : undefined
                    };
                },
                this_val : this,
                exception: $Concurrent_Thread_continuation.exception
            };
            return {
                continuation: $Concurrent_Thread_label0,
                timeout     : undefined,
                ret_val     : undefined
            };
        }.apply($Concurrent_Thread_this, $Concurrent_Thread_arguments);
    };

    var f = $Concurrent_Thread_self;

    return $Concurrent_Thread_self;
}).call(null);


var t1 = f.async(null, [Out, "thread-A", 1000]);
var t2 = f.async(null, [Err, "thread-B", 2000]);

var button = document.createElement("INPUT");
button.type  = "button";
button.value = "STOP";
button.onclick = function ( ) {
    t1.kill();
    t2.kill();
};
setTimeout(function(){
    if ( document.body ) {
        document.body.appendChild(button);
    } else {
        setTimeout(arguments.callee, 500);
    }
}, 0);

