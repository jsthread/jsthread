//@esmodpp
//@namespace test.simple
//@version   0.0.0

//@require data.error
//@with-namespace data.error


//@shared PRINT_FUNC
PRINT_LINE = function ( s ) { document.writeln(s + "<br>"); };


var n_of_test = undefined;
var i_of_test = undefined;

//@export test
function test ( n, t ) {
    if ( isNaN(n)               ) throw new TypeError("Number of tests must be a postive integer.  You gave it '" + n + "'.");
    if ( n == 0                 ) throw new RangeError("You said to run 0 tests!  You've got to run something.");
    if ( n <  0                 ) throw new RangeError("Number of tests must be a postive integer.  You gave it '" + n + "'.");
    if ( n != Math.floor(n)     ) throw new TypeError("Number of tests must be a postive integer.  You gave it '" + n + "'.");
    if ( typeof t != "function" ) throw new TypeError("Test case must be of type Function.");
    var old_n = n_of_test;
    var old_i = i_of_test;
    n_of_test = Number(n);
    i_of_test = 0;
    PRINT_LINE("1.." + n);
    try {
        t();
    }
    finally {
        if ( i_of_test == 0 )        PRINT_LINE("# No tests run!");
        if ( i_of_test < n_of_test ) PRINT_LINE("# Looks like you planned " + n_of_test + " tests but only ran " + i_of_test + ".");
        if ( i_of_test > n_of_test ) PRINT_LINE("# Looks like you planned " + n_of_test + " tests but ran " + (i_of_test-n_of_test) + " extra.");
        n_of_test = old_n;
        i_of_test = old_i;
    }
}


//@export ok
function ok ( e, m ) {
    if ( n_of_test == undefined ) throw UninitializedError("Test environment has not been initialized.");
    var str = "";
    if ( e ) str += "ok";
    else     str += "not ok";
    str += " " + ++i_of_test;
    if ( arguments.length >= 2 ) str += " - " + m;
    PRINT_LINE(str);
}


//@export UninitializedError
var UninitializedError = newErrorClass(NAMESPACE + ".UninitializedError");
