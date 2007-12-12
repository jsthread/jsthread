//@esmodpp
//@require        Test.Simple
//@with-namespace Test.Simple

//@require Oop.Spawn


test(7, function(){
    
    var parent = {hoge:"foo"};
    var child  = parent.spawn();
    ok( parent.isPrototypeOf(child) );
    
    ok( child.hoge === "foo" );
    ok( !child.hasOwnProperty("hoge") );

    parent.hoge = "bar";
    ok( child.hoge === "bar" );
    
    child.hoge = "baz";
    ok( child.hasOwnProperty("hoge") );
    ok( parent.hoge === "bar" );
    ok( child.hoge  === "baz" );

});

