//@esmodpp
//@require Test.Simple
//@with-namespace Test.Simple

//@require Data.Functional.MinimalList
//@with-namespace Data.Functional


test(16, function(){
    
    var list = new MinimalList(1, 2, 3, 4, 5);
    
    var l = list.head();
    var r = list.tail();
    ok( l.distance(r) === -5   , "  -5" );
    l = l.next();
    ok( l.distance(r) === -4   , "  -4" );
    r = r.previous();
    ok( l.distance(r) === -3   , "  -3" );
    l = l.next();
    ok( l.distance(r) === -2   , "  -2" );
    r = r.previous();
    ok( l.distance(r) === -1   , "  -1" );
    l = l.next();
    ok( l.distance(r) ===  0   , "   0" );
    r = r.previous();
    ok( l.distance(r) ===  1   , "   1" );
    l = l.next();
    ok( l.distance(r) ===  2   , "   2" );
    
    var l = list.reverseHead();
    var r = list.reverseTail();
    ok( l.distance(r) === -5   , "r -5" );
    l = l.next();
    ok( l.distance(r) === -4   , "r -4" );
    r = r.previous();
    ok( l.distance(r) === -3   , "r -3" );
    l = l.next();
    ok( l.distance(r) === -2   , "r -2" );
    r = r.previous();
    ok( l.distance(r) === -1   , "r -1" );
    l = l.next();
    ok( l.distance(r) ===  0   , "r  0" );
    r = r.previous();
    ok( l.distance(r) ===  1   , "r  1" );
    l = l.next();
    ok( l.distance(r) ===  2   , "r  2" );
    
});
