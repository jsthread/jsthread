//@esmodpp
//@require        Test.Simple
//@with-namespace Test.Simple

//@require        Util.Arrayize
//@with-namespace Util.Arrayize


test(13, function(){
    
    (function(){
        var a = arrayize(arguments);
        ok( a instanceof Array  , "arguments => array");
        ok( a.length === 3 );
        ok( a[0] === 1 );
        ok( a[1] === 2 );
        ok( a[2] === 3 );
    })(1, 2, 3);
    
    var a = arrayize();
    ok( a instanceof Array   , "no argument");
    ok( a.length === 0 );
    
    var a = ["hoge", "fuga", "piyo"];
    var b = arrayize(a);
    ok( b instanceof Array   , "array => array");
    ok( b !== a );
    ok( b.length === a.length );
    ok( b[0] === a[0] );
    ok( b[1] === a[1] );
    ok( b[2] === a[2] );
    
});
