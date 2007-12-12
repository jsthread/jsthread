//@esmodpp
//@require        Test.Simple
//@with-namespace Test.Simple

//@require Data.Functional.MinimalList
//@with-namespace Data.Functional


test(10, function(){
    
    function sub ( x, y ) {
        return x - y;
    }
    function odd ( x ) {
        return x % 2;
    }
    function err ( ) {
        throw new Error();
    }
    
    var four  = new MinimalList(1, 2, 3, 4);
    var empty = new MinimalList();
    
    
    //////////////////////////////////////////
    // Test if "foldl" is left-associative.
    //////////////////////////////////////////
    ok( four.foldl(sub, 0) === -10 );
    ok( four.foldl1(sub) === -8 );
    
    //////////////////////////////////////////
    // Test if "foldr" is right-associative.
    //////////////////////////////////////////
    ok( four.foldr(sub, 5) === 3 );
    ok( four.foldr1(sub) === -2 );
    
    ////////////////////////////////////////////////////////////////
    // Test if "fold"ing empty list returns its start-value as-is.
    ////////////////////////////////////////////////////////////////
    var r = Math.random();
    ok( empty.fold(err, r) === r );
    ok( empty.foldl(err, r) === r );
    ok( empty.foldr(err, r) === r );
    
    ////////////////////////////////////////////////////////////////
    // Test if "fold1"ing empty list throws EmptyEnumerationError.
    ////////////////////////////////////////////////////////////////
    (new MinimalList("fold1", "foldl1", "foldr1")).forEach(function( it ){
        try {
            empty[it](err);
            ok( false );
        } catch ( e ) {
            ok( e instanceof EmptyEnumerationError );
        }
    });
    
});
