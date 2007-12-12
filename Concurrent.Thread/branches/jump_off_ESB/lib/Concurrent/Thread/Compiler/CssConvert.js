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
//@require Concurrent.Thread

//@require Concurrent.Thread.Compiler.Kit
//@require Concurrent.Thread.Compiler.Statement
//@require Concurrent.Thread.Compiler.Expression

//@require Data.Cons 0.2.0
//@with-namespace Data.Cons



var Css = "Concurrent.Thread.Compiler.CssConvert";


//@export CssConvert
function CssConvert ( func ) {
    return func[Css]();
}


Statement.prototype[Css] = function ( ) {
    Kit.codeBug("unimplemented '" + Css + "' method for: " + this);
};

EmptyStatement.prototype[Css] = function ( ) {
    return this;
};

Block.prototype[Css] = function ( ) {
    var block = new Block(this.labels, nil(), this.lineno, this.source);
    var last  = block;
    for ( var c=this.cdr;  !c.isNil();  c=c.cdr ) {
        last = last.cdr = cons(c.car[Css](), last.cdr);
    }
    return block;
};

ExpStatement.prototype[Css] = function ( ) {
    return new ExpStatement(this.labels, this.exp[Css](), this.lineno, this.source);
};

VarStatement.prototype[Css] = function ( ) {
    var decls = [];
    for ( var i=0;  i < this.decls.length;  i++ ) {
        decls[i] = {
            id : this.decls[i].id,
            exp: this.decls[i].exp ? this.decls[i].exp[Css]() : null
        };
    }
    return new VarStatement(this.labels, decls, this.lineno, this.source);
};

IfStatement.prototype[Css] = function ( ) {
    return new IfStatement(this.labels, this.cond[Css](), this.body[Css](), this.lineno, this.source);
};

IfElseStatement.prototype[Css] = function ( ) {
    return new IfElseStatement(this.labels, this.cond[Css](), this.tbody[Css](), this.fbody[Css](), this.lineno, this.source);
};

DoWhileStatement.prototype[Css] = function ( ) {
    return new DoWhileStatement(this.labels, this.body[Css](), this.cond[Css](), this.lineno, this.source);
};

WhileStatement.prototype[Css] = function ( ) {
    return new WhileStatement(this.labels, this.cond[Css](), this.body[Css](), this.lineno, this.source);
};

ForStatement.prototype[Css] = function ( ) {
    return new ForStatement(this.labels, this.init[Css](), this.cond[Css](), this.incr[Css](), this.body[Css](), this.lineno, this.source);
};

ForVarStatement.prototype[Css] = function ( ) {
    var decls = [];
    for ( var i=0;  i < this.decls.length;  i++ ) {
        decls[i] = {
            id : this.decls[i].id,
            exp: this.decls[i].exp ? this.decls[i].exp[Css]() : null
        };
    }
    return new ForVarStatement(this.labels, decls, this.cond[Css](), this.incr[Css](), this.body[Css](), this.lineno, this.source);
};

ForInStatement.prototype[Css] = function ( ) {
    return new ForInStatement(this.labels, this.lhs[Css](), this.exp[Css](), this.body[Css](), this.lineno, this.source);
};

ForInVarStatement.prototype[Css] = function ( ) {
    var decl = {
        id : this.decl.id,
        exp: this.decl.exp ? this.decl.exp[Css]() : null
    };
    return new ForInVarStatement(this.labels, decl, this.exp[Css](), this.body[Css](), this.lineno, this.source);
};

ForEachStatement.prototype[Css] = function ( ) {
    return new ForEachStatement(this.labels, this.lhs[Css](), this.exp[Css](), this.body[Css](), this.lineno, this.source);
};

ForEachVarStatement.prototype[Css] = function ( ) {
    var decl = {
        id : this.decl.id,
        exp: this.decl.exp ? this.decl.exp[Css]() : null
    };
    return new ForEachVarStatement(this.labels, decl, this.exp[Css](), this.body[Css](), this.lineno, this.source);
};

ContinueStatement.prototype[Css] = function ( ) {
    return this;
};

BreakStatement.prototype[Css] = function ( ) {
    return this;
};

ReturnStatement.prototype[Css] = function ( ) {
    if ( !this.exp ) return this;
    return new ReturnStatement(this.labels, this.exp[Css](), this.lineno, this.source);
};

WithStatement.prototype[Css] = function ( ) {
    return new WithStatement(this.labels, this.exp[Css](), this.body[Css](), this.lineno, this.source);
};

SwitchStatement.prototype[Css] = function ( ) {
    var stmt = new SwitchStatement(this.labels, this.exp[Css](), nil(), this.lineno, this.source);
    var last = stmt;
    for ( var c=this.cdr;  !c.isNil();  c=c.cdr ) {
        last = last.cdr = cons(c.car[Css](), last.cdr);
    }
    return stmt;
};

CaseClause.prototype[Css] = function ( ) {
    var clause = new CaseClause(this.exp[Css](), nil(), this.lineno, this.source);
    var last = clause;
    for ( var c=this.cdr;  !c.isNil();  c=c.cdr ) {
        last = last.cdr = cons(c.car[Css](), last.cdr);
    }
    return clause;
};

DefaultClause.prototype[Css] = function ( ) {
    var clause = new DefaultClause(nil(), this.lineno, this.source);
    var last = clause;
    for ( var c=this.cdr;  !c.isNil();  c=c.cdr ) {
        last = last.cdr = cons(c.car[Css](), last.cdr);
    }
    return clause;
};

ThrowStatement.prototype[Css] = function ( ) {
    return new ThrowStatement(this.labels, this.exp[Css](), this.lineno, this.source);
};

TryCatchStatement.prototype[Css] = function ( ) {
    return new TryCatchStatement(this.labels, this.tryBlock[Css](), this.variable, this.catchBlock[Css](), this.lineno, this.source);
};

TryFinallyStatement.prototype[Css] = function ( ) {
    return new TryFinallyStatement(this.labels, this.tryBlock[Css](), this.finallyBlock[Css](), this.lineno, this.source);
};

TryCatchFinallyStatement.prototype[Css] = function ( ) {
    return new TryCatchFinallyStatement(this.labels, this.tryBlock[Css](), this.variable, this.catchBlock[Css](), this.finallyBlock[Css](), this.lineno, this.source);
};

TryCatchListStatement.prototype[Css] = function ( ) {
    if ( this.cdr.isNil() ) {  // no more catch-guard
        var block = this.tryBlock[Css]();
        block.labels = this.labels;
        return block;
    } else if ( this.cdr.car.cond ) {  // one or more qualified catch-guard
        var guard = this.cdr.car;
        var catchBlock = new IfElseStatement(
            [],
            guard.cond[Css](),
            guard.block[Css](),
            (new TryCatchListStatement(
                [],
                new Block([], cons(new ThrowStatement([], guard.variable), nil())),
                this.cdr.cdr,
                this.cdr.cdr.lineno, this.cdr.cdr.source
            ))[Css](),
            guard.lineno, guard.source
        );
        return new TryCatchStatement(
            this.labels,
            this.tryBlock[Css](),
            guard.variable,
            new Block([], cons(catchBlock, nil()))
        );
    } else {  // (only one) default catch-guard
        var guard = this.cdr.car;
        return new TryCatchStatement(this.labels, this.tryBlock[Css](), guard.variable, guard.block[Css](), this.lineno, this.source);
    }
};

TryCatchListFinallyStatement.prototype[Css] = function ( ) {
    var tryBlock = (new TryCatchListStatement([], this.tryBlock, this.cdr, this.lineno, this.source))[Css]();
    return new TryFinallyStatement(
        this.labels,
        new Block([], cons(tryBlock, nil()), this.lineno, this.source),
        this.finallyBlock[Css](),
        this.lineno, this.source
    );
};

FunctionDeclaration.prototype[Css] = function ( ) {
    var func = new FunctionDeclaration(this.labels, this.name, this.param, nil(), this.lineno, this.source);
    var last = func;
    for ( var c=this.cdr;  !c.isNil();  c=c.cdr ) {
        last = last.cdr = cons(c.car[Css](), last.cdr);
    }
    return func;
};



Expression.prototype[Css] = Statement.prototype[Css];

UnaryExpression.prototype[Css] = function ( ) {
    return new this.constructor( this.exp[Css]() );
};

BinaryExpression.prototype[Css] = function ( ) {
    return new this.constructor(this.left[Css](), this.right[Css]());
};

Literal.prototype[Css]        = 
Identifier.prototype[Css]     = 
ThisExpression.prototype[Css] = 
Elision.prototype[Css]        = function ( ) {
    return this;
};

ArrayInitializer.prototype[Css] = function ( ) {
    var elems = [];
    for ( var i=0;  i < this.elems.length;  i++ ) {
        elems[i] = this.elems[i][Css]();
    }
    return new ArrayInitializer(elems);
};

ObjectInitializer.prototype[Css] = function ( ) {
    var pairs = [];
    for ( var i=0;  i < this.pairs.length;  i++ ) {
        pairs[i] = {prop:this.pairs[i].id, exp:this.pairs[i].exp[Css]()};
    }
    return new ObjectInitializer(pairs);
};

FunctionExpression.prototype[Css] = function ( ) {
    var func = new FunctionExpression(this.name, this.params, nil());
    var last = func;
    for ( var c=this.cdr;  !c.isNil();  c=c.cdr ) {
        last = last.cdr = cons(c.car[Css](), last.cdr);
    }
    return func;
};

DotAccessor.prototype[Css] = function ( ) {
    return new DotAccessor(this.base[Css](), this.prop);
};

NewExpression.prototype[Css]  =
CallExpression.prototype[Css] = function ( ) {
    var args = [];
    for ( var i=0;  i < this.args.length;  i++ ) {
        args[i] = this.args[i][Css]();
    }
    return new this.constructor(this.func[Css](), args);
};

