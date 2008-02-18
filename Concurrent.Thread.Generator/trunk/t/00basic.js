//@esmodpp
//@require Concurrent.Thread.Ports.Test.Simple
//@with-namespace Test.Simple

//@require Concurrent.Thread.Generator
//@require Concurrent.Thread.Compiler
//@with-namespace Concurrent


test({
    name     : "basic",
    tests    : 23,
    test_case: eval(Thread.prepare(function(){
        
        
        var g = new Thread.Generator(function( gen ){
            for ( var i=0;  i < 3;  i++ ) gen(i);
        });
        
        ok( g.hasNext() );
        ok( g.next() === 0 );
        ok( g.hasNext() );
        ok( g.next() === 1 );
        ok( g.hasNext() );
        ok( g.next() === 2 );
        ok( !g.hasNext() );
        ok( g.next() === undefined );
        
        
        var g = new Thread.Generator(function( gen ){
            var x, y, z;
            gen(x = 1);
            gen(y = 1);
            while ( 1 ) {
                gen(z = x + y);
                x = y;
                y = z;
            }
        });
        
        ok( g.hasNext() );
        ok( g.next() === 1 );
        ok( g.hasNext() );
        ok( g.next() === 1 );
        ok( g.hasNext() );
        ok( g.next() === 2 );
        ok( g.hasNext() );
        ok( g.next() === 3 );
        ok( g.hasNext() );
        ok( g.next() === 5 );
        ok( g.hasNext() );
        ok( g.next() === 8 );
        ok( g.hasNext() );
        ok( g.next() === 13 );
        ok( g.hasNext() );
        
        
    }))
});
