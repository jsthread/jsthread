//@esmodpp
//@require Test.Simple
//@with-namespace Test.Simple

//@require Oop.Bind


test(4, function(){
    
    var o = {
        prop: "hoge",
        meth: function ( ) { return this.prop; }
    };
    
    ok( o.meth.bind(o)() == "hoge" );
    
    var p = { prop: "fuga" };
    p.meth1 = o.meth;
    p.meth2 = o.meth.bind(o);
    ok( p.meth1() == "fuga" );
    ok( p.meth2() == "hoge" );
    
    o.prop = "piyo";
    ok( p.meth2() == "piyo" );
    
});

