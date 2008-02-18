//@esmodpp
//@require Concurrent.Thread.Ports.Test.Simple
//@namespace Test.Simple

//@require        Concurrent.Thread.Continuation
//@with-namespace Concurrent.Thread.Continuation
//@require        Concurrent.Thread.Compiler
//@with-namespace Concurrent



test({
    name     : "callcc",
    tests    : 6,
    test_case: eval(Thread.prepare(function(){
        
        
        var cont = null;
        var i = 0;
        
        var r = callcc(function( k ){
            ok( typeof k === "function" );
            cont = k;
            return 0;
        });
        
        ok( r === i );
        i++;
        if ( i < 5 ) cont(r+1);
        
        
    }))
});
