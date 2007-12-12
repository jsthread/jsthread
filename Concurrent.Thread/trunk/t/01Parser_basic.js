//@esmodpp
//@require Test.Simple
//@with-namespace Test.Simple

//@require        Concurrent.Thread.Compiler.Parser
//@with-namespace Concurrent.Thread.Compiler

//@require Data.Cons 0.2.0
//@with-namespace Data.Cons


test(19, function(){

    var parser = new Parser();
    ok( parser instanceof Parser                                        , "instantiation" );

    var s = parser.parse("if ( c ) { f(); } else { var x, y=10; }");

    ok( s.car instanceof IfElseStatement                                , s.car );

    ok( s.car.tbody instanceof Block                                    , "tbody" );
    ok( s.car.tbody.body.car instanceof ExpStatement );
    ok( s.car.tbody.body.car.exp instanceof CallExpression               , "CallExpression" );
    ok( s.car.tbody.body.car.exp.func instanceof Identifier);
    ok( s.car.tbody.body.car.exp.args.length == 0 );
    ok( s.car.tbody.body.cdr.isNil() );

    ok( s.car.fbody instanceof Block                                    , "fbody");
    ok( s.car.fbody.body.car instanceof VarStatement                     , "VarStatement" );
    ok( s.car.fbody.body.car.decls.length == 2 );
    ok( s.car.fbody.body.car.decls[0].id instanceof Identifier           , "x");
    ok( s.car.fbody.body.car.decls[0].id == "x" );
    ok( s.car.fbody.body.car.decls[0].exp === null );
    ok( s.car.fbody.body.car.decls[1].id instanceof Identifier           , "y");
    ok( s.car.fbody.body.car.decls[1].id == "y" );
    ok( s.car.fbody.body.car.decls[1].exp instanceof NumberLiteral );
    ok( s.car.fbody.body.car.decls[1].exp == 10 );
    ok( s.car.fbody.body.cdr.isNil() );

});
