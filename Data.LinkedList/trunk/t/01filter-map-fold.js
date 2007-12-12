//@esmodpp
//@require Test.Simple
//@with-namespace Test.Simple

//@require Data.LinkedList
//@with-namespace Data


test(5, function(){
    
    var l = new LinkedList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    ok( l.size() === 10 );
    
    var x = l.filter(function(x){
                return x % 3 == 0
            }).map(function(x){
                return x*x
            }).foldl(function(x, y){
                return x + y
            }, 0);
    ok( x === 126 );
    
    var x = l.filter(function(x){
                return x % 3 == 0
            }).map(function(x){
                return x*x
            }).foldr1(function(x, y){
                return x + y
            });
    ok( x === 126 );
    
    var x = l.foldl1(function(x, y){
                return x - y
            });
    ok( x === -53 );
    
    var x = l.foldr1(function(x, y){
                return x - y
            });
    ok( x === -5 );
    
});

