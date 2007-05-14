//@esmodpp
//@require   Test.Simple
//@namespace Test.Simple

//@require Data.Cons.List
//@require Data.Cons.Util
//@with-namespace Data.Cons
//@with-namespace Data.Cons.Util


test(32, function(){
    
    var l = list(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    ok( last(l).car === 10 );
    
    add = adder(l);
    add(11, 12, 13);
    
    ok( l.size() === 13 );
    var i = 1;
    l.forEach(function( it ){
        ok( it === i++ );
    });
    
    concat(l, list(14, 15), list(16));
    
    ok( l.size() === 16 );
    var i = 1;
    l.forEach(function( it ){
        ok( it === i++ );
    });
    
});

