//@esmodpp
//@extend    WebBrowser.ScriptExecuter

//@namespace Concurrent.Thread.Compiler
//@require   Concurrent.Thread.Compiler

WebBrowser.ScriptExecuter.register("text/x-script.multithreaded-js", function ( src ){
    eval(compile(src)).async(null);
});

function compile ( src ) {
    var prog = (new Parser).parse(src);
    prog = new FunctionExpression(null, [], prog);
    prog = CssConvert(prog);
    prog = CvConvert(prog);
    prog = CsConvert(prog);
    prog = CfConvert(prog);
    prog.vars.forEach(function( it ){
        // Incredibly, window does not have hasOwnProperty method on IE!!
        if ( !Object.prototype.hasOwnProperty.call(window, it) ) window[it] = undefined;
    });
    prog.vars = [];
    prog = CzConvert(prog);
    return [
        "1, function(){",
        "    var $Concurrent_Thread_self = function(){};",
        "    $Concurrent_Thread_self.$Concurrent_Thread_compiled = ", prog, ";",
        "    return $Concurrent_Thread_self;",
        "}()"
    ].join("");
}
