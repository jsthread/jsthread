//@esmodpp
//@require        Test.Simple
//@with-namespace Test.Simple

//@require Data.Functional.MinimalList
//@with-namespace Data.Functional


test(10, function(){
    
    var ml = new MinimalList(0, 1, 2, 3, 4, 5);
    
    function check_this ( title ) {
        return function ( ) {
            ok( this === ml, title );
            discontinue();
        };
    }
    
    ml.forEach(check_this("forEach"));
    
    ml.map(check_this("map"));
    
    ml.fold(check_this("fold"), 0);
    ml.fold1(check_this("fold1"));
    
    ml.foldl(check_this("foldl"), 0);
    ml.foldl1(check_this("foldl1"));
    
    ml.foldr(check_this("foldr"), 0);
    ml.foldr1(check_this("foldr1"));
    
    ml.all(check_this("all"));
    ml.any(check_this("any"));
    
});
