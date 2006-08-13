//@esmodpp
//@namespace Concurrent.Thread.Compiler

//@require Concurrent.Thread.Compiler.Kit

//@require Data.Cons
//@with-namespace Data.Cons



//@export Statement
function Statement ( label ) {
    // This is kind of abstract class.
    this.label = label;
}

Statement.prototype.toString = function ( ) {
    codeBug();
};


//@export Block
function Block ( label, statements ) {
    Statement.call(this, label);
    this.cdr = statements;
}

var proto = Block.prototype = new Statement();
proto.constructor = Block;

proto.toString = function ( ) {
    var buf = ["{"];
    for ( var c=this.cdr;  c !== nil;  c=c.cdr ) buf.push(c.car);
    buf.push("}\n");
    return buf.join("\n");
};


//@export ExpStatement
function ExpStatement ( label, exp ) {
    Statement.call(this, label);
    this.exp = exp;
}

var proto = ExpStatement.prototype = new Statemrnt();
proto.constructor = ExpStatement;

proto.toString  function ( ) {
    return this.exp + ";";
};

proto.containsFunctionCall = function ( ) {
    return this.exp.containsFunctionCall();
};


//@export VarStatement
function VarStatement ( label, decls ) {
    Statement.call(this, label);
    this.decls = decls;
}

var proto = VarStatement.prototype = new Statemrnt();
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
    return "var " + buf.join(", ") + ";";
};

proto.containsFunctionCall = function ( ) {
    for ( var i=0;  i < this.decls.length;  i++ ) {
        if ( this.decls[i].exp && this.decls[i].exp.containsFunctionCall() ) {
            return true;
        }
    }
    return false;
};

