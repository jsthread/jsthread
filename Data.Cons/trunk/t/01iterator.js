//@esmodpp
//@require Test.Simple
//@with-namespace Test.Simple

//@require Data.Cons.List
//@with-namespace Data.Cons
//@with-namespace Data.Iterator


test(38, function(){
    
    var a = [];
    for ( var i=0;  i < 5;  i++ ) a[i] = Math.random();
    
    var l = list.apply(null, a);
    ok( l.size() === 5 );
    
    var it = l.iterator();
    ok( it.isHead()    , "iterator" );
    ok( !it.isTail()   , "  next" );
    
    ok( it.value() === a[0] );
    it = it.next();
    ok( it.value() === a[1] );
    it = it.next();
    ok( it.value() === a[2] );
    it = it.next();
    ok( it.value() === a[3] );
    it = it.next();
    ok( it.value() === a[4] );
    it = it.next();
    ok( it.isTail() );
    
    try {
        it.next();
        ok( false );
    } catch ( e ) {
        ok( e instanceof NoSuchElementError );
    }
    
    
    var it = l.iterator(-1);
    ok( !it.isHead()        , "  previous" );
    ok( !it.isTail() );
    ok( it.next().isTail() );
    
    ok( it.value() === a[4] );
    it = it.previous();
    ok( it.value() === a[3] );
    it = it.previous();
    ok( it.value() === a[2] );
    it = it.previous();
    ok( it.value() === a[1] );
    it = it.previous();
    ok( it.value() === a[0] );
    ok( it.isHead() );
    
    try {
        it.previous();
        ok( false );
    } catch ( e ) {
        ok( e instanceof NoSuchElementError );
    }
    
    
    
    var it = l.reverseHead();
    ok( it.isHead()    , "reverse-iterator" );
    ok( !it.isTail()   , "  next" );
    
    ok( it.value() === a[4] );
    it = it.next();
    ok( it.value() === a[3] );
    it = it.next();
    ok( it.value() === a[2] );
    it = it.next();
    ok( it.value() === a[1] );
    it = it.next();
    ok( it.value() === a[0] );
    it = it.next();
    ok( it.isTail() );
    
    try {
        it.next();
        ok( false );
    } catch ( e ) {
        ok( e instanceof NoSuchElementError );
    }
    
    
    var it = l.reverseTail();
    ok( it.isTail()        , "  previous" );
    ok( !it.isHead() );
    
    it = it.previous();
    ok( it.value() === a[0] );
    it = it.previous();
    ok( it.value() === a[1] );
    it = it.previous();
    ok( it.value() === a[2] );
    it = it.previous();
    ok( it.value() === a[3] );
    it = it.previous();
    ok( it.value() === a[4] );
    ok( it.isHead() );
    
    try {
        it.previous();
        ok( false );
    } catch ( e ) {
        ok( e instanceof NoSuchElementError );
    }
    
});
