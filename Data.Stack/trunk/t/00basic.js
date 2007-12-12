//@esmodpp
//@require        Test.Simple
//@with-namespace Test.Simple

//@require        Data.Stack
//@with-namespace Data


test(12, function(){

    var s = new Stack();
    ok( s  &&  s instanceof Stack   , "instantiation");
    ok( s.isEmpty()                 , "check empty");
    ok( s.peek() === undefined      , "peek empty");
    
    ok( s.push(1, 2, 3, 4, 5) == 5  , "push");

    ok( s.pop() === 5               , "pop 5");
    ok( s.pop() === 4               , "pop 5");

    ok( s.peek() === 3              , "peek 3");

    ok( s.pop() === 3               , "pop 3");
    ok( s.pop() === 2               , "pop 2");
    ok( s.pop() === 1               , "pop 1");
    ok( s.pop() === undefined       , "pop empty");

    ok( s.isEmpty()                 , "check empty");

});
