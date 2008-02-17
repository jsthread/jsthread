//@esmodpp
//@require        Concurrent.Thread.Ports.Test.Simple
//@with-namespace Test.Simple

//@require Concurrent.Thread.Compiler

test({
    name     : "wait 3secs",
    tests    : 2,
    test_case: eval(Concurrent.Thread.prepare(function ( ) {
        var before = new Date();
        ok(before);
        if ( StdIO.Out ) StdIO.Out.writeln("Wait 3 secs...");
        Concurrent.Thread.sleep(3000);
        var after = new Date();
        ok(after.valueOf() - before.valueOf() >= 3000);
    }))
});

