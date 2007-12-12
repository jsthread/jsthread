//@esmodpp
//@require Test.Simple
//@with-namespace Test.Simple

//@require Data.Functional.String


test(16, function(){
    
    var str = "hoge fuga piyo";
    
    var i=0;
    str.forEach(function( it ){
        ok( it === str.charAt(i)          , "forEach: " + str.charAt(i++) );
    });
    
    
    ok( str.grep(/[aiueo]/) == "oeuaio"     , "grep" );
    ok( str.reverse() == "oyip aguf egoh"   , "reverse" );
    
});
