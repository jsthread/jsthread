//@jsmodpp
//@namespace benchmark

//@shared WARNING  WARN_METHOD  SHOW_METHOD
WARNING     = true;
WARN_METHOD = alert;
SHOW_METHOD = undefined;

function WARN ( /* variable-arguments */ ) {
    if ( WARNING ) {
        var str = "";
        for ( var i=0;  i < arguments.length;  i++ ) str += arguments[i];
        WARN_METHOD(str);
    }
}

function show ( /* variable-arguments */ ) {
    var str = "";
    for ( var i=0;  i < arguments.length;  i++ ) str += arguments[i];
    if ( typeof SHOW_METHOD == "function" ) {
        SHOW_METHOD(str);
    }
    else {
        str = s.replace(/$/mg, "<br>");
        document.write(str);
    }
}


function compile ( code ) {
    if ( typeof code == "function" ) return code;
    return new Function(code);
}


function Benchmark ( time, iters ) {
    this.time  = time;
    this.iters = iters;
}

Benchmark.prototype.valueOf = function ( ) {
    return this.time / this.iters;
}

Benchmark.prototype.toString = function ( ) {
    return "" + this.valueOf();
}



///@export time
function time ( f ) {
    f = compile(f);
    var t = (new Date).valueOf();
    f();
    return (new Date).valueOf() - t;
}


//@export timeit
function timeit ( c, f ) {
    f = compile(f);
    var t0 = count(function(){
        for ( var i=0;  i < c;  i++ ) nullFunction();
    });
    var t1 = count(function(){
        for ( var i=0;  i < c;  i++ ) f();
    });
    if ( t1 < 100 ) WARN("Too few iterations!");
    return new Benchmark(t1-t0, c);
}

function nullFunction ( ) { }


//@export timethese
function timethese ( c, set, style, format ) {
    if ( !(set instanceof Object) ) return;
    
    var result = {};
    for ( var i in set ) {
        result[i] = timeit(c, set[i])
    }
    return result;
}

