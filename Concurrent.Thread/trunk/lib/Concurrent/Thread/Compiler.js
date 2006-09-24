//@esmodpp
//@version 0.0.0
//@namespace Concurrent.Thread

//@require Concurrent.Thread
//@require Concurrent.Thread.Compiler.Parser
//@require Concurrent.Thread.Compiler.CfConvert
//@require Concurrent.Thread.Compiler.CsConvert
//@require Concurrent.Thread.Compiler.CeConvert
//@require Concurrent.Thread.Compiler.IntermediateLanguage
//@with-namespace Concurrent.Thread.Compiler

//@require Data.Cons
//@with-namespace Data.Cons



var PREFIX            = "$Concurrent_Thread_";
var intermediateVar   = new Identifier(PREFIX + "intermediate");
var nullFunctionVar   = new Identifier(PREFIX + "null_function");
var initialContReturn = new Identifier(PREFIX + "continuation");
var initialContThrow  = new DotAccessor(initialContReturn, new Identifier("exception"));


//@export compile
function compile ( f ) {
    var func = parseFunction(f);
    var pack = new TransPack();
    func = CfConvert(pack, func);
    func = CsConvert(pack, func);
    func = CeConvert(pack, func);
    return func;
}

function parseFunction ( f ) {
    if ( typeof f != "function" ) throw new TypeError();
    var parser = new Parser();
    var stmts = parser.parse("(" + f + ");");
    if ( !(stmts.car instanceof ExpStatement) ) throw new Error("not exp-statement!");
    if ( !(stmts.car.exp instanceof FunctionExpression) ) throw new Error("not function-expression!");
    return stmts.car.exp;
}



function TransPack ( ) {
    this.label_cnt = 0;
    this.stack_max = 0;
//    this.cont_break    = null;
//    this.cont_continue = null;
    this.cont_return   = initialContReturn;
    this.cont_throw    = initialContThrow;
    this.vars = new IdentifierSet();
    this.head = this.tail = nil;
}

var proto = TransPack.prototype;

proto.registerVar = function ( id ) {
    this.vars.add(id);
};

proto.createLabel = function ( ) {
    return new Label(PREFIX + "label" + this.label_cnt++, this.cont_throw);
};

proto.createStackVar = function ( n ) {
    var id = new Identifier(PREFIX + "stack" + n);
    if ( n > this.stack_max ) {
        this.stack_max = n;
        this.registerVar(id);
    }
    return id;
};

proto.addStatement = function ( s ) {
    if ( this.tail === nil ) {
        this.head = this.tail = cons(s, nil);
    } else {
        this.tail = this.tail.cdr = cons(s, nil);
    }
};

