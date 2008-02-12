//@esmodpp
//@require        Test.Simple
//@with-namespace Test.Simple

//@require Object.Spawn


test(7, function(){
    
    var parent = {hoge:"foo"};
    var child  = Object.spawn(parent);
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

