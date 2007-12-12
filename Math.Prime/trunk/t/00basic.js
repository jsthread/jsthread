//@esmodpp
//@require Test.Simple
//@with-namespace Test.Simple

//@require Math.Prime


test(17, function(){
    
    var it = Math.Prime.iterator();
    ok( it.isHead()      ,   "head");
    
    ok( it.value() ===  2,   2);
    it = it.next();
    ok( it.value() ===  3,   3);
    it = it.next();
    ok( it.value() ===  5,   5);
    it = it.next();
    ok( it.value() ===  7,   7);
    it = it.next();
    ok( it.value() === 11,  11);
    it = it.next();
    ok( it.value() === 13,  13);
    it = it.next();
    ok( it.value() === 17,  17);
    it = it.next();
    ok( it.value() === 19,  19);
    it = it.next();
    ok( it.value() === 23,  23);
    it = it.next();
    ok( it.value() === 29,  29);

    ok( !it.isTail()     ,  "not tail");
    ok( !it.isHead()     ,  "not head");

    it = it.find(function(p){ return p >= 1000; });
    ok( it.value() === 1009             , 1009);
    ok( it.previous().value() === 997   , 997);
    
    ok( Math.Prime.get(14) === 47          , "15th is 47");
    ok( Math.Prime.get(999) === 7919       , "1000th is 7919");
    
});
