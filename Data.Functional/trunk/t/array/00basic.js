//@esmodpp
//@require        Test.Simple
//@with-namespace Test.Simple

//@require Data.Functional.Array


test(36, function(){

    var a = [];
    for ( var i=0;  i < 5;  i++ ) a[i] = Math.random();
    
    var c = a.copy();
    ok( c !== a                  , "copy" );
    ok( c.length === a.length    , "  length" );
    ok( c[0] === a[0]            , "  0" );
    ok( c[1] === a[1]            , "  1" );
    ok( c[2] === a[2]            , "  2" );
    ok( c[3] === a[3]            , "  3" );
    ok( c[4] === a[4]            , "  4" );
    
    
    var d = [];
    var r = c.forEach(function(it){
        return d.push(it);
    });
    ok( d.length === 5           , "forEach");
    ok( d[0] === a[0]            , "  0" );
    ok( d[1] === a[1]            , "  1" );
    ok( d[2] === a[2]            , "  2" );
    ok( d[3] === a[3]            , "  3" );
    ok( d[4] === a[4]            , "  4" );
    
    
    var sum = a[0] + a[1] + a[2] + a[3] + a[4];
    ok( sum === c.foldl1(function(x, y){return x+y;}),  "foldl" );
    
    var dif = a[0] - (a[1] - (a[2] - (a[3] - a[4])));
    ok( dif === c.foldr1(function(x, y){return x-y;}),  "foldr -- reverse-iterator" );
    
    
    var l = a.iterator(1);
    ok( l.value() === a[1]       , "iterator(1)" );
    var r = a.iterator(-1);
    ok( r.value() === a[4]       , "iterator(-1)" );
    
    var s1 = a.slice(1, -1);
    var s2 = a.slice(l, r);
    ok( s1.length === s2.length  , "slice" );
    ok( s1[0] === s2[0]          , "  0" );
    ok( s1[1] === s2[1]          , "  1" );
    ok( s1[2] === s2[2]          , "  2" );
    ok( s1[3] === s2[3]          , "  3" );
    
    
    var it = c.iterator(-1);
    ok( a.removeAt(-1) === it.remove()  , "remove" );
    ok( a.length === c.length           , "" );
    ok( a[0] === c[0]                   , "  0" );
    ok( a[1] === c[1]                   , "  1" );
    ok( a[2] === c[2]                   , "  2" );
    ok( a[3] === c[3]                   , "  3" );
    
    
    var it = c.iterator(2);
    ok( a.insertAt(2, 1111) === it.insert(1111)  , "insert" );
    ok( a[2] === 1111 );
    ok( c[2] === 1111 );
    ok( a[0] === c[0] );
    ok( a[1] === c[1] );
    ok( a[2] === c[2] );
    ok( a[3] === c[3] );
    ok( a[4] === c[4] );

});
