//@esmodpp
//@require        Test.Simple
//@with-namespace Test.Simple

//@require Data.Functional.MinimalList
//@with-namespace Data.Functional


test(6, function(){
    
    var l = new MinimalList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    var m = l.filter(function( it ){
        return it % 2;
    });
    
    ok( m.size() === 5,  "size" );
    ok( m.get(0) === 1,  "1" );
    ok( m.get(1) === 3,  "3" );
    ok( m.get(2) === 5,  "5" );
    ok( m.get(3) === 7,  "7" );
    ok( m.get(4) === 9,  "9" );
    
});
