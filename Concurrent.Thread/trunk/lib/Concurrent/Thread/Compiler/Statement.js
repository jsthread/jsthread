//@esmodpp
//@namespace Concurrent.Thread.Compiler

//@require Concurrent.Thread.Compiler.Kit

//@require Data.Cons
//@with-namespace Data.Cons



//@export Statement
function Statement ( labels, lineno ) {
    // This is kind of abstract class.
    this.labels = labels;  // array of Identifier
    this.lineno = lineno;  // Number (optional)
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
function Block ( labels, statements, lineno ) {
    Statement.call(this, labels, lineno);
    this.cdr = statements;  // cons-list of Statement
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
function ExpStatement ( labels, exp, lineno ) {
    Statement.call(this, labels, lineno);
    this.exp = exp;  // Expression
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
function VarStatement ( labels, decls, lineno ) {
    Statement.call(this, labels, lineno);
    this.decls = decls;  // array of {id: Identifier,  exp: Expression or null}
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
function IfStatement ( labels, condition, statement, lineno ) {
    Statement.call(this, labels, lineno);
    this.condition = condition;  // Expression
    this.statement = statement;  // Statement
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
function IfElseStatement ( labels, condition, tstatement, fstatement, lineno ) {
    Statement.call(this, labels, lineno);
    this.condition  = condition;   // Expression
    this.tstatement = tstatement;  // Statement
    this.fstatement = fstatement;  // Statement
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
function DoWhileStatement ( labels, statement, condition, lineno ) {
    Statement.call(this, labels, lineno);
    this.statement = statement;  // Statement
    this.condition = condition;  // Expression
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
function WhileStatement ( labels, condition, statement, lineno ) {
    Statement.call(this, labels, lineno);
    this.condition = condition;  // Expression
    this.statement = statement;  // Statement
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
function ForStatement ( labels, init, cond, loop, statement, lineno ) {
    Statement.call(this, labels, lineno);
    this.init      = init;       // Expression
    this.cond      = cond;       // Expression
    this.loop      = loop;       // Expression
    this.statement = statement;  // Statement
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
function ForVarStatement ( labels, decls, cond, loop, statement, lineno ) {
    Statement.call(this, labels, lineno);
    this.decls     = decls;      // array of {id: Identifier,  exp: Expression or null}
    this.cond      = cond;       // Expression
    this.loop      = loop;       // Expression
    this.statement = statement;  // Statement
}

var proto = ForVarStatement.prototype = new Statement();
proto.constructor = ForVarStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "for (",
             new VarStatement([], decls), " ",
             this.cond ? this.cond : "", "; ",
             this.loop ? this.loop : "",
             ") ",
             this.statement
           ].join("");
};


//@export ForInStatement
function ForInStatement ( labels, lhs, exp, statement, lineno ) {
    Statement.call(this, labels, lineno);
    this.lhs       = lhs;        // Identifier or DotAccessor or BracketAccessor
    this.exp       = exp;        // Expression
    this.statement = statement;  // Statement
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
function ForInVarStatement ( labels, decl, exp, statement, lineno ) {
    Statement.call(this, labels, lineno);
    this.decl      = decl;       // {id: Identifier,  exp: Expression or null}
    this.exp       = exp;        // Expression
    this.statement = statement;  // Statement
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
function ContinueStatement ( labels, target, lineno ) {
    Statement.call(this, labels, lineno);
    this.target = target;  // Identifier or null
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
function BreakStatement ( labels, target, lineno ) {
    Statement.call(this, labels, lineno);
    this.target = target;  // Identifier or null
}

var proto = BreakStatement.prototype = new Statement();
proto.constructor = BreakStatement;

proto.toString = function ( ) {
    var buf = [labelsToString.call(this), "break"];
    if ( this.target ) buf.push(" ", this.target);
    buf.push(";");
    return buf.join("");
};


//@export ReturnStatement
function ReturnStatement ( labels, exp, lineno ) {
    Statement.call(this, labels, lineno);
    this.exp = exp;  // Expression or null
}

var proto = ReturnStatement.prototype = new Statement();
proto.constructor = ReturnStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "return ",
             this.exp ? this.exp : "",
             ";"
           ].join("");
};


//@export WithStatement
function WithStatement ( labels, exp, statement, lineno ) {
    Statement.call(this, labels, lineno);
    this.exp       = exp;        // Expression
    this.statement = statement;  // Statement
}

var proto = WithStatement.prototype = new Statement();
proto.constructor = WithStatement;

proto.toString = function ( ) {
    return [ "with (", this.exp, ") ", this.statement ].join("");
};


//@export SwitchStatement
function SwitchStatement ( labels, exp, clauses, lineno ) {
    Statement.call(this, labels, lineno);
    this.exp = exp;      // Expression
    this.cdr = clauses;  // cons-list of (CaseClause or DefaultClause)
}

var proto = SwitchStatement.prototype = new Statement();
proto.constructor = SwitchStatement;

proto.toString = function ( ) {
    var buf = [ "switch ( ", this.exp, ") {\n"];
    for ( var c=this.clauses;  c !=== nil;  c=c.cdr ) buf.push(c.car, "\n");
    buf.push("}");
    return buf.join("");
};


//@export CaseClause
function CaseClause ( exp, statements, lineno ) {
    this.exp    = exp;         // Expression
    this.cdr    = statements;  // cons-list of Statement
    this.lineno = lineno;      // Number (optional)
}

CaseClause.prototype.toString = function ( ) {
    var buf = ["case ", this.exp, ":\n"];
    for ( var c=this.cdr;  c !== nil;  c=c.cdr ) buf.push(c.car, "\n");
    return buf.join("");
};


//@export DefaultClause
function DefaultClause ( statements, lineno ) {
    this.cdr = statements;  // cons-list of Statement
    this.lineno = lineno;   // Number (optional)
}

DefaultClause.prototype.toString = function ( ) {
    var buf = ["default:\n"];
    for ( var c=this.cdr;  c !== nil;  c=c.cdr ) buf.push(c.car, "\n");
    return buf.join("");
};


//@export ThrowStatement
function ThrowStatement ( labels, exp, lineno ) {
    Statement.call(this, labels, lineno);
    this.exp = exp;  // Expression
}

var proto = ThrowStatement.prototype = new Statement();
proto.constructor = ThrowStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "throw ", this.exp, ";"
           ].join("");
};


//@export TryCatchStatement
function TryCatchStatement ( labels, try_block, variable, catch_block, lineno ) {
    Statement.call(this, labels, lineno);
    this.try_block   = try_block;    // Block
    this.variable    = variable;     // Identifier
    this.catch_block = catch_block;  // Block
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
function TryFinallyStatement ( labels, try_block, finally_block, lineno ) {
    Statement.call(this, labels, lineno);
    this.try_block     = try_block;      // Block
    this.finally_block = finally_block;  // Block
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
function TryCatchFinallyStatement ( labels, try_block, variable, catch_block, finally_block, lineno ) {
    Statement.call(this, labels, lineno);
    this.try_block     = try_block;      // Block
    this.variable      = variable;       // Identifier
    this.catch_block   = catch_block;    // Block
    this.finally_block = finally_block;  // Block
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


//@export FunctionDeclaration
function FunctionDeclaration ( labels, name, params, body, lineno ) {
    Statement.call(this, labels, lineno);
    this.name   = name;    // Identifier
    this.params = params;  // array of Identifier
    this.cdr    = body;    // cons-list of Statement
}

var proto = FunctionDeclaration.prototype = new Statement();
proto.constructor = FunctionDeclaration;

proto.toString = function ( ) {
    var buf = [ "function ", this.name,
                " (", this.params.join(", "), ") {\n" ];
    for ( var c=this.cdr;  c !== nil;  c=c.cdr ) buf.push(c.car, "\n");
    buf.push("}");
    return buf.join("");
};

