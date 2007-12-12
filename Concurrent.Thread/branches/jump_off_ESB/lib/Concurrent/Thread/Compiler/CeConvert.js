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
//@require Concurrent.Thread.Compiler.Expression
//@require Concurrent.Thread.Compiler.IntermediateLanguage

//@require Data.Cons 0.2.0
//@with-namespace Data.Cons



var Ce = "$Concurrent_Thread_Compiler_CeConvert";


//@export CeConvert
function CeConvert ( pack, func ) {
    for ( var c=func.cdr;  !c.isNil();  c=c.cdr ) {
        c.car[Ce](pack, 0);
    }
    func.cdr = pack.head;
    pack.head = pack.tail = nil();
    return func;
}


function pushOut ( pack, exp, top ) {
    if ( exp instanceof CallExpression
      || exp instanceof NewExpression
    ) {
        exp[Ce](pack, top);
        var stack = pack.createStackVar(top);
        pack.addStatement(new RecieveStatement(stack));
        return stack;
    } else {
        var stack = pack.createStackVar(top);
        (new ILExpStatement(
            new SimpleAssignExpression(stack, exp)
        ))[Ce](pack, top);
        return stack;
    }
}

function pushOutReference ( pack, exp, top ) {
    if ( exp instanceof Identifier
      || exp instanceof Literal
      || exp instanceof ThisExpression
    ) {
        return {exp:exp, stack:0};
    }
    else if ( exp instanceof DotAccessor ) {
        if ( exp.base instanceof Literal
          || exp.base instanceof ThisExpression
          || exp.base instanceof StackVariable
        ) {
            return {exp:exp, stack:0};
        } else {
            exp.base = pushOut(pack, exp.base, top);
            return {exp:exp, stack:1};
        }
    }
    else if ( exp instanceof BracketAccessor ) {
        var inc = 0;
        if ( !(   exp.left instanceof Literal
               || exp.left instanceof ThisExpression
               || exp.left instanceof StackVariable  )
        ) {
            exp.left = pushOut(pack, exp.left, top+inc++);
        }
        if ( !(   exp.right instanceof Literal
               || exp.right instanceof ThisExpression
               || exp.right instanceof StackVariable  )
        ) {
            exp.right = pushOut(pack, exp.right, top+inc++);
        }
        return {exp:exp, stack:inc};
    }
    else {
        return {exp:pushOut(pack, exp, top), stack:1};
    }
}


Label.prototype[Ce] = function ( pack, top ) {
    pack.cont_throw = this.exception;
    pack.addStatement(this);
};


ILExpStatement.prototype[Ce] = function ( pack, top ) {
    if ( this.exp instanceof SimpleAssignExpression ) {
        CeAssign(pack, this.exp, top);
        return;
    }
    if ( this.exp instanceof CallExpression ) {  // Optimization: omit meaningless recieve-statement
        this.exp[Ce](pack, top);
        return;
    }
    if ( this.exp.containsFunctionCall() ) {
        this.exp = pushOut(pack, this.exp, top);
    }
    pack.addStatement(this);
};

function CeAssign ( pack, assign, top ) {
    if ( !assign.left.hasLvalue() ) Kit.codeBug("left-hand-side of assignment does not have lvalue");
    with ( pushOutReference(pack, assign.left, top) ) {
        assign.left = exp;
        top += stack;
    }
    if ( !assign.right.containsFunctionCall() ) {
        pack.addStatement( new ILExpStatement(assign) );
    }
    else if ( assign.right instanceof CallExpression ) {
        assign.right[Ce](pack, top);
        pack.addStatement( new RecieveStatement(assign.left) );
    }
    else if ( assign.right instanceof AndExpression ) {
        var label = pack.createLabel();
        (new ILExpStatement(
            new SimpleAssignExpression(
                assign.left,
                assign.right.left
            )
        ))[Ce](pack, top);
        (new IfThenStatement(
            new NotExpression(assign.left),
            label.id
        ))[Ce](pack, top);
        (new ILExpStatement(
            new SimpleAssignExpression(
                assign.left,
                assign.right.right
            )
        ))[Ce](pack, top);
        pack.addStatement( new GotoStatement(label.id, undefinedExp) );
        pack.addStatement( label );
    }
    else if ( assign.right instanceof OrExpression ) {
        var label = pack.createLabel();
        (new ILExpStatement(
            new SimpleAssignExpression(
                assign.left,
                assign.right.left
            )
        ))[Ce](pack, top);
        (new IfThenStatement(
            assign.left,
            label.id
        ))[Ce](pack, top);
        (new ILExpStatement(
            new SimpleAssignExpression(
                assign.left,
                assign.right.right
            )
        ))[Ce](pack, top);
        pack.addStatement( new GotoStatement(label.id, undefinedExp) );
        pack.addStatement( label );
    }
    else if ( assign.right instanceof ConditionalExpression ) {
        var label1 = pack.createLabel();
        var label2 = pack.createLabel();
        (new IfThenStatement(
            assign.right.cond,
            label1.id
        ))[Ce](pack, top);
        (new ILExpStatement(
            new SimpleAssignExpression(
                assign.left,
                assign.right.fexp
            )
        ))[Ce](pack, top);
        pack.addStatement( new GotoStatement(label2.id, undefinedExp) );
        pack.addStatement( label1 );
        (new ILExpStatement(
            new SimpleAssignExpression(
                assign.left,
                assign.right.texp
            )
        ))[Ce](pack, top);
        pack.addStatement( new GotoStatement(label2.id, undefinedExp) );
        pack.addStatement( label2 );
    }
    else {
        assign.right[Ce](pack, top);
        pack.addStatement( new ILExpStatement(assign) );
    }
}


GotoStatement.prototype[Ce] = function ( pack, top ) {
    if ( this.ret_val.containsFunctionCall() ) {
        this.ret_val = pushOut(pack, this.ret_val, top);
    }
    pack.addStatement(this);
};


IfThenStatement.prototype[Ce] = function ( pack, top ) {
    if ( this.condition.containsFunctionCall() ) {
        this.condition = pushOut(pack, this.condition, top++);
    }
    pack.addStatement(this);
};


RecieveStatement.prototype[Ce] = function ( pack, top ) {
    if ( this.lhs.containsFunctionCall() ) {
        this.lhs = pushOutReference(pack, this.lhs, top).exp;
    }
    pack.addStatement(this);
};



UnaryExpression.prototype[Ce] = function ( pack, top ) {
    this.exp = pushOut(pack, this.exp, top);
};


BinaryExpression.prototype[Ce] = function ( pack, top ) {
    this.left = pushOut(pack, this.left, top++);
    if ( this.right.containsFunctionCall() ) {
        this.right = pushOut(pack, this.right, top);
    }
};


AssignExpression.prototype[Ce] = function ( pack, top ) {
    if ( !this.left.hasLvalue() ) {
        Kit.codeBug("left-hand-side of assignment does not have lvalue");
    }
    with ( pushOutReference(pack, this.left, top) ) {
        this.left = exp;
        top += stack;
    }
    if ( this.right.containsFunctionCall() ) {
        this.right = pushOut(pack, this.right, top);
    }
};


CallExpression.prototype[Ce] = function ( pack, top ) {
    var base, func;
    with ( pushOutReference(pack, this.func, top) ) {
        this.func = exp;
        top += stack;
    }
    if ( this.func instanceof Identifier ) {
        base = new NullLiteral();
        func = this.func;
    } else if ( this.func instanceof DotAccessor ) {  
        base = this.func.base;
        func = this.func;
    } else if ( this.func instanceof BracketAccessor ) {
        base = this.func.left;
        func = this.func;
    } else {
        base = new NullLiteral();
        func = this.func;
    }
    for ( var i=this.args.length-1;  i >= 0;  i-- ) {
        if ( this.args[i].containsFunctionCall() ) break;
    }
    for ( var j=0;  j <= i;  j++ ) {
        this.args[i] = pushOut(pack, this.args[i], top++);
    }
    var label = pack.createLabel();
    pack.addStatement( new CallStatement(label.id, base, func, this.args) );
    pack.addStatement( label );
};


NewExpression.prototype[Ce] = function ( pack, top ) {
    var func;
    if ( this.func.hasSideEffect() ) {
        func = pushOut(pack, this.func, top++);
    } else {
        func = this.func;
    }
    for ( var i=this.args.length-1;  i >= 0;  i-- ) {
        if ( this.args[i].containsFunctionCall() ) break;
    }
    for ( var j=0;  j <= i;  j++ ) {
        this.args[i] = pushOut(pack, this.args[i], top++);
    }
    var label = pack.createLabel();
    pack.addStatement( new NewStatement(
        label.id,
        func,
        this.args
    ) );
    pack.addStatement(label);
};

