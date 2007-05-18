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
//@version 0.0.0
//@namespace Concurrent.Thread.Compiler

//@require Concurrent.Thread
//@require Concurrent.Thread.Compiler.Kit
//@require Concurrent.Thread.Compiler.Statement
//@require Concurrent.Thread.Compiler.IdentifierMap
//@require Concurrent.Thread.Compiler.IntermediateLanguage

var IL = Concurrent.Thread.Compiler.IntermediateLanguage;

//@require Data.Cons 0.2.0
//@with-namespace Data.Cons



var Cs = "Concurrent.Thread.Compiler.CsConvert";
var STACK_VAR = "$Concurrent_Thread_stack";

var undefinedExp = new VoidExpression(new NumberLiteral(0));
var emptyLabel   = new Identifier("");

function isStackVar ( v ) {
    return v instanceof Identifier
        && v.valueOf().match(/^$Concurrent_Thread_stack/);
}


function Context ( ) {
    this.stackVars = [];
    this.contBreak    = new IdentifierMap();
    this.contContinue = new IdentifierMap();
    this.contReturn   = "return";
    this.contThrow    = "throw";
    this.scopes       = [];
}

var proto = Context.prototype;

proto.getStackVar = function ( n ) {
    n = Math.floor(n);
    if ( isNaN(n) || n < 0 ) Kit.codeBug("must be positive integer");
    for ( var i=this.stackVars.length;  i <= n;  i++ ) {
        this.stackVars[i] = new Identifier(STACK_VAR + n);
    }
    return this.stackVars[n];
};

proto.putBreakLabels = function ( labels, cont ) {
    for ( var i=0;  i < labels.length;  i++ ) {
        this.contBreak.put(labels[i], cont);
    }
};

proto.removeBreakLabels = function ( labels ) {
    for ( var i=0;  i < labels.length;  i++ ) {
        this.contBreak.remove(labels[i]);
    }
};

proto.putContinueLabels = function ( labels, cont ) {
    for ( var i=0;  i < labels.length;  i++ ) {
        this.contContinue.put(labels[i], cont);
    }
};

proto.removeContinueLabels = function ( labels ) {
    for ( var i=0;  i < labels.length;  i++ ) {
        this.contContinue.remove(labels[i]);
    }
};

proto.getScopes = function ( ) {
    return this.scopes.slice(0, this.scopes.length);
};



//@export CsConvert
function CsConvert ( func ) {
    var context = new Context();
    var last_block = new IL.GotoBlock([], nil(), undefinedExp, "return", "throw");
    func.body  = CsStatements(func.body, list(last_block), context, 0);
    func.start = func.body.car;
    func.vars  = func.vars.concat(context.stackVars);
    return func;
}


function CsStatements ( stmts, follows, ctxt, sttop ) {
    if ( stmts.isNil() ) return follows;
    follows = CsStatements(stmts.cdr, follows, ctxt, sttop);
    return stmts.car[Cs](follows, ctxt, sttop);
}


EmptyStatement.prototype[Cs] = function ( follows, ctxt, sttop ) {
    return follows;
};

Block.prototype[Cs] = function ( follows, ctxt, sttop ) {
    follows = cons( new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, follows.car, ctxt.contThrow), follows);
    ctxt.putBreakLabels(this.labels, follows.car);
    try {
        return CsStatements(this.body, follows, ctxt, sttop);
    } finally {
        ctxt.removeBreakLabels(this.labels);
    }
};

ExpStatement.prototype[Cs] = function ( follows, ctxt, sttop ) {
    return this.exp[Cs](follows, ctxt, sttop);
};

IfStatement.prototype[Cs] = function ( follows, ctxt, sttop ) {
    var next_block = follows.car;
    follows = cons( new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, next_block, ctxt.contThrow), follows);
    ctxt.putBreakLabels(this.labels, next_block);
    try {
        follows = this.body[Cs](follows, ctxt, sttop);
        follows.prependStatement( new CondStatement(new NotExpression(ctxt.getStackVar(sttop)), next_block) );
        return this.cond[Cs](follows, ctxt, sttop);
    } finally {
        ctxt.removeBreakLabels(this.labels);
    }
};

IfElseStatement.prototype[Cs] = function ( follows, ctxt, sttop ) {
    var next_block = follows.car;
    follows = cons( new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, next_block, ctxt.contThrow), follows);
    ctxt.putBreakLabels(this.labels, next_block);
    try {
        follows = this.tbody[Cs](follows, ctxt, sttop);
        var true_block = follows.car;
        follows = cons( new IL.GotoBlock(ctxt.getScopes(), nil(), undefiendExp, next_block, ctxt.contThrow), follows);
        follows = this.fbody[Cs](follows, ctxt, sttop);
        follows.car.prependStatement( new IL.CondStatement(ctxt.getStackVar(sttop), true_block) );
        return this.cond[Cs](follows, ctxt, sttop);
    } finally {
        ctxt.removeBreakLabels(this.labels);
    }
};

DoWhileStatement.prototype[Cs] = function ( follows, ctxt, sttop ) {
    var next_block     = follows.car;
    var first_block    = new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, null, ctxt.contThrow);
    follows = cons(new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, next_block, ctxt.contThrow), follows);
    if ( this.cond.containsFunctionCall() ) {
        follows.car.prependStatement( new IL.CondStatement(ctxt.getStackVar(sttop), first_block) );
        follows = this.cond[Cs](follows, ctxt, sttop);
    } else {
        follows.car.prependStatement( new IL.CondStatement(this.cond, first_block) );
    }
    var continue_block = follows.car;
    follows = cons( new IL.GotoStatement(ctxt.getScopes(), undefinedExp, follows.car, ctxt.contThrow), follows );
    ctxt.putBreakLabels(this.labels, next_block);
    ctxt.putBreakLabels([emptyLabel], next_block);
    ctxt.putContinueLabels(this.labels, continue_block);
    ctxt.putContinueLabels([emptyLabel], continue_lock);
    try {
        follows = this.body[Cs](follows, ctxt, sttop);
    } finally {
        ctxt.removeBreakLabels(this.labels);
        ctxt.removeBreakLabels([emptyLabel]);
        ctxt.removeContinueLabels(this.labels);
        ctxt.removeContinueLabels([emptyLabel]);
    }
    first_block.target = follows.car;
    return cons(first_block, follows);
};

WhileStatement.prototype[Cs] = function ( follows, ctxt, sttop ) {
    var next_block  = follows.car;
    var first_block = new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, null, ctxt.contThrow);
    follows = cons( new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, first_block, ctxt.contThrow), follows );
    ctxt.putBreakLabels(this.labels, next_block);
    ctxt.putBreakLabels([emptyLabel], next_block);
    ctxt.putContinueLabels(this.labels, first_block);
    ctxt.putContinueLabels([emptyLabel], first_block);
    try {
        follows = this.body[Cs](follows, ctxt, sttop);
    } finally {
        ctxt.removeBreakLabels(this.labels);
        ctxt.removeBreakLabels([emptyLabel]);
        ctxt.removeContinueLabels(this.labels);
        ctxt.removeContinueLabels([emptyLabel]);
    }
    if ( this.cond.containsFunctionCall() ) {
        follows.car.prependStatement( new IL.CondStatement(new NotExpression(ctxt.getStackVar(sttop)), next_block) );
        follows = this.cond[Cs](follows, ctxt, sttop);
    } else {
        follows.car.prependStatement( new IL.CondStatement(new NotExpression(this.cond), next_block) );
    }
    first_block.target = follows.car;
    return cons(first_block, follows);
};

ForStatement.prototype[Cs] = function ( follows, ctxt, sttop ) {
    var next_block = follows.car;
    var loop_block = new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, null, ctxt.contThrow);
    var continue_block = new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, loop_block, ctxt.contThrow);
    follows = cons(continue_block, follows);
    if ( this.incr ) follows = this.incr[Cs](follows, ctxt, sttop);
    follows = cons(new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, follows.car, ctxt.contThrow), follows);
    ctxt.putBreakLabels(this.labels, next_block);
    ctxt.putBreakLabels([emptyLabel], next_block);
    ctxt.putContinueLabels(this.labels, loop_block);
    ctxt.putContinueLabels([emptyLabel], loop_block);
    try {
        follows = this.body[Cs](follows, ctxt, sttop);
    } finally {
        ctxt.removeBreakLabels(this.labels);
        ctxt.removeBreakLabels([emptyLabel]);
        ctxt.removeContinueLabels(this.labels);
        ctxt.removeContinueLabels([emptyLabel]);
    }
    if ( this.cond ) {
        if ( this.cond.containsFunctionCall() ) {
            follows.car.prependStatement( new IL.CondStatement(new NotExpression(ctxt.getStackVar(sttop)), next_block) );
            follows = this.cond[Cs](follows, ctxt, sttop);
        } else {
            follows.car.prependStatement( new IL.CondStatement(new NotExpression(this.cond), next_block) );
        }
    }
    loop_block.target = follows.car;
    follows = cons( loop_block, follows );
    follows = cons( new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, follows.car, ctxt.contThrow), follows);
    if ( this.init ) {
        follows = this.init[Cs](follows, ctxt, sttop);
    }
    return follows;
};

ContinueStatement.prototype[Cs] = function ( follows, ctxt, sttop ) {
    return cons(
        new IL.GotoBlock(
            ctxt.getScopes(),
            nil(),
            undefinedExp,
            ctxt.contContinue.get( this.target ? this.target : emptyLabel ),
            ctxt.contThrow
        ),
        follows
    );
};

BreakStatement.prototype[Cs] = function ( follows, ctxt, sttop ) {
    ctxt.putBreakLabels(this.labels, follows.car);
    try {
        return cons(
            new IL.GotoBlock(
                ctxt.getScopes(),
                nil(),
                undefinedExp,
                ctxt.contBreak.get( this.target ? this.target : emptyLabel ),
                ctxt.contThrow
            ),
            follows
        );
    } finally {
        ctxt.removeBreakLabels(this.labels);
    }
};

ReturnStatement.prototype[Cs] = function ( follows, ctxt, sttop ) {
    if ( this.exp.containsFunctionCall() ) {
        follows = cons(new IL.GotoBlock(ctxt.getScopes(), nil(), ctxt.getStackVar(sttop), ctxt.contReturn, ctxt.contThrow), follows);
        return this.exp[Cs](follows, ctxt, sttop);
    } else {
        return cons(new IL.GotoBlock(ctxt.getScopes(), nil(), this.exp, ctxt.contReturn, ctxt.contThrow), follows);
    }
};

ThrowStatement.prototype[Cs] = function ( follows, ctxt, sttop ) {
    if ( this.exp.containsFunctionCall() ) {
        follows = cons(new IL.GotoBlock(ctxt.getScopes(), nil(), ctxt.getStackVar(sttop), ctxt.contThrow, ctxt.contThrow), follows);
        return this.exp[Cs](follows, ctxt, sttop);
    } else {
        return cons(new IL.GotoBlock(ctxt.getScopes(), nil(), this.exp, ctxt.contThrow, ctxt.contThrow), follows);
    }
};

TryCatchStatement.prototype[Cs] = function ( follows, ctxt, sttop ) {
    var next_block = follows.car;
    follows = cons(new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, next_block, ctxt.contThrow), follows);
    follows = this.catchBlock[Cs](follows, ctxt, sttop);
    follows.car.prependStatement( new IL.RecvStatement(this.variable) );
    var storeContThrow = ctxt.contThrow;
    ctxt.contThrow = follows.car;
    try {
        follows = cons(new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, next_block, ctxt.contThrow), follows);
        return this.tryBlock[Cs](follows, ctxt, sttop);
    } finally {
        ctxt.contThrow = storeContThrow;
    }
};



function make_assign ( left, right ) {
    return new IL.ExpStatement( new SimpleAssignExpression(left, right) );
}

Expression.prototype[Cs] = function ( follows, ctxt, sttop ) {
    follows.car.prependStatement( make_assign(ctxt.getStackVar(sttop), this) );
    return follows;
};

UnaryExpression.prototype[Cs] = function ( follows, ctxt, sttop ) {
    if ( this.exp.containsFunctionCall() ) {
        follows.car.prependStatement( make_assign(ctxt.getStackVar(sttop), new this.constructor(ctxt.getStackVar(sttop))) );
        return this.exp[Cs](follows, ctxt, sttop);
    } else {
        return Expression.prototype[Cs].apply(this, arguments);
    }
};

BinaryExpression.prototype[Cs] = function ( follows, ctxt, sttop ) {
    if ( this.right.containsFunctionCall() ) {
        follows.car.prependStatement( make_assign(
            ctxt.getStackVar(sttop),
            new this.constructor(ctxt.getStackVar(sttop), ctxt.getStackVar(sttop+1))
        ) );
        follows = this.right[Cs](follows, ctxt, sttop+1);
        return this.left[Cs](follows, ctxt, sttop);
    } else if ( this.left.containsFunctionCall() ) {
        follows.car.prependStatement( make_assign(
            ctxt.getStackVar(sttop),
            new this.constructor(ctxt.getStackVar(sttop), this.right)
        ) );
        return this.left[Cs](follows, ctxt, sttop);
    } else {
        return Expression.prototype[Cs].apply(this, arguments);
    }
};


function CsReference ( exp, ctxt, sttop, rest ) {
    if ( exp instanceof DotAccessor ) {
        var e = new DotAccessor(ctxt.getStackVar(sttop), exp.prop);
        var follows = rest(e, sttop+1);
        return exp.base[Cs](follows, ctxt, sttop);
    } else if ( exp instanceof BracketAccessor ) {
        var e = new BracketAccessor(ctxt.getStackVar(sttop), ctxt.getStackVar(sttop+1));
        var follows = rest(e, sttop+2);
        follows = exp.right[Cs](follows, ctxt, sttop+1);
        return exp.left[Cs](follows, ctxt, sttop);
    } else if ( exp instanceof Identifier ) {
        return rest(exp, sttop);
    } else {
        var follows = rest(ctxt.getStackVar(sttop), sttop+1);
        return exp[Cs](follows, ctxt, sttop);
    }
}

CallExpression.prototype[Cs] = function ( follows, ctxt, sttop ) {
    var self = this;
    return CsReference(this.func, ctxt, sttop, function ( func, sttop2 ) {
        for ( var asis_from=self.args.length-1;  asis_from >= 0;  asis_from-- ) {
            if ( self.args[asis_from].containsFunctionCall() ) break;
        }
        asis_from++;
        var args = [];
        for ( var i=0;  i < asis_from;  i++ ) {
            args[i] = ctxt.getStackVar(sttop2+i);
        }
        for ( ;  i < self.args.length;  i++ ) {
            args[i] = self.args[i];
        }
        follows.car.prependStatement( new IL.RecvStatement(ctxt.getStackVar(sttop)) );
        follows = cons( new IL.CallBlock(
                            ctxt.getScopes(),
                            nil(),
                            func instanceof DotAccessor     ? func.base :
                            func instanceof BracketAccessor ? func.left : new NullLiteral(),
                            func,
                            args,
                            follows.car,
                            ctxt.contThrow
                        ), follows );
        for ( var i=asis_from-1;  i >= 0;  i-- ) {
            follows = self.args[i][Cs](follows, ctxt, sttop2+i);
        }
        return follows;
    });
};

NewExpression.prototype[Cs] = function ( follows, ctxt, sttop ) {
    for ( var asis_from=this.args.length-1;  asis_from >= 0;  asis_from-- ) {
        if ( this.args[asis_from].containsFunctionCall() ) break;
    }
    asis_from++;
    var args = [];
    for ( var i=0;  i < asis_from;  i++ ) {
        args[i] = ctxt.getStackVar(sttop+1+i);
    }
    for ( ;  i < this.args.length;  i++ ) {
        args[i] = this.args[i];
    }
    follows.car.prependStatement( new IL.RecvStatement(ctxt.getStackVar(sttop)) );
    follows = cons( new IL.NewBlock(
                        ctxt.getScopes(),
                        nil(),
                        ctxt.getStackVar(sttop),
                        args,
                        follows.car,
                        ctxt.contThrow
                    ), follows );
    for ( var i=asis_from-1;  i >= 0;  i-- ) {
        follows = this.args[i][Cs](follows, ctxt, sttop+1+i);
    }
    this.func[Cs](follows, ctxt, sttop);
    return follows;
};

AssignExpression.prototype[Cs] = function ( follows, ctxt, sttop ) {
    var self = this;
    if ( this.right.containsFunctionCall() ) {
        return CsReference(this.left, ctxt, sttop, function ( left, sttop2 ) {
            follows.car.prependStatement( make_assign(
                ctxt.getStackVar(sttop),
                new self.constructor(left, ctxt.getStackVar(sttop2))
            ) );
            return self.right[Cs](follows, ctxt, sttop2);
        });
    } else if ( this.left.containsFunctionCall() ) {
        return CsReference(this.left, ctxt, sttop, function ( left, sttop2 ) {
            follows.car.prependStatement( make_assign(
                ctxt.getStackVar(sttop),
                new self.constructor(left, self.right)
            ) );
            return follows;
        });
    } else {
        return Expression.prototype[Cs].apply(this, arguments);
    }
};

AndExpression.prototype[Cs] = function ( follows, ctxt, sttop ) {
    if ( this.right.containsFunctionCall() ) {
        var next_block = follows.car;
        follows = cons( new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, next_block, ctxt.contThrow), follows );
        follows = this.right[Cs](follows, ctxt, sttop);
        follows.car.prependStatement( new IL.CondStatement(new NotExpression(ctxt.getStackVar(sttop)), next_block) );
        return this.left[Cs](follows, ctxt, sttop);
    } else if ( this.left.containsFunctionCall() ) {
        follows.car.prependStatement( make_assign(ctxt.getStackVar(sttop), new AndExpression(ctxt.getStackVar(sttop), this.right)) );
        return this.left[Cs](follows, ctxt, sttop);
    } else {
        return Expression.prototype[Cs].apply(this, arguments);
    }
};

OrExpression.prototype[Cs] = function ( follows, ctxt, sttop ) {
    if ( this.right.containsFunctionCall() ) {
        var next_block = follows.car;
        follows = cons( new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, next_block, ctxt.contThrow), follows );
        follows = this.right[Cs](follows, ctxt, sttop);
        follows.car.prependStatement( new IL.CondStatement(ctxt.getStackVar(sttop), next_block) );
        return this.left[Cs](follows, ctxt, sttop);
    } else if ( this.left.containsFunctionCall() ) {
        follows.car.prependStatement( make_assign(ctxt.getStackVar(sttop), new AndExpression(ctxt.getStackVar(sttop), this.right)) );
        return this.left[Cs](follows, ctxt, sttop);
    } else {
        return Expression.prototype[Cs].apply(this, arguments);
    }
};

ConditionalExpression.prototype[Cs] = function ( follows, ctxt, sttop ) {
    if ( this.texp.containsFunctionCall() || this.fexp.containsFunctionCall() ) {
        var next_block = follows.car;
        follows = cons( new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, next_block, ctxt.contThrow), follows );
        follows = this.texp[Cs](follows, ctxt, sttop);
        var true_block = follows.car;
        follows = cons( new IL.GotoBlock(ctxt.getScopes(), nil(), undefinedExp, next_block, ctxt.contThrow), follows );
        follows = this.fexp[Cs](follows, ctxt, sttop);
        follows.car.prependStatement(new IL.CondStatement(ctxt.getStackVar(sttop), true_block));
        return this.cond[Cs](follows, ctxt, sttop);
    } else if ( this.cond.containsFunctionCall() ) {
        follows.car.prependStatement( make_assign(ctxt.getStackVar(sttop), new ConditionalExpression(ctxt.getStackVar(sttop), this.texp, this.fexp)) );
        return this.cond[Cs](follows, ctxt, sttop);
    } else {
        return Expression.prototype[Cs].apply(this, arguments);
    }
};
