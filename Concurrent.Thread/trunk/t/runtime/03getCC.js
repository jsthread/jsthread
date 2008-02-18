//@esmodpp
//@require Concurrent.Thread.Ports.Test.Simple
//@namespace Test.Simple

//@require        Concurrent.Thread.Continuation
//@with-namespace Concurrent.Thread.Continuation
//@require        Concurrent.Thread.Compiler
//@with-namespace Concurrent



test({
    name     : "getCC",
    tests    : 2,
    test_case: eval(Thread.prepare(function(){
        
        
        var done = false;
        
        var r = getCC();
        if ( done ) {
            ok( r === "continuation call" );
        } else {
            ok( typeof r === "function" );
            done = true;
            r("continuation call")
        }
        
        
    }))
});
