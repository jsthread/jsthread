//@esmodpp
//@namespace Concurrent.Thread.Compiler

//@require Concurrent.Thread.Compiler.Kit

//@require Data.Cons
//@with-namespace Data.Cons



//@export Statement
function Statement ( labels ) {
    // This is kind of abstract class.
    this.labels = labels;
}

Statement.prototype.toString = function ( ) {
    codeBug();
};

// kind of protected method.
function labelsToString ( ) {
    var buf = [];
    for ( var i=0;  i < this.labels.length;  i++ ) {
        buf.push(this.labels[i], ": ");
    }
    return buf.join("");
}


//@export Block
function Block ( labels, statements ) {
    Statement.call(this, labels);
    this.cdr = statements;
}

var proto = Block.prototype = new Statement();
proto.constructor = Block;

proto.toString = function ( ) {
    var buf = [labelsToString.call(this), "{"];
    for ( var c=this.cdr;  c !== nil;  c=c.cdr ) buf.push(c.car);
    buf.push("}\n");
    return buf.join("\n");
};


//@export ExpStatement
function ExpStatement ( labels, exp ) {
    Statement.call(this, labels);
    this.exp = exp;
}

var proto = ExpStatement.prototype = new Statement();
proto.constructor = ExpStatement;

proto.toString = function ( ) {
    return labelsToString.call(this) + this.exp + ";";
};

proto.containsFunctionCall = function ( ) {
    return this.exp.containsFunctionCall();
};


//@export VarStatement
function VarStatement ( labels, decls ) {
    Statement.call(this, labels);
    this.decls = decls;
}

var proto = VarStatement.prototype = new Statement();
proto.constructor = VarStatement;

proto.toString = function ( ) {
    var buf = [];
    for ( var i=0;  i < this.decls.length;  i++ ) {
        if ( this.decls[i].exp ) {
            buf.push( this.decls[i].id + "=" + this.decls[i].exp );
        }
        else {
            buf.push( this.decls[i].id );
        }
    }
    return [ labelsToString.call(this),
             "var ",
             buf.join(", "),
             ";",
           ].join("");
};

proto.containsFunctionCall = function ( ) {
    for ( var i=0;  i < this.decls.length;  i++ ) {
        if ( this.decls[i].exp && this.decls[i].exp.containsFunctionCall() ) {
            return true;
        }
    }
    return false;
};


//@export IfStatement
function IfStatement ( labels, condition, statement ) {
    Statement.call(this, labels);
    this.condition = condition;
    this.statement = statement;
}

var proto = IfStatement.prototype = new Statement();
proto.constructor = IfStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "if (",
             this.condition,
             ") ",
             this.statement
           ].join("");
};


//@export IfElseStatement
function IfElseStatement ( labels, condition, tstatement, fstatement ) {
    Statement.call(this, labels);
    this.condition  = condition;
    this.tstatement = tstatement;
    this.fstatement = fstatement;
}

var proto = IfElseStatement.prototype = new Statement();
proto.constructor = IfElseStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "if (",
             this.condition,
             ") ",
             this.tstatement,
             "\n",
             "else ",
             this.fstatement
           ].join("");
};


//@export DoWhileStatement
function DoWhileStatement ( labels, statement, condition ) {
    Statement.call(this, labels);
    this.statement = statement;
    this.condition = condition;
}

var proto = DoWhileStatement.prototype = new Statement();
proto.constructor = DoWhileStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "do ",
             this.statement,
             " while (",
             this.condition,
             ");"
           ].join("");
};


//@export WhileStatement
function WhileStatement ( labels, condition, statement ) {
    Statement.call(this, labels);
    this.condition = condition;
    this.statement = statement;
}

var proto = WhileStatement.prototype = new Statement();
proto.constructor = WhileStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "while (",
             this.condition,
             ") ",
             this.statement
           ].join("");
};


//@export ForStatement
function ForStatement ( labels, init, cond, loop, statement ) {
    Statement.call(this, labels);
    this.init      = init;
    this.cond      = cond;
    this.loop      = loop;
    this.statement = statement;
}

var proto = ForStatement.prototype = new Statement();
proto.constructor = ForStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "for (",
             this.init ? this.init : "", "; ",
             this.cond ? this.cond : "", "; ",
             this.loop ? this.loop : "",
             ") ",
             this.statement
           ].join("");
};


//@export ForVarStatement
function ForVarStatement ( labels, decls, cond, loop, statement ) {
    Statement.call(this, labels);
    this.decls     = decls;
    this.cond      = cond;
    this.loop      = loop;
    this.statement = statement;
}

var proto = ForVarStatement.prototype = new Statement();
proto.constructor = ForVarStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "for (",
             new VarStatement(decls), " ",
             this.cond ? this.cond : "", "; ",
             this.loop ? this.loop : "",
             ") ",
             this.statement
           ].join("");
};


//@export ForInStatement
function ForInStatement ( labels, lhs, exp, statement ) {
    Statement.call(this, labels);
    this.lhs       = lhs;
    this.exp       = exp;
    this.statement = statement;
}

var proto = ForInStatement.prototype = new Statement();
proto.constructor = ForInStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "for (", this.lhs, " in ", this.exp, ") ",
             this.statement
           ].join("");
};


//@export ForInVarStatement
function ForInVarStatement ( labels, decl, exp, statement ) {
    Statement.call(this, labels);
    this.decl      = decl;
    this.exp       = exp;
    this.statement = statement;
}

var proto = ForInVarStatement.prototype = new Statement();
proto.constructor = ForInVarStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "for ( var ",
             this.decl.exp ? this.decl.id + "=" + this.decl.exp
                           : this.decl,
             " in ",
             this.exp,
             ") ",
             this.statement
           ].join("");
};


//@export ContinueStatement
function ContinueStatement ( labels, target ) {
    Statement.call(this, labels);
    this.target = target;
}

var proto = ContinueStatement.prototype = new Statement();
proto.constructor = ContinueStatement;

proto.toString = function ( ) {
    var buf = [labelsToString.call(this), "continue"];
    if ( this.target ) buf.push(" ", this.target);
    buf.push(";");
    return buf.join("");
};


//@export BreakStatement
function BreakStatement ( labels, target ) {
    Statement.call(this, labels);
    this.target = target;
}

var proto = BreakStatement.prototype = new Statement();
proto.constructor = BreakStatement;

proto.toString = function ( ) {
    var buf = [labelsToString.call(this), "break"];
    if ( this.target ) buf.push(" ", this.target);
    buf.push(";");
    return buf.join("");
};


//@export ThrowStatement
function ThrowStatement ( labels, exp ) {
    Statement.call(this, labels);
    this.exp = exp;
}

var proto = ThrowStatement.prototype = new Statement();
proto.constructor = ThrowStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "throw ", this.exp, ";"
           ].join("");
};


//@export TryCatchStatement
function TryCatchStatement ( labels, try_block, variable, catch_block ) {
    Statement.call(this, labels);
    this.try_block   = try_block;
    this.variable    = variable;
    this.catch_block = catch_block;
}

var proto = TryCatchStatement.prototype = new Statement();
proto.constructor = TryCatchStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "try ", this.try_block, "\n",
             "catch (", this.variable, ") ", this.catch_block
           ].join("");
};


//@export TryFinallyStatement
function TryFinallyStatement ( labels, try_block, finally_block ) {
    Statement.call(this, labels);
    this.try_block     = try_block;
    this.finally_block = finally_block;
}

var proto = TryFinallyStatement.prototype = new Statement();
proto.constructor = TryFinallyStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "try ", this.try_block, "\n",
             "finally ", this.finally_block
           ].join("");
};


//@export TryCatchFinallyStatement
function TryCatchFinallyStatement ( labels, try_block, variable, catch_block, finally_block ) {
    Statement.call(this, labels);
    this.try_block     = try_block;
    this.variable      = variable;
    this.catch_block   = catch_block;
    this.finally_block = finally_block;
}

var proto = TryCatchFinallyStatement.prototype = new Statement();
proto.constructor = TryCatchFinallyStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "try ", this.try_block, "\n",
             "catch (", this.variable, ") ", this.catch_block, "\n",
             "finally ", this.finally_block
           ].join("");
};


