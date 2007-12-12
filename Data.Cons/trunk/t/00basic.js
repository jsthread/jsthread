//@esmodpp
//@require   Test.Simple
//@namespace Test.Simple

//@require Data.Cons
//@with-namespace Data.Cons


test(8, function(){
    var c = cons("car", "cdr");
    ok( String(c) === "(car . cdr)" );
    
    ok( c.car === car(c) );
    ok( c.cdr === cdr(c) );
    
    ok( String(nil()) === "nil" );
    ok( nil() !== "nil" );
    ok( c != nil() );
    
    var d = cons("head", c);
    ok( String(d) === "(head . (car . cdr))");
    ok( cdr(d) === c);
});
