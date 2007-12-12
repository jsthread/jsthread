/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Concurrent.Thread code.
 *
 * The Initial Developer of the Original Code is
 * Daisuke Maki.
 * Portions created by the Initial Developer are Copyright (C) 2006-2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

//@esmodpp
//@namespace Concurrent.Thread.Compiler
//@require   Concurrent.Thread
//@require   Concurrent.Thread.Compiler.Kit

//@require Data.Cons.List 0.2.0
//@with-namespace Data.Cons



//@export Statement
function Statement ( labels, lineno, source ) {
    // This is kind of abstract class.
    this.labels = labels;  // array of Identifier  # labels directly qualifying this statement
    this.lineno = lineno;  // Number (optional)    # line no. 
    this.source = source;  // String (optional)    # file-name, URL, ...etc
}

Statement.prototype.toString = function ( ) {
    Kit.codeBug();
};

// kind of final protected method.
// Use this like: labelsToString.call(obj, arg0, arg1 ...)
function labelsToString ( ) {
    var buf = [];
    for ( var i=0;  i < this.labels.length;  i++ ) {
        buf.push(this.labels[i], ": ");
    }
    return buf.join("");
}


//@export EmptyStatement
function EmptyStatement ( labels, lineno, source ) {
    Statement.call(this, labels, lineno, source);
}

var proto = EmptyStatement.prototype = new Statement();
proto.constructor = EmptyStatement;

proto.toString = function ( ) {
    return labelsToString.call(this) + ";";
};


//@export Block
function Block ( labels, statements, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.cdr = statements;  // cons-list of Statement
}

var proto = Block.prototype = new Statement();
proto.constructor = Block;

proto.toString = function ( ) {
    var buf = [labelsToString.call(this), "{"];
    this.cdr.forEach(function( it ){
        buf.push(it);
    });
    buf.push("}");
    return buf.join("\n");
};


//@export ExpStatement
function ExpStatement ( labels, exp, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.exp = exp;  // Expression
}

var proto = ExpStatement.prototype = new Statement();
proto.constructor = ExpStatement;

proto.toString = function ( ) {
    return labelsToString.call(this) + String(this.exp) + ";";
};

proto.containsFunctionCall = function ( ) {
    return this.exp.containsFunctionCall();
};


//@export VarStatement
function VarStatement ( labels, decls, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.decls = decls;  // array of {id: Identifier,  exp: Expression or null}
}

var proto = VarStatement.prototype = new Statement();
proto.constructor = VarStatement;

proto.toString = function ( ) {
    var buf = [];
    for ( var i=0;  i < this.decls.length;  i++ ) {
        if ( this.decls[i].exp ) {
            buf.push( [ this.decls[i].id, "=", this.decls[i].exp ].join("") );
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
function IfStatement ( labels, cond, body, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.cond = cond;  // Expression
    this.body = body;  // Statement
}

var proto = IfStatement.prototype = new Statement();
proto.constructor = IfStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "if (",
             this.cond,
             ") ",
             this.body
           ].join("");
};


//@export IfElseStatement
function IfElseStatement ( labels, cond, tbody, fbody, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.cond  = cond;   // Expression
    this.tbody = tbody;  // Statement
    this.fbody = fbody;  // Statement
}

var proto = IfElseStatement.prototype = new Statement();
proto.constructor = IfElseStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "if (",
             this.cond,
             ") ",
             this.tbody,
             "\n",
             "else ",
             this.fbody
           ].join("");
};


//@export DoWhileStatement
function DoWhileStatement ( labels, body, cond, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.body = body;  // Statement
    this.cond = cond;  // Expression
}

var proto = DoWhileStatement.prototype = new Statement();
proto.constructor = DoWhileStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "do ",
             this.body,
             " while (",
             this.cond,
             ");"
           ].join("");
};


//@export WhileStatement
function WhileStatement ( labels, cond, body, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.cond = cond;  // Expression
    this.body = body;  // Statement
}

var proto = WhileStatement.prototype = new Statement();
proto.constructor = WhileStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "while (",
             this.cond,
             ") ",
             this.body
           ].join("");
};


//@export ForStatement
function ForStatement ( labels, init, cond, incr, body, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.init = init;  // Expression or null
    this.cond = cond;  // Expression or null
    this.incr = incr;  // Expression or null
    this.body = body;  // Statement
}

var proto = ForStatement.prototype = new Statement();
proto.constructor = ForStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "for (",
             this.init ? this.init : "", "; ",
             this.cond ? this.cond : "", "; ",
             this.incr ? this.incr : "",
             ") ",
             this.body
           ].join("");
};


//@export ForVarStatement
function ForVarStatement ( labels, decls, cond, incr, body, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.decls = decls;  // array of {id: Identifier,  exp: Expression or null}
    this.cond  = cond;   // Expression or null
    this.incr  = incr;   // Expression or null
    this.body  = body;   // Statement
}

var proto = ForVarStatement.prototype = new Statement();
proto.constructor = ForVarStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "for (",
             new VarStatement([], decls), " ",
             this.cond ? this.cond : "", "; ",
             this.incr ? this.incr : "",
             ") ",
             this.body
           ].join("");
};


//@export ForInStatement
function ForInStatement ( labels, lhs, exp, body, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.lhs  = lhs;   // Identifier or DotAccessor or BracketAccessor
    this.exp  = exp;   // Expression
    this.body = body;  // Statement
}

var proto = ForInStatement.prototype = new Statement();
proto.constructor = ForInStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "for (", this.lhs, " in ", this.exp, ") ",
             this.body
           ].join("");
};


//@export ForInVarStatement
function ForInVarStatement ( labels, decl, exp, body, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.decl = decl;  // {id: Identifier,  exp: Expression or null}
    this.exp  = exp;   // Expression
    this.body = body;  // Statement
}

var proto = ForInVarStatement.prototype = new Statement();
proto.constructor = ForInVarStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "for ( var ",
             this.decl.exp ? String(this.decl.id) + "=" + String(this.decl.exp)
                           : String(this.decl.id),
             " in ",
             this.exp,
             ") ",
             this.body
           ].join("");
};


// Mozilla extention "for each ( ... in ... )"
//@export ForEachStatement
function ForEachStatement ( labels, lhs, exp, body, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.lhs  = lhs;   // Identifier or DotAccessor or BracketAccessor
    this.exp  = exp;   // Expression
    this.body = body;  // Statement
}

var proto = ForEachStatement.prototype = new Statement();
proto.constructor = ForEachStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "for each (", this.lhs, " in ", this.exp, ") ",
             this.body
           ].join("");
};


//@export ForEachVarStatement
function ForEachVarStatement ( labels, decl, exp, body, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.decl = decl;  // {id: Identifier,  exp: Expression or null}
    this.exp  = exp;   // Expression
    this.body = body;  // Statement
}

var proto = ForEachVarStatement.prototype = new Statement();
proto.constructor = ForEachVarStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "for each ( var ",
             this.decl.exp ? String(this.decl.id) + "=" + String(this.decl.exp)
                           : String(this.decl.id),
             " in ",
             this.exp,
             ") ",
             this.body
           ].join("");
};


//@export ContinueStatement
function ContinueStatement ( labels, target, lineno, source ) {
    Statement.call(this, labels, lineno, source);
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
function BreakStatement ( labels, target, lineno, source ) {
    Statement.call(this, labels, lineno, source);
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
function ReturnStatement ( labels, exp, lineno, source ) {
    Statement.call(this, labels, lineno, source);
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
function WithStatement ( labels, exp, body, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.exp  = exp;   // Expression
    this.body = body;  // Statement
}

var proto = WithStatement.prototype = new Statement();
proto.constructor = WithStatement;

proto.toString = function ( ) {
    return [ "with (", this.exp, ") ", this.body ].join("");
};


//@export SwitchStatement
function SwitchStatement ( labels, exp, clauses, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.exp = exp;      // Expression
    this.cdr = clauses;  // cons-list of (CaseClause or DefaultClause)
}

var proto = SwitchStatement.prototype = new Statement();
proto.constructor = SwitchStatement;

proto.toString = function ( ) {
    var buf = [ "switch ( ", this.exp, ") {\n"];
    this.clauses.forEach(function( it ){
        buf.push(it, "\n");
    });
    buf.push("}");
    return buf.join("");
};


//@export CaseClause
function CaseClause ( exp, statements, lineno, source ) {
    this.exp    = exp;         // Expression
    this.cdr    = statements;  // cons-list of Statement
    this.lineno = lineno;      // Number (optional)
    this.source = source;      // String (optional)
}

CaseClause.prototype.toString = function ( ) {
    var buf = ["case ", this.exp, ":\n"];
    this.cdr.forEach(function( it ){
        buf.push(it, "\n");
    });
    return buf.join("");
};


//@export DefaultClause
function DefaultClause ( statements, lineno, source ) {
    this.cdr    = statements;  // cons-list of Statement
    this.lineno = lineno;      // Number (optional)
    this.source = source;      // String (optional)
}

DefaultClause.prototype.toString = function ( ) {
    var buf = ["default:\n"];
    this.cdr.forEach(function( it ){
        buf.push(it, "\n");
    });
    return buf.join("");
};


//@export ThrowStatement
function ThrowStatement ( labels, exp, lineno, source ) {
    Statement.call(this, labels, lineno, source);
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
function TryCatchStatement ( labels, tryBlock, variable, catchBlock, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.tryBlock   = tryBlock;    // Block
    this.variable   = variable;    // Identifier
    this.catchBlock = catchBlock;  // Block
}

var proto = TryCatchStatement.prototype = new Statement();
proto.constructor = TryCatchStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "try ", this.tryBlock, "\n",
             "catch (", this.variable, ") ", this.catchBlock
           ].join("");
};


//@export TryFinallyStatement
function TryFinallyStatement ( labels, tryBlock, finallyBlock, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.tryBlock     = tryBlock;      // Block
    this.finallyBlock = finallyBlock;  // Block
}

var proto = TryFinallyStatement.prototype = new Statement();
proto.constructor = TryFinallyStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "try ", this.tryBlock, "\n",
             "finally ", this.finallyBlock
           ].join("");
};


//@export TryCatchFinallyStatement
function TryCatchFinallyStatement ( labels, tryBlock, variable, catchBlock, finallyBlock, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.tryBlock     = tryBlock;      // Block
    this.variable     = variable;      // Identifier
    this.catchBlock   = catchBlock;    // Block
    this.finallyBlock = finallyBlock;  // Block
}

var proto = TryCatchFinallyStatement.prototype = new Statement();
proto.constructor = TryCatchFinallyStatement;

proto.toString = function ( ) {
    return [ labelsToString.call(this),
             "try ", this.tryBlock, "\n",
             "catch (", this.variable, ") ", this.catchBlock, "\n",
             "finally ", this.finallyBlock
           ].join("");
};


//@export TryCatchListStatement
function TryCatchListStatement ( labels, tryBlock, catchList, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.tryBlock = tryBlock;   // Block
    this.cdr      = catchList;  // cons-list of CatchGuard
}

var proto = TryCatchListStatement.prototype = new Statement();
proto.constructor = TryCatchListStatement;

proto.toString = function ( ) {
    var buf = [ labelsToString.call(this),
                "try ", this.tryBlock, "\n" ];
    this.cdr.forEach(function( it ){
        buf.push(it);
    });
    return buf.join("");
};


//@export TryCatchListFinallyStatement
function TryCatchListFinallyStatement ( labels, tryBlock, catchList, finallyBlock, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.tryBlock     = tryBlock;      // Block
    this.cdr          = catchList;     // cons-list of CatchGuard
    this.finallyBlock = finallyBlock;  // Block
}

var proto = TryCatchListFinallyStatement.prototype = new Statement();
proto.constructor = TryCatchListFinallyStatement;

proto.toString = function ( ) {
    var buf = [ labelsToString.call(this),
                "try ", this.tryBlock, "\n" ];
    this.cdr.forEach(function( it ){
        buf.push(it);
    });
    buf.push("finally ", this.finallyBlock);
    return buf.join("");
};


//@export CatchGuard
function CatchGuard ( variable, cond, block, lineno, source ) {
    this.variable = variable;  // Identifier
    this.cond     = cond;      // Expression or null (null means this is default catch clause)
    this.block    = block;     // Block
    this.lineno   = lineno;    // Number (optional)
    this.source   = source;    // String (optional)
}

CatchGuard.prototype.toString = function ( ) {
    var buf = ["catch ( ", this.variable];
    if ( this.cond ) buf.push(" if ", this.cond);
    buf.push(" )", this.block);
    return buf.join("");
};


//@export FunctionDeclaration
function FunctionDeclaration ( labels, name, params, body, lineno, source ) {
    Statement.call(this, labels, lineno, source);
    this.name   = name;    // Identifier
    this.params = params;  // array of Identifier
    this.cdr    = body;    // cons-list of Statement
}

var proto = FunctionDeclaration.prototype = new Statement();
proto.constructor = FunctionDeclaration;

proto.toString = function ( ) {
    var buf = [ "function ", this.name,
                " (", this.params.join(", "), ") {\n" ];
    this.cdr.forEach(function( it ){
        buf.push(it, "\n");
    });
    buf.push("}");
    return buf.join("");
};

