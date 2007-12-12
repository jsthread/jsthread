//@esmodpp
//@require Benchmark
//@with-namespace Benchmark


function linear ( n ) {
    var x=1, y=1, z;
    while ( n >= 2 ) {
        z = x + y;
        x = y;
        y = z;
        --n;
    }
    return y;
}

function recursion ( n ) {
    if ( n <= 1 ) return 1;
    else          return recursion(n-1) + recursion(n-2);
}


cmpthese(-1, {
    linear   : function ( ) { linear(10); },
    recursion: function ( ) { recursion(10); }
});

