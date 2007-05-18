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
//@require Concurrent.Thread.Compiler.Statement
//@require Concurrent.Thread.Compiler.IdentifierSet
//@require Concurrent.Thread.Compiler.IntermediateLanguage

//@require Data.Cons.List
//@require Data.Cons.Util
//@with-namespace Data.Cons
//@with-namespace Data.Cons.Util

var IL = IntermediateLanguage;


var Cv = "$Concurrent_Thread_Compiler_CvConvert";


//@export CvConvert
function CvConvert ( func ) {
    var vars  = new IdentifierSet()
    function add_vars ( /* variable arguments */ ) {
        return vars.add.apply(vars, arguments);
    }
    var decls     = cons(null, nil());
    var add_decls = adder(decls);
    for ( var c=func.body;  !c.isNil();  c=c.cdr ) {
        c.car = c.car[Cv](add_vars, add_decls);
    }
    return new IL.Function(func.name, func.params, vars.toArray(), concat(decls, func.body).cdr);
}



Statement.prototype[Cv] = function ( add_vars, add_decls ) {
    return this;
};


Block.prototype[Cv] = function ( add_vars, add_decls ) {
    for ( var c=this.body;  !c.isNil();  c=c.cdr ) {
        c.car = c.car[Cv](add_vars, add_decls);
    }
    return this;
};


VarStatement.prototype[Cv] = function ( add_vars, add_decls ) {
    var assigns = [];
    for ( var i=0;  i < this.decls.length;  i++ ) {
        add_vars(this.decls[i].id);
        if ( this.decls[i].exp ) {
            assigns.push( new SimpleAssignExpression(this.decls[i].id, this.decls[i].exp) );
        }
    }
    if ( !assigns.length ) {
        return new EmptyStatement([], this.lineno, this.source);
    } else {
        var exp = assigns[0];
        for ( var i=1;  i < assigns.length;  i++ ) {
            exp = new CommaExpression(exp, assigns[i]);
        }
        return new ExpStatement([], exp, this.lineno, this.source);
    }
};


IfStatement.prototype[Cv] = function ( add_vars, add_decls ) {
    this.body = this.body[Cv](add_vars, add_decls);
    return this;
};


IfElseStatement.prototype[Cv] = function ( add_vars, add_decls ) {
    this.tbody = this.tbody[Cv](add_vars, add_decls);
    this.fbody = this.fbody[Cv](add_vars, add_decls);
    return this;
};


DoWhileStatement.prototype[Cv] = IfStatement.prototype[Cv];


WhileStatement.prototype[Cv] = IfStatement.prototype[Cv];


ForStatement.prototype[Cv] = IfStatement.prototype[Cv];


ForVarStatement.prototype[Cv] = function ( add_vars, add_decls ) {
    var init = (new VarStatement([], this.decls))[Cv](add_vars, add_decls);
    if ( init instanceof EmptyStatement ) {
        init = null;
    } else {
        init = init.exp;
    }
    return new ForStatement(this.labels, init, this.cond, this.incr, this.body[Cv](add_vars, add_decls), this.lineno, this.source);
};


ForInStatement.prototype[Cv] = IfStatement.prototype[Cv];


ForInVarStatement.prototype[Cv] = function ( add_vars, add_decls ) {
    add_vars(this.decl.id);
    var for_in = new ForInStatement(this.labels, this.decl.id, this.exp, this.body[Cv](add_vars, add_decls), this.lineno, this.source);
    if ( this.decl.exp ) {
        return new Block([], list(
            new ExpStatement([], new SimpleAssignExpression(this.decl.id, this.decl.exp), this.lineno, this.source),
            for_in
        ), this.lineno, this.source);
    } else {
        return for_in;
    }
};


ForEachStatement.prototype[Cv] = IfStatement.prototype[Cv];


ForEachVarStatement.prototype[Cv] = ForInVarStatement.prototype[Cv];


WithStatement.prototype[Cv] = IfStatement.prototype[Cv];


SwitchStatement.prototype[Cv] = function ( add_vars, add_decls ) {
    for ( var c=this.clauses;  !c.isNil();  c=c.cdr ) {
        c.car = c.car[Cv](add_vars, add_decls);
    }
    return this;
};


CaseClause.prototype[Cv] = Block.prototype[Cv];


DefaultClause.prototype[Cv] = Block.prototype[Cv];


TryCatchStatement.prototype[Cv] = function ( add_vars, add_decls ) {
    add_vars(this.variable);
    this.tryBlock   = this.tryBlock[Cv](add_vars, add_decls);
    this.catchBlock = this.catchBlock[Cv](add_vars, add_decls);
    return this;
};


TryFinallyStatement.prototype[Cv] = function ( add_vars, add_decls ) {
    this.tryBlock     = this.tryBlock[Cv](add_vars, add_decls);
    this.finallyBlock = this.finallyBlock[Cv](add_vars, add_decls);
    return this;
};


TryCatchFinallyStatement.prototype[Cv] = function ( add_vars, add_decls ) {
    add_vars(this.variable);
    this.tryBlock     = this.tryBlock[Cv](add_vars, add_decls);
    this.catchBlock   = this.catchBlock[Cv](add_vars, add_decls);
    this.finallyBlock = this.finallyBlock[Cv](add_vars, add_decls);
    return this;
};


FunctionDeclaration.prototype[Cv] = function ( add_vars, add_decls ) {
    add_vars(this.name);
    add_decls( new ExpStatement(
        [],
        new SimpleAssignExpression(
            this.name,
            new FunctionExpression(null, this.params, this.body)
        ),
        this.lineno,
        this.source
    ));
    return new EmptyStatement([]);
};

