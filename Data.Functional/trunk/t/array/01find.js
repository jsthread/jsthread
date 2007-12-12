//@esmodpp
//@require Test.Simple
//@with-namespace Test.Simple

//@require Data.Functional.Array


test(8, function(){

    var a = [];
    for ( var i=0;  i < 20;  i++ ) a[i] = i;

    function p ( it ) {
        return it % 3 == 0;
    }

    var it = a.head().find(p);
    ok( it.value() ==  0,   0 + it.value());

    it = it.next().find(p);
    ok( it.value() ==  3,   3);

    it = it.next().find(p);
    ok( it.value() ==  6,   6);

    it = it.next().find(p);
    ok( it.value() ==  9,   9);

    it = it.next().find(p);
    ok( it.value() == 12,  12);

    it = it.next().find(p);
    ok( it.value() == 15,  15);

    it = it.next().find(p);
    ok( it.value() == 18,  18);

    it = it.next().find(p);
    ok( it.isTail()       ,   "tail");
    
});
