//@esmodpp
//@version 0.0.0
//@namespace Concurrent.Thread.Compiler

//@require Concurrent.Thread
//@require Concurrent.Thread.Compiler.Statement
//@require Concurrent.Thread.Compiler.IntermediateLanguage

//@require Data.Cons
//@with-namespace Data.Cons



var Cs = "$Concurrent_Thread_Compiler_CsConvert";

var undefinedExp = new VoidExpression(new NumberLiteral(0));



//@export CsConvert
function CsConvert ( pack, func ) {
    pack.head.car = pack.createLabel();
    for ( var c=func.cdr;  c !== nil;  c=c.cdr ) c.car[Cs](pack);
    pack.addStatement( new GotoStatement(pack.cont_return, undefinedExp) );
    for ( var c=pack.head;  c.cdr.cdr !== nil;  c=c.cdr ) {
        if ( !(c.car instanceof GotoStatement || c.car instanceof CallStatement)
          && c.cdr.car instanceof Label
        ) {
            c.cdr = cons( new GotoStatement(c.cdr.car.id, undefinedExp), c.cdr);
        }
    }
    func.cdr = pack.head;
    pack.head = pack.tail = nil;
    return func;
}


EmptyStatement.prototype[Cs] = function ( pack ) {
    // Do nothing.
};

Block.prototype[Cs] = function ( pack ) {
    for ( var c=this.cdr;  c !== nil;  c=c.cdr ) {
        c.car[Cs](pack);
    }
};

ExpStatement.prototype[Cs] = function ( pack ) {
    this.labels = [];
    pack.addStatement(this);
};

IfStatement.prototype[Cs] = function ( pack ) {
    var label = pack.createLabel();
    pack.addStatement( new IfGotoStatement(new NotExpression(this.cond), label.id, undefinedExp) );
    this.body[Cs](pack);
    pack.addStatement(label);
};

IfElseStatement.prototype[Cs] = function ( pack ) {
    var label1 = pack.createLabel();
    var label2 = pack.createLabel();
    pack.addStatement( new IfGotoStatement(this.cond, label1.id, undefinedExp) );
    this.fbody[Cs](pack);
    pack.addStatement( new GotoStatement(label2.id, undefinedExp) );
    pack.addStatement(label1);
    this.tbody[Cs](pack);
    pack.addStatement( new GotoStatement(label2.id, undefinedExp) );
    pack.addStatement(label2);
};

DoWhileStatement.prototype[Cs] = function ( pack ) {
    var label = pack.createLabel();
    pack.addStatement(label);
    this.body[Cs](pack);
    pack.addStatement( new IfGotoStatement(this.cond, label.id, undefinedExp) );
};

WhileStatement.prototype[Cs] = function ( pack ) {
    var label1 = pack.createLabel();
    var label2 = pack.createLabel();
    pack.addStatement(label1);
    pack.addStatement( new IfGotoStatement(new NotExpression(this.cond), label2.id, undefinedExp) );
    this.body[Cs](pack);
    pack.addStatement( new GotoStatement(label1.id, undefinedExp) );
    pack.addStatement(label2);
};

ReturnStatement.prototype[Cs] = function ( pack ) {
    pack.addStatement( new GotoStatement(
        pack.cont_return,
        this.exp || undefinedExp
    ) );
};

ThrowStatement.prototype[Cs] = function ( pack ) {
    pack.addStatement( new GotoStatement(pack.cont_throw, this.exp) );
};


