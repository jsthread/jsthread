//@esmodpp
//@require Test.Simple
//@with-namespace Test.Simple

//@require Data.StringSet
//@with-namespace Data

//@require Data.Error.IllegalStateError
//@with-namespace Data.Error


test(24, function(){
    
    var ss = new StringSet("foo");
    ok( ss.contains("foo")                              );
    ok( !ss.contains("bar")                             );
    ok( ss.addAll(["bar","baz"], undefined)  , "addAll" );
    ok( ss.contains("bar")                              );
    ok( ss.contains("baz")                              );
    ok( ss.contains("undefined")                        );

    ok( ss.add(["hoge","fuga"])              , "add array" );
    ok( !ss.contains("hoge")                               );
    ok( !ss.contains("fuga")                               );
    ok( ss.contains("hoge,fuga")                           );

    ok( !ss.add("bar")            , "add exiting");
    
    var it = ss.iterator();
    ok( ss.contains(it.value())   , "iterator" );
    ok( !it.isTail()                           );

    var jt = it.next();
    ok( ss.contains(jt.value())   , "next" );
    ok( it.value() != jt.value()   );
    
    ok( ss.remove("foo")          , "remove" );
    ok( !ss.contains("foo")        );
    ok( !ss.remove("foo")         , "remove again" );
    
    try {
        jt = it.next();
        ok( false                           , "illegal state" );
    } catch ( e ) {
        ok ( e instanceof IllegalStateError , "illegal state" );
    }
    
    it = ss.iterator();
    var s = it.value();
    ok( ss.removeAt(it) === s              , "removeAt" );
    ok( !ss.contains(s)                                 );
    
    ss.empty();
    ok( ss.size() === 0                    , "size" );
    ok( ss.addAll( new StringSet(1, 2), 3 ), "addAll set" );
    ok( ss.size() === 3                             );
    
});
