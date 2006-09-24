//@esmodpp
//@version 0.0.0
//@namespace Concurrent.Thread.Compiler

//@require Concurrent.Thread
//@require Concurrent.Thread.Compiler.Statement
//@require Concurrent.Thread.Compiler.Expression
//@require Concurrent.Thread.Compiler.IntermediateLanguage

//@require Data.Cons
//@with-namespace Data.Cons



var Ce = "$Concurrent_Thread_Compiler_CeConvert";

var PREFIX          = "$Concurrent_Thread_";
var intermediateVar = new Identifier(PREFIX + "intermediate");
var nullFunctionVar = new Identifier(PREFIX + "null_function");
var undefinedExp    = new VoidExpression(new NumberLiteral(0));


//@export CeConvert
function CeConvert ( pack, func ) {
    for ( var c=func.cdr;  c !== nil;  c=c.cdr ) {
        c.car[Ce](pack, 0);
    }
    func.cdr = pack.head;
    pack.head = pack.tail = nil;
    return func;
}


function pushOut ( pack, exp, top ) {
    if ( exp instanceof CallExpression
      || exp instanceof NewExpression
    ) {
        exp[Ce](pack, top);
        return intermediateVar;
    } else {
        var stack = pack.createStackVar(top);
        var push  = new SimpleAssignExpression(stack, exp);
        (new ExpStatement([], push))[Ce](pack, top);
        return stack;
    }
};


Label.prototype[Ce] = function ( pack, top ) {
    pack.addStatement(this);
};

ExpStatement.prototype[Ce] = function ( pack, top ) {
    if ( this.exp instanceof CallExpression ) {
        this.exp[Ce](pack, top);
        return;
    }
    if ( this.exp.containsFunctionCall() ) {
        this.exp[Ce](pack, top);
    }
    pack.addStatement(this);
};

GotoStatement.prototype[Ce] = function ( pack, top ) {
    if ( this.ret_val instanceof CallExpression ) {
        this.ret_val = pushOut(pack, this.ret_val, top);
    } else if ( this.ret_val.containsFunctionCall() ) {
        this.ret_val[Ce](pack, top);
    }
    pack.addStatement(this);
};

IfGotoStatement.prototype[Ce] = function ( pack, top ) {
    if ( this.condition instanceof CallExpression ) {
        this.condition = pushOut(pack, this.condition, top++);
    } else if ( this.condition.containsFunctionCall() ) {
        this.condition[Ce](pack, top);
    }
    if ( this.ret_val instanceof CallExpression ) {
        this.ret_val = pushOut(pack, this.ret_val, top++);
    } else if ( this.ret_val.containsFunctionCall() ) {
        this.ret_val[Ce](pack, top);
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
    if ( this.left instanceof Identifier ) {
        // Do nothing.
    }
    else if ( this.left instanceof DotAccessor ) {
        if ( !(this.left.base instanceof StackVariable) ) {
            this.left.base = pushOut(pack, this.left.base, top++);
        }
    }
    else if ( this.left instanceof BracketAccesor ) {
        if ( !(this.left.left instanceof StackVariable) ) {
            this.left.left = pushOut(pack, this.left.left, top++);
        }
        if ( !(this.left.right instanceof StackVariable) ) {
            this.left.right = pushOut(pack, this.left.right, top++);
        }
    }
    else {
        Kit.codeBug("left-hand-side of assignment does not have lvalue");
    }
    if ( this.right instanceof CallExpression ) {
        this.right = pushOut(pack, this.right, top);
    } else if ( this.right.containsFunctionCall() ) {
        this.right[Ce](pack, top);
    }
};

CallExpression.prototype[Ce] = function ( pack, top ) {
    var base, func;
    if ( this.func instanceof Identifier ) {
        this.func = pushOut(pack, this.func, top++);
        base = new NullLiteral();
        func = this.func;
    } else if ( this.func instanceof DotAccessor ) {  
        this.func.base = pushOut(pack, this.func.base, top++);
        base = this.func.base;
        func = this.func;
    } else if ( this.func instanceof BracketAccessor ) {
        this.func.left  = pushOut(pack, this.func.left, top++);
        this.func.right = pushOut(pack, this.func.right, top++);
        base = this.func.left;
        func = this.func;
    } else {
        this.func = pushOut(pack, this.func, top++);
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
    var func = pushOut(pack, this.func, top++);
    for ( var i=this.args.length-1;  i >= 0;  i-- ) {
        if ( this.args[i].containsFunctionCall() ) break;
    }
    for ( var j=0;  j <= i;  j++ ) {
        this.args[i] = pushOut(pack, this.args[i], top++);
    }
    var label1 = pack.createLabel();
    var label2 = pack.createLabel();
    pack.addStatement(
        new IfGotoStatement(
            new AndExpression(
                func,
                new DotAccessor(func, new Identifier(PREFIX+"compiled"))
            ),
            label1.id,
            undefinedExp
        )
    );
    pack.addStatement(
        new GotoStatement(label2.id, new NewExpression(func, this.args))
    );
    pack.addStatement(label1);
    pack.addStatement( new ExpStatement(
        [],
        new SimpleAssignExpression(
            new DotAccessor(
                nullFunctionVar,
                new Identifier("prototype")
            ),
            new DotAccessor(
                func,
                new Identifier("prototype")
            )
        )
    ) );
    pack.addStatement( new CallStatement(
        label2.id,
        new NewExpression(nullFunctionVar, []),
        func,
        this.args
    ) );
    pack.addStatement(label2);
};

