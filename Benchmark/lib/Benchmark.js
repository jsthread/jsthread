//@esmodpp
//@version 0.1.0
//@namespace Benchmark

//@require Data.Functional.Array
//@require StdIO
//@with-namespace StdIO


function Benchmark ( time, iters )
{
    this.time  = time;
    this.iters = iters;
}

Benchmark.prototype.valueOf = function ( )
{
    return this.time / this.iters / 1000;
};

Benchmark.prototype.toString = function ( )
{
    return this.valueOf() + " wallclock secs";
};


function nullFunction ( ) { }

function compile ( code )
{
    if ( typeof code == "function" ) return code;
    return new Function(code);
}

function time ( f )
{
    f = compile(f);
    var t0 = new Date();
    f();
    var t1 = new Date();
    return t1 - t0;
}


//@export countit
function countit ( t, f )
{
    if ( isNaN( t=Number(t) ) ) throw new TypeError("first argument must be of type Number");

    f = compile(f);
    var i = 0;
    var t0 = new Date();
    var limit = t0.valueOf() + t * 1000;
    do {
        f();
        ++i;
    } while ( (t = new Date()) < limit );
    var time  = t - t0;
    var iters = i;

    f = nullFunction;
    i = 0;
    t0 = new Date();
    limit = t0.valueOf() + t * 1000;  // dummy
    do {
        f();
        ++i;
        t = new Date();
    } while ( i < iters );
    
    return new Benchmark(time-(t-t0), iters);
}


//@export timeit
function timeit ( iters, code )
{
    if ( isNaN(iters) ) {
        throw new TypeError("first argument must be of type Number");
    } else if ( iters <= 0 ) {
        if ( iters == 0 ) iters = 3;
        else              iters = -iters;
        return countit(iters, code);
    } else {
        iters = Math.floor(iters);
        code = compile(code);
        var t0 = time(function(){
            for ( var i=0;  i < iters;  i++ ) nullFunction();
        });
        var t1 = time(function(){
            for ( var i=0;  i < iters;  i++ ) code();
        });
        if ( t1 < 200 ) Err.write("too few iterations for a reliable count");
        return new Benchmark(t1-t0, iters);
    }
}


//@export timethis
function timethis ( iters, code, title )
{
    if ( arguments.length < 3 ) title = "timethis " + iters;
    var r = timeit(iters, code);
    Out.write(title, ": ", r, "\n");
    return r;
}


//@export timethese
function timethese ( iters, hash ) {
    var result = {};
    for ( var i in hash ) {
        if ( hash.hasOwnProperty(i) ) {
            result[i] = timethis(iters, hash[i], i);
        }
    }
    return result;
}


//@export cmpthese
function cmpthese ( iters, hash )
{
    if ( iters instanceof Object ) {
        hash = iters;
    } else {
        var save = PRINT;
        PRINT = nullFunction;  // Shut up `timethese'.
        try {
            hash = timethese(iters, hash);
        } finally {
            PRINT = save;
        }
    }

    var pairs = [];
    for ( var i in hash ) {
        if ( !(hash[i] instanceof Benchmark) ) throw new TypeError("invalid result");
        var rate = hash[i].iters * 1000 / hash[i].time;
        pairs.push( {title:i, rate:rate} );
    }
    pairs.sort(function(x, y){
        return x.rate < y.rate  ?  -1  :
               x.rate > y.rate  ?   1  :  0;
    });

    var row = ["", "RATE"];
    pairs.forEach(function( it ){
        row.push(it.title);
    });
    var table = [row];
    pairs.forEach(function( it ){
        row = [ it.title,  it.rate + "/s" ];
        pairs.forEach(function( that ){
            if ( it == that ) {
                row.push("--");
            } else {
                var p = Math.round( 100 * it.rate / that.rate - 100 );
                if ( isNaN(p) ) p = 0;
                row.push(p + "%");
            }
        });
        table.push(row);
    });

    var span = [];
    for ( var i=0;  i < table[0].length;  i++ ) {
        var max = 0;
        for ( var j=0;  j < table.length;  j++ ) {
            if ( table[j][i].length > max ) max = table[j][i].length;
        }
        span.push(max);
    }
    
    table.forEach(function( row ){
        var buf = [ pad_right(row[0], span[0]) ];
        for ( var i=1;  i < row.length;  i++ ) {
            buf.push( pad_left(row[i], span[i]) );
        }
        Out.write( buf.join("  "), "\n" );
    });
    
    return hash;
}

function pad_left ( s, l ) {
    var buf = [];
    for ( var i=s.length;  i < l;  i++ ) buf.push(" ");
    buf.push(s);
    return buf.join("");
}

function pad_right ( s, l ) {
    var buf = [s];
    for ( var i=s.length;  i < l;  i++ ) buf.push(" ");
    return buf.join("");
}
