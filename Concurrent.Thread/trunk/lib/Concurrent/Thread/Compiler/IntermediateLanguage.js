//@esmodpp
//@version 0.0.0
//@namespace Concurrent.Thread.Compiler

//@require Concurrent.Thread
//@require Concurrent.Thread.Compiler.Statement
//@require Concurrent.Thread.Compiler.Expression



//@export StackVariable
function StackVariable ( n ) {
    Identifier.call(this, "$Concurrent_Thread_stack"+n);
}

StackVariable.prototype = new Identifier();
StackVariable.prototype.constructor = StackVariable;



//@export Label
function Label ( n, e ) {
    this.id = new Identifier(n);
    this.exception = e;
}

Label.prototype.toString = function ( ) {
    return [ "  ", this.id, "[", this.exception, "]:" ].join("");
};



//@export ILExpStatement
function ILExpStatement ( e ) {
    this.exp = e;
}

ILExpStatement.prototype.toString = function ( ) {
    return [ "    ", this.exp, ";" ].join("");
};



//@export PropsStatement
function PropsStatement ( e ) {
    this.expression = e;  // Expression
}

PropsStatement.prototype.toString = function ( ) {
    return [ "    props( ", this.expression, " );" ].join("");
};



//@export GotoStatement
function GotoStatement ( c, r ) {
    this.continuation  = c;  // Identifier
    this.ret_val       = r;  // Expression
}

GotoStatement.prototype.toString = function ( ) {
    return [ "    goto[", this.continuation, "]",
                     "(", this.ret_val     , ");" ].join("");
};



//@export IfThenStatement
function IfThenStatement ( e, c ) {
    this.condition    = e;  // Expression
    this.continuation = c;  // Identifier
}

IfThenStatement.prototype.toString = function ( ) {
    return [ "    if ( ", this.condition, " ) ",
                 "then[", this.continuation, "];" ].join("");
};



//@export CallStatement
function CallStatement ( c, t, f, a ) {
    this.continuation = c;  // Label
    this.this_val     = t;  // Expression
    this.func         = f;  // Expression
    this.args         = a;  // array of Expression
}

CallStatement.prototype.toString = function ( ) {
    return [ "    call[", this.continuation, "]",
                     "(", this.this_val, ", ", this.func, ")",
                     "(", this.args.join(", ")          , ");" ].join("");
};



//@export NewStatement
function NewStatement ( c, f, a ) {
    this.continuation = c;  // Label
    this.func         = f;  // Expression
    this.args         = a;  // array of Expression
}

NewStatement.prototype.toString = function ( ) {
    return [ "    new[", this.continuation, "]",
                    "(", this.func            , ")",
                    "(", this.args.join(", ") , ");" ].join("");
};



//@export RecieveStatement
function RecieveStatement ( e ) {
    this.lhs = e;  // Identifier or DotAccessor or BracketAccessor
}

RecieveStatement.prototype.toString = function ( ) {
    return [ "    recieve( ", this.lhs, " );" ].join("");
};

