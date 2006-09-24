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
    return [ this.id, "[", this.exception, "]:" ].join("");
};



//@export PropsStatement
function PropsStatement ( e ) {
    this.expression = e;  // Expression
}

PropsStatement.prototype.toString = function ( ) {
    return [ "props( ", this.expression, " );" ].join("");
};



//@export GotoStatement
function GotoStatement ( c, r ) {
    this.continuation  = c;  // Identifier
    this.ret_val       = r;  // Expression
}

GotoStatement.prototype.toString = function ( ) {
    return [ "goto[", this.continuation, "]",
                 "(", this.ret_val     , ");" ].join("");
};



//@export IfGotoStatement
function IfGotoStatement ( e, c, r ) {
    this.condition    = e;  // Expression
    this.continuation = c;  // Identifier
    this.ret_val      = r;  // Expression
}

IfGotoStatement.prototype.toString = function ( ) {
    return [ "if ( ", this.condition, " ) ",
             "goto[", this.continuation, "]",
                 "(", this.ret_val,      ");" ].join("");
};



//@export CallStatement
function CallStatement ( c, t, f, a ) {
    this.continuation = c;  // Label
    this.this_val     = t;  // Expression
    this.function_val = f;  // Expression
    this.arguments    = a;  // array of Expression
}

CallStatement.prototype.toString = function ( ) {
    return [ "call[", this.continuation, "]",
                 "(", this.this_val, ", ", this.function_val, ")",
                 "(", this.arguments.join(", ")             , ");" ].join("");
};



//@export NewStatement
function NewStatement ( c, f, a ) {
    this.continuation = c;  // Label
    this.constructor  = f;  // Expression
    this.arguments    = a;  // array of Expression
}

NewStatement.prototype.toString = function ( ) {
    return [ "new[", this.continuation, "]",
                "(", this.constructor , ")",
                "(", this.arguments.join(", ") , ");" ].join("");
};



//@export RecieveStatement
function RecieveStatement ( e ) {
    this.lhs = e;  // Identifier or DotAccessor or BracketAccessor
}

RecieveStatement.prototype.toString = function ( ) {
    return [ "recieve( ", this.lhs, " );" ].join("");
};

