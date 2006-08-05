/**
 * This file is based on the file Kit.java in Rhino 1.6R2.
 */



//@esmodpp
//@version 0.0.0

//@namespace Concurrent.Thread.Compiler.Kit
//@require   Data.Error.IllegalStateError



//@export printTrees
var printTrees = false;  // debug flag


//@export codeBug
function codeBug ( /* variable arguments */ ) {
    var str = "";
    for ( var i=0;  i < arguments.length;  i++ ) str += arguments[i];
    var e = new Data.Error.IllegalStateError("FAILED ASSERTION: " + str);
    var s = e.toString();
    if ( e.stack ) s += "\n----------\n" + e.stack;
    alert(s);
    throw e;
}

