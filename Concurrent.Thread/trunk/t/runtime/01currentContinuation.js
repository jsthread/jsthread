//@esmodpp
//@require Concurrent.Thread.Ports.Test.Simple
//@namespace Test.Simple

//@require Concurrent.Thread.Continuation
//@require Concurrent.Thread.Compiler
//@with-namespace Concurrent



test({
    name     : "currentContinuation",
    tests    : 4,
    test_case: eval(Thread.prepare(function(){
        
        
        try {
            var cont = Thread.Continuation.currentContinuation()
            ok( typeof cont === "function" );
            while ( true ) cont("continuation called");  // infinite-loop, but it's executed just once
        } catch ( e ) {
            ok( e instanceof Thread.Continuation.ContinuationCalledException );
            ok( e.args.length === 1 );
            ok( e.args[0] === "continuation called" );
        }
        
        
    }))
});
