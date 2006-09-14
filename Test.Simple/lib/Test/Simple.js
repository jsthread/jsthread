//@esmodpp
//@namespace Test.Simple
//@version   0.1.0

//@require StdIO
//@require Data.Error
//@with-namespace Data.Error


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
    StdIO.Out.writeln("1.." + n);
    try {
        t();
    } catch ( e ) {
        StdIO.Err.writeln("# Exception thrown: " + e);
        if ( e.stack ) {
            StdIO.Err.writeln("# Stack trace ----- ");
            StdIO.Err.write(e.stack);
            StdIO.Err.writeln("# ----------------- ");
        }
        throw e;
    } finally {
        if ( i_of_test == 0 )        StdIO.Out.writeln("# No tests run!");
        if ( i_of_test < n_of_test ) StdIO.Out.writeln("# Looks like you planned " + n_of_test + " tests but only ran " + i_of_test + ".");
        if ( i_of_test > n_of_test ) StdIO.Out.writeln("# Looks like you planned " + n_of_test + " tests but ran " + (i_of_test-n_of_test) + " extra.");
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
    StdIO.Out.writeln(str);
}


//@export UninitializedError
var UninitializedError = newErrorClass(NAMESPACE + ".UninitializedError");
