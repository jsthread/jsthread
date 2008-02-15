//@esmodpp
//@require Test.Simple
//@with-namespace Test.Simple

test(2, function(){
    ok(1  , "hoge");
    ok(1-1, "fuga");
    ok();
    throw new Error("some error");
});
