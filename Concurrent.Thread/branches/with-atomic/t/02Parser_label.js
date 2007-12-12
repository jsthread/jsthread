//@esmodpp
//@require Test.Simple
//@with-namespace Test.Simple

//@require        Concurrent.Thread.Compiler.Parser
//@with-namespace Concurrent.Thread.Compiler

test(4, function(){
    
    var p = new Parser();
    
    ok( p.parse("LABEL: while ( c ) break LABEL;") );
    
    var thrown = false;
    try {
        p.parse("LABEL: while ( c ) break UNKNOWN;");
    } catch ( e ) {
        thrown = true;
    }
    ok( thrown );
    
    ok( p.parse("LABEL: switch ( c ) { default: break LABEL; }") );
    
    var thrown = false;
    try {
        p.parse("LABEL: switch ( c ) { default: continue LABEL; }")
    } catch ( e ) {
        thrown = true;
    }
    ok( thrown );
    
});
