//@esmodpp
//@require Test.Simple
//@with-namespace Test.Simple

//@require Data.Functional.Array


test(9, function (){
    
    var a = [1, 2, 3];
    
    ok( a.head(0) );
    ok( a.head(1) );
    ok( a.head(2) );
    ok( a.head(3) );
    ok( a.head(-1) );
    ok( a.head(-2) );
    ok( a.head(-3) );
    
    try {
        a.head(4);
        ok( false );
    } catch ( e ) {
        ok( e instanceof RangeError );
    }
    try {
        a.head(-4);
        ok( false );
    } catch ( e ) {
        ok( e instanceof RangeError );
    }
    
})

