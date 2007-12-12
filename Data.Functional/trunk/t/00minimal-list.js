//@esmodpp
//@require        Test.Simple
//@with-namespace Test.Simple

//@require Data.Functional.MinimalList
//@with-namespace Data.Functional


test(33, function(){

    var a = [];
    for ( var i=0;  i < 5;  i++ ) a.push(Math.random());

    var ml = new MinimalList();
    ok( ml.addAll(a) );
    ok( ml.size() === a.length        , "  length" );
    ok( ml.get(0) === a[0]            , "  0" );
    ok( ml.get(1) === a[1]            , "  1" );
    ok( ml.get(2) === a[2]            , "  2" );
    ok( ml.get(3) === a[3]            , "  3" );
    ok( ml.get(4) === a[4]            , "  4" );
    
    
    var d = new MinimalList();
    var r = ml.forEach(function(it){
        d.push(it);
    });
    ok( d.size() === 5           , "forEach");
    ok( d.get(0) === ml.get(0)   , "  0: " + d.get(0) + " == " + ml.get(0) );
    ok( d.get(1) === ml.get(1)   , "  1: " + d.get(1) + " == " + ml.get(1) );
    ok( d.get(2) === ml.get(2)   , "  2: " + d.get(2) + " == " + ml.get(2) );
    ok( d.get(3) === ml.get(3)   , "  3: " + d.get(3) + " == " + ml.get(3) );
    ok( d.get(4) === ml.get(4)   , "  4: " + d.get(4) + " == " + ml.get(4) );
    
    
    var sum = d.get(0) + d.get(1) + d.get(2) + d.get(3) + d.get(4);
    ok( sum === ml.foldl1(function(x, y){return x+y;}),  "foldl" );
    
    
    var l = ml.iterator(1);
    ok( l.value() === ml.get(1)       , "iterator(1)" );
    var r = ml.iterator(-1);
    ok( r.value() === ml.get(4)       , "iterator(-1)" );
    
    var s1 = ml.slice(1, -1);
    var s2 = ml.slice(l, r);
    ok( s1.size() === s2.size()  , "slice" );
    ok( s1.get(0) === s2.get(0)          , "  0" );
    ok( s1.get(1) === s2.get(1)          , "  1" );
    ok( s1.get(2) === s2.get(2)          , "  2" );
    ok( s1.get(3) === s2.get(3)          , "  3" );
    
    
    ok( ml.removeAt(-1) === a[4]  , "remove" );
    ok( ml.size() === 4           , "" );
    ok( ml.get(0) === a[0]                   , "  0" );
    ok( ml.get(1) === a[1]                   , "  1" );
    ok( ml.get(2) === a[2]                   , "  2" );
    ok( ml.get(3) === a[3]                   , "  3" );
    
    
    ok( ml.insertAt(2, 1111) === 1111  , "insert" );
    ok( ml.get(0) === a[0] );
    ok( ml.get(1) === a[1] );
    ok( ml.get(2) === 1111 );
    ok( ml.get(3) === a[2] );
    ok( ml.get(4) === a[3] );

});
