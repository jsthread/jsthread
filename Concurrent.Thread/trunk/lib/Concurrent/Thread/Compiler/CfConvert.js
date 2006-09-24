//@esmodpp
//@version 0.0.0
//@namespace Concurrent.Thread.Compiler

//@require Concurrent.Thread
//@require Concurrent.Thread.Compiler.Statement

//@require Data.Cons
//@with-namespace Data.Cons



var Cf = "$Concurrent_Thread_Compiler_CfConvert";


//@export CfConvert
function CfConvert ( pack, func ) {
    for ( var i=0;  i < func.params.length;  i++ ) {
        pack.registerVar(func.params[i]);
    }
    for ( var c=func.cdr;  c !== nil;  c=c.cdr ) {
        c.car = c.car[Cf](pack);
    }
    if ( pack.head === nil ) {
        pack.head = func.cdr;
    } else {
        pack.tail.cdr = func.cdr;
    }
    func.cdr = pack.head;
    pack.head = pack.tail = nil;
    return func;
}



Statement.prototype[Cf] = function ( pack ) {
    return this;
};


Block.prototype[Cf] = function ( pack ) {
    for ( var c=this.cdr;  c !== nil;  c=c.cdr ) {
        c.car = c.car[Cf](pack);
    }
    return this;
};


VarStatement.prototype[Cf] = function ( pack ) {
    var assigns = [];
    for ( var i=0;  i < this.decls.length;  i++ ) {
        pack.registerVar(this.decls[i].id);
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


IfStatement.prototype[Cf] = function ( pack ) {
    this.body = this.body[Cf](pack);
    return this;
};


IfElseStatement.prototype[Cf] = function ( pack ) {
    this.tbody = this.tbody[Cf](pack);
    this.fbody = this.fbody[Cf](pack);
    return this;
};


DoWhileStatement.prototype[Cf] = IfStatement.prototype[Cf];


WhileStatement.prototype[Cf] = IfStatement.prototype[Cf];


ForStatement.prototype[Cf] = IfStatement.prototype[Cf];


ForVarStatement.prototype[Cf] = function ( pack ) {
    var init = (new VarStatement([], this.decls))[Cf](pack);
    if ( init instanceof EmptyStatement ) {
        init = null;
    } else {
        init = init.exp;
    }
    return new ForStatement(this.labels, init, this.cond, this.loop, this.body[Cf](pack), this.lineno, this.source);
};


ForInStatement.prototype[Cf] = IfStatement.prototype[Cf];


ForInVarStatement.prototype[Cf] = function ( pack ) {
    pack.registerVar(this.decl.id);
    return new ForInStatement(this.labels, this.decl.id, this.exp, this.body[Cf](pack), this.lineno, this.source);
};


ForEachStatement.prototype[Cf] = IfStatement.prototype[Cf];


ForEachVarStatement.prototype[Cf] = ForInVarStatement.prototype[Cf];


WithStatement.prototype[Cf] = IfStatement.prototype[Cf];


SwitchStatement.prototype[Cf] = Block.prototype[Cf];


CaseClause.prototype[Cf] = Block.prototype[Cf];


DefaultClause.prototype[Cf] = Block.prototype[Cf];


TryCatchStatement.prototype[Cf] = function ( pack ) {
    pack.registerVar(this.variable);
    this.tryBlock   = this.tryBlock[Cf](pack);
    this.catchBlock = this.catchBlock[Cf](pack);
    return this;
};


TryFinallyStatement.prototype[Cf] = function ( pack ) {
    this.tryBlock     = this.tryBlock[Cf](pack);
    this.finallyBlock = this.finallyBlock[Cf](pack);
    return this;
};


TryCatchFinallyStatement.prototype[Cf] = function ( pack ) {
    pack.registerVar(this.variable);
    this.tryBlock     = this.tryBlock[Cf](pack);
    this.catchBlock   = this.catchBlock[Cf](pack);
    this.finallyBlock = this.finallyBlock[Cf](pack);
    return this;
};


FunctionDeclaration.prototype[Cf] = function ( pack ) {
    pack.addStatement( new ExpStatement(
        [],
        new SimpleAssignExpression(
            this.name,
            new FunctionExpression(null, this.params, this.cdr)
        ),
        this.lineno,
        this.source
    ));
    return new EmptyStatement([]);
};


