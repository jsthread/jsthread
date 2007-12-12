//@esmodpp
//@require Test.Simple
//@with-namespace Test.Simple
//@require Data.Functional.Array

//@require Concurrent.Thread.Compiler.TokenStream
//@with-namespace Concurrent.Thread.Compiler

test(14, function(){

    var token = [
        {token:Token.IF    , str:"if"},
        {token:Token.LP    , str:"("},
        {token:Token.NAME  , str:"toString"},
        {token:Token.EQ    , str:"=="},
        {token:Token.STRING, str:"'hoge'"},
        {token:Token.RP    , str:")"},
        {token:Token.NAME  , str:"f"},
        {token:Token.LP    , str:"("},
        {token:Token.NULL  , str:"null"},
        {token:Token.RP    , str:")"},
        {token:Token.SEMI  , str:";"}
    ];

    var src = token.map(function(it){
        return it.str;
    }).join(" ");

    // psudo parser
    var parser = {
        addError   : function ( str ) { throw new Error(str); },
        reportError: function ( str ) { throw new Error(str); },
        addWarning : function ( str ) { alert("WARNING: " + str); }
    };

    var ts = new TokenStream(parser, src, 1);
    ok(1, "instantiation");

    var res = [];
    var i;
    while ( (i = ts.getToken()) != Token.EOF ) res.push(i);
    ok(1, "scanning");

    ok(token.length == res.length);

    for ( var i=0;  i < token.length;  i++ ) {
        ok(token[i].token == res[i]  , token[i].str);
    }
});

