//@esmodpp
//@require thread
//@with-namespace concurrent.thread


/*
function repeat ( f ) {
    while ( 1 ) {
        f();
        Thread.sleep(1000);
    }
}

Å´

function repeat ( f ) {
    label0:
        goto label1;
    label1:
        if ( !(1) ) goto label2;
        f();
        Thread.sleep(1000);
        goto label1;
    label2:
        return;
}

Å´

function repeat ( f ) {
    label0:
        goto label1;
    label1:
        if ( !(1) ) goto label2;
        call[label3]{ f() };
    label3:
        $ret_val;
        $stack0 = Thread;
        $stack1 = 1000;
        call[label4]{ $stack0.sleep($stack1) };
    label4:
        $ret_val;
        goto label1;
    label2:
        return;
}

Å´
 */

var repeat = function(){
    var $self = new ThreadedFunction(
        function ( $this_val, $arguments, $continuation ) {
            return function ( f ) {
                $arguments = arguments;
                $arguments.callee = $self;
                var $stack0, $stack1;
//-------------------------------------------------------------------
                var $label0 = new Continuation(function($ret_val){
                    arguments = $arguments;
                    return {continuation:$label1};
                }, this);
                var $label1 = new Continuation(function($ret_val){
                    arguments = $arguments;
                    if ( !(1) ) return {continuation:$label2};
                    return f instanceof ThreadedFunction ? f._func(null, [], $label3)
                                                         : {continuation:$label3, ret_val:f()};
                }, this);
                var $label3 = new Continuation(function($ret_val){
                    arguments = $arguments;
                    $ret_val;
                    $stack0 = Thread;
                    $stack1 = 1000;
                    return $stack0.sleep instanceof ThreadedFunction ? $stack0.sleep._func($stack0, [$stack1], $label4)
                                                                     : {continuation:$label4, ret_val:$stack0.sleep($stack1)};
                }, this);
                var $label4 = new Continuation(function($ret_val){
                    arguments = $arguments;
                    $ret_val;
                    return {continuation:$label1};
                }, this);
                var $label2 = new Continuation(function($ret_val){
                    arguments = $arguments;
                    return {continuation:$continuation, ret_val:undefined};
                }, this);
//-------------------------------------------------------------------
                return {continuation:$label0};
            }.apply($this_val, $arguments);
        }
    );
    return $self;
}();



function println ( str ) {
    document.body.innerHTML += str + "<br>\n";
}


var t1 = repeat.start(function(){
    println("Thread 1.");
});

var t2 = repeat.start(function(){
    println("Thread 2.");
});



//@use-namespace test
//@export killAll
function killAll ( ) {
    t1.kill();
    t2.kill();
}
document.write("<input type='button' value='Stop' onClick='test.killAll();'><hr>");


