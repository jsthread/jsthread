//@esmodpp
//@namespace Concurrent.Thread.Compiler

//@require Concurrent.Thread.Compiler.Kit


//@export Expression
function Expression ( ) {
    // This is kind of abstract class.
}

var proto = Expression.prototype;

proto.toString = function ( ) {
    Kit.codeBug("Unimplemented method `toString' of class: " + this.constructor);
};

proto.containsFunctionCall = function ( ) {
    Kit.codeBug("Unimplemented method `containsFunctionCall' of class: " + this.constructor);
};


//@export UnaryExpression
function UnaryExpression ( e ) {
    // This is kind of abstract class and should not be instantiated directly.
    // It just provides default implementations of methods and constructor.
    this.exp = e;  // Expression
}

var proto = UnaryExpression.prototype = new Expression();
proto.constructor = UnaryExpression;

proto.containsFunctionCall = function ( ) {
    return this.exp.containsFunctionCall();
};


//@export BinaryExpression
function BinaryExpression ( l, r ) {
    // This is kind of abstract class and should not be instantiated directly.
    // It just provides default implementations of methods and constructor.
    this.left  = l;  // Expression
    this.right = r;  // Expression
}

var proto = BinaryExpression.prototype = new Expression();
proto.constructor = BinaryExpression;

proto.containsFunctionCall = function ( ) {
    return this.left.containsFunctionCall() || this.right.containsFunctionCall();
};


//@export ThisKeyword
function ThisKeyword ( ) { }

var proto = ThisKeyword.prototype = new Expression();
proto.constructor = ThisKeyword;

proto.toString = function ( ) {
    return "this";
};

proto.containsFunctionCall = function ( ) {
    return false;
};


//@export Identifier
function Identifier ( s ) {
    this.string = String(s);
    this.value  = eval('"' + this.string + '"');
}

var proto = Identifier.prototype = new Expression();
proto.constructor = Identifier;

proto.toString = function ( ) {
    return this.string;
};

proto.valueOf = function ( ) {
    return this.value;
};

proto.containsFunctionCall = function ( ) {
    return false;
};


//@export Literal
function Literal ( s ) {
    this.string = String(s);
    this.value  = eval(this.string);
}

var proto = Literal.prototype = new Expression();
proto.constructor = Literal;

proto.toString = function ( ) {
    return this.string;
};

proto.valueOf = function ( ) {
    return this.value;
};

proto.containsFunctionCall = function ( ) {
    return false;
};


//@export ArrayInitializer
function ArrayInitializer ( v ) {
    this.elements = v;  // array of Expression
}

var proto = ArrayInitializer.prototype = new Expression();
proto.constructor = ArrayInitializer;

proto.toString = function ( ) {
    return "[" + this.elements.join(", ") + "]";
};

proto.containsFunctionCall = function ( ) {
    for ( var i=0;  i < this.elements.length;  i++ ) {
        if ( this.elements[i].containsFunctionCall() ) return true;
    }
    return false;
};


//@export Elision
function Elision ( ) { }

var proto = Elision.prototype = new Expression();
proto.constructor = Elision;

proto.toString = function ( ) {
    return "";
};

proto.containsFunctionCall = function ( ) {
    return false;
};


//@export ObjectInitializer
function ObjectInitializer ( v ) {
    this.pairs = v;  // array of {prop: Identifier or Literal,  exp: Expression}
}

var proto = ObjectInitializer.prototype = new Expression();
proto.constructor = ObjectInitializer;

proto.toString = function ( ) {
    var buf = [];
    for ( var i=0;  i < this.pairs.length;  i++ ) {
        buf.push( this.pairs[i].prop + ":" + this.pairs[i].exp );
    }
    return "{" + buf.join(", ") + "}";
};

proto.containsFunctionCall = function ( ) {
    for ( var i=0;  i < this.pairs.length;  i++ ) {
        if ( this.pairs[i].exp.containsFunctionCall() ) return true;
    }
    return false;
};


//@export FunctionExpression
function FunctionExpression ( name, params, body ) {
    this.name   = name;    // Identifier or null
    this.params = params;  // array of Identifier
    this.cdr    = body;    // cons-list of Statement
}

var proto = FunctionExpression.prototype = new Expression();
proto.constructor = FunctionExpression;

proto.toString = function ( ) {
    var buf = ["function "];
    if ( this.name ) buf.push(this.name);
    buf.push( "(", this.params.join(", "), ")", "{\n");
    for ( var c=this.cdr;  c !== nil;  c=c.cdr ) buf.push(c.car, "\n");
    buf.push("}");
    return buf.join("");
};

proto.containsFunctionCall = function ( ) {
    return false;
};


//@export DotAccessor
function DotAccessor ( base, prop ) {
    this.base = base;  // Expression
    this.prop = prop;  // Identifier
}

var prop = DotAccessor.prototype = new Expression();
proto.constructor = DotAccessor;

proto.toString = function ( ) {
    return this.base + "." + this.prop;
};

proto.containsFunctionCall = function ( ) {
    return this.base.containsFunctionCall();
};


//@export BracketAccessor
function BracketAccessor ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = BracketAccessor.prototype = new BinaryExpression();
proto.constructor = BracketAccessor;

proto.toString = function ( ) {
    return this.left + "[" + this.right + "]";
};


//@export NewExpression
function NewExpression ( func, args ) {
    this.func = func;  // Expression
    this.args = args;  // array of Expression
}

var proto = NewExpression.prototype = new Expression();
proto.constructor = NewExpression;

proto.toString = function ( ) {
    return "new " + this.func + "(" + this.args.join(", ") + ")";
};

proto.containsFunctionCall = function ( ) {
    return true;
};


//@export CallExpression
function CallExpression ( func, args ) {
    this.func = func;  // Expression
    this.args = args;  // array of Expression
}

var proto = CallExpression.prototype = new Expression();
proto.constructor = CallExpression;

proto.toString = function ( ) {
    return this.func + "(" + this.args.join(", ") + ")";
};

proto.containsFunctionCall = function ( ) {
    return true;
};


//@export PostIncExpression
function PostIncExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = PostIncExpression.prototype = new UnaryExpression();
proto.constructor = PostIncExpression;

proto.toString = function ( ) {
    return this.exp + "++";
};


//@export PostDecExpression
function PostDecExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = PostDecExpression.prototype = new UnaryExpression();
proto.constructor = PostDecExpression;

proto.toString = function ( ) {
    return this.exp + "--";
};


//@export PreIncExpression
function PreIncExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = PreIncExpression.prototype = new UnaryExpression();
proto.constructor = PreIncExpression;

proto.toString = function ( ) {
    return "++" + this.exp;
};


//@export PreDecExpression
function PreDecExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = PreDecExpression.prototype = new UnaryExpression();
proto.constructor = PreDecExpression;

proto.toString = function ( ) {
    return "--" + this.exp;
};


//@export DeleteExpression
function DeleteExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = DeleteExpression.prototype = new UnaryExpression();
proto.constructor = DeleteExpression;

proto.toString = function ( ) {
    return "delete " + this.exp;
};


//@export VoidExpression
function VoidExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = VoidExpression.prototype = new UnaryExpression();
proto.constructor = VoidExpression;

proto.toString = function ( ) {
    return "void " + this.exp;
};


//@export TypeofExpression
function TypeofExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = TypeofExpression.prototype = new UnaryExpression();
proto.constructor = TypeofExpression;

proto.toString = function ( ) {
    return "typeof " + this.exp;
};


//@export PosExpression
function PosExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = PosExpression.prototype = new UnaryExpression();
proto.constructor = PosExpression;

proto.toString = function ( ) {
    return "+ " + this.exp;
};


//@export NegExpression
function NegExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = NegExpression.prototype = new UnaryExpression();
proto.constructor = NegExpression;

proto.toString = function ( ) {
    return "- " + this.exp;
};


//@export BitNotExpression
function BitNotExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = BitNotExpression.prototype = new UnaryExpression();
proto.constructor = BitNotExpression;

proto.toString = function ( ) {
    return "~" + this.exp;
};


//@export NotExpression
function NotExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = NotExpression.prototype = new UnaryExpression();
proto.constructor = NotExpression;

proto.toString = function ( ) {
    return "!" + this.exp;
};


//@export MulExpression
function MulExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = MulExpression.prototype = new BinaryExpression();
proto.constructor = MulExpression;

proto.toString = function ( ) {
    return "(" + this.left + " * " + this.right + ")";
};


//@export DivExpression
function DivExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = DivExpression.prototype = new BinaryExpression();
proto.constructor = DivExpression;

proto.toString = function ( ) {
    return "(" + this.left + " / " + this.right + ")";
};


//@export ModExpression
function ModExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = ModExpression.prototype = new BinaryExpression();
proto.constructor = ModExpression;

proto.toString = function ( ) {
    return "(" + this.left + " % " + this.right + ")";
};


//@export AddExpression
function AddExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = AddExpression.prototype = new BinaryExpression();
proto.constructor = AddExpression;

proto.toString = function ( ) {
    return "(" + this.left + " + " + this.right + ")";
};


//@export SubExpression
function SubExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = SubExpression.prototype = new BinaryExpression();
proto.constructor = SubExpression;

proto.toString = function ( ) {
    return "(" + this.left + " - " + this.right + ")";
};


//@export LShiftExpression
function LShiftExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = LShiftExpression.prototype = new BinaryExpression();
proto.constructor = LShiftExpression;

proto.toString = function ( ) {
    return "(" + this.left + " << " + this.right + ")";
};


//@export RShiftExpression
function RShiftExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = RShiftExpression.prototype = new BinaryExpression();
proto.constructor = RShiftExpression;

proto.toString = function ( ) {
    return "(" + this.left + " >> " + this.right + ")";
};


//@export URShiftExpression
function URShiftExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = URShiftExpression.prototype = new BinaryExpression();
proto.constructor = URShiftExpression;

proto.toString = function ( ) {
    return "(" + this.left + " >>> " + this.right + ")";
};


//@export LessThanExpression
function LessThanExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = LessThanExpression.prototype = new BinaryExpression();
proto.constructor = LessThanExpression;

proto.toString = function ( ) {
    return "(" + this.left + " < " + this.right + ")";
};


//@export GreaterThanExpression
function GreaterThanExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = GreaterThanExpression.prototype = new BinaryExpression();
proto.constructor = GreaterThanExpression;

proto.toString = function ( ) {
    return "(" + this.left + " > " + this.right + ")";
};


//@export LessEqualExpression
function LessEqualExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = LessEqualExpression.prototype = new BinaryExpression();
proto.constructor = LessEqualExpression;

proto.toString = function ( ) {
    return "(" + this.left + " <= " + this.right + ")";
};


//@export GreaterEqualExpression
function GreaterEqualExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = GreaterEqualExpression.prototype = new BinaryExpression();
proto.constructor = GreaterEqualExpression;

proto.toString = function ( ) {
    return "(" + this.left + " >= " + this.right + ")";
};


//@export InstanceofExpression
function InstanceofExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = InstanceofExpression.prototype = new BinaryExpression();
proto.constructor = InstanceofExpression;

proto.toString = function ( ) {
    return "(" + this.left + " instanceof " + this.right + ")";
};


//@export InExpression
function InExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = InExpression.prototype = new BinaryExpression();
proto.constructor = InExpression;

proto.toString = function ( ) {
    return "(" + this.left + " in " + this.right + ")";
};


//@export EqualExpression
function EqualExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = EqualExpression.prototype = new BinaryExpression();
proto.constructor = EqualExpression;

proto.toString = function ( ) {
    return "(" + this.left + " == " + this.right + ")";
};


//@export NotEqualExpression
function NotEqualExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = NotEqualExpression.prototype = new BinaryExpression();
proto.constructor = NotEqualExpression;

proto.toString = function ( ) {
    return "(" + this.left + " != " + this.right + ")";
};


//@export StrictEqualExpression
function StrictEqualExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = StrictEqualExpression.prototype = new BinaryExpression();
proto.constructor = StrictEqualExpression;

proto.toString = function ( ) {
    return "(" + this.left + " === " + this.right + ")";
};


//@export StrictNotEqualExpression
function StrictNotEqualExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = StrictNotEqualExpression.prototype = new BinaryExpression();
proto.constructor = StrictNotEqualExpression;

proto.toString = function ( ) {
    return "(" + this.left + " !== " + this.right + ")";
};


//@export BitAndExpression
function BitAndExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = BitAndExpression.prototype = new BinaryExpression();
proto.constructor = BitAndExpression;

proto.toString = function ( ) {
    return "(" + this.left + " & " + this.right + ")";
};


//@export BitXorExpression
function BitXorExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = BitXorExpression.prototype = new BinaryExpression();
proto.constructor = BitXorExpression;

proto.toString = function ( ) {
    return "(" + this.left + " ^ " + this.right + ")";
};


//@export BitOrExpression
function BitOrExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = BitOrExpression.prototype = new BinaryExpression();
proto.constructor = BitOrExpression;

proto.toString = function ( ) {
    return "(" + this.left + " | " + this.right + ")";
};


//@export AndExpression
function AndExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = AndExpression.prototype = new BinaryExpression();
proto.constructor = AndExpression;

proto.toString = function ( ) {
    return "(" + this.left + " && " + this.right + ")";
};


//@export OrExpression
function OrExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = OrExpression.prototype = new BinaryExpression();
proto.constructor = OrExpression;

proto.toString = function ( ) {
    return "(" + this.left + " || " + this.right + ")";
};


//@export ConditionalExpression
function ConditionalExpression ( c, t, f ) {
    this.cond = c;  // Expression
    this.texp = t;  // Expression
    this.fexp = f;  // Expression
}

var proto = ConditionalExpression.prototype = new Expression();
proto.constructor = ConditionalExpression;

proto.toString = function ( ) {
    return "(" + this.cond + " ? " + this.texp + " : " + this.fexp + ")";
};

proto.containsFunctionCall = function ( ) {
    return this.cond.containsFunctionCall()
        || this.texp.containsFunctionCall()
        || this.fexp.containsFunctionCall();
};


//@export AssignExpression
function AssignExpression ( left, right ) {
    // This is kind of interface. It just represents a set of classes.
    BinaryExpression.apply(this, arguments);
}

var proto = AssignExpression.prototype = new BinaryExpression();
proto.constructor = AssignExpression;


//@export SimpleAssignExpression
function SimpleAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = SimpleAssignExpression.prototype = new AssignExpression();
proto.constructor = SimpleAssignExpression;

proto.toString = function ( ) {
    return "(" + this.left + " = " + this.right + ")";
};


//@export MulAssignExpression
function MulAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = MulAssignExpression.prototype = new AssignExpression();
proto.constructor = MulAssignExpression;

proto.toString = function ( ) {
    return "(" + this.left + " *= " + this.right + ")";
};


//@export DivAssignExpression
function DivAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = DivAssignExpression.prototype = new AssignExpression();
proto.constructor = DivAssignExpression;

proto.toString = function ( ) {
    return "(" + this.left + " /= " + this.right + ")";
};


//@export ModAssignExpression
function ModAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = ModAssignExpression.prototype = new AssignExpression();
proto.constructor = ModAssignExpression;

proto.toString = function ( ) {
    return "(" + this.left + " %= " + this.right + ")";
};


//@export AddAssignExpression
function AddAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = AddAssignExpression.prototype = new AssignExpression();
proto.constructor = AddAssignExpression;

proto.toString = function ( ) {
    return "(" + this.left + " += " + this.right + ")";
};


//@export SubAssignExpression
function SubAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = SubAssignExpression.prototype = new AssignExpression();
proto.constructor = SubAssignExpression;

proto.toString = function ( ) {
    return "(" + this.left + " -= " + this.right + ")";
};


//@export LShiftAssignExpression
function LShiftAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = LShiftAssignExpression.prototype = new AssignExpression();
proto.constructor = LShiftAssignExpression;

proto.toString = function ( ) {
    return "(" + this.left + " <<= " + this.right + ")";
};


//@export RShiftAssignExpression
function RShiftAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = RShiftAssignExpression.prototype = new AssignExpression();
proto.constructor = RShiftAssignExpression;

proto.toString = function ( ) {
    return "(" + this.left + " >>= " + this.right + ")";
};


//@export URShiftAssignExpression
function URShiftAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = URShiftAssignExpression.prototype = new AssignExpression();
proto.constructor = URShiftAssignExpression;

proto.toString = function ( ) {
    return "(" + this.left + " >>>= " + this.right + ")";
};


//@export BitAndAssignExpression
function BitAndAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = BitAndAssignExpression.prototype = new AssignExpression();
proto.constructor = BitAndAssignExpression;

proto.toString = function ( ) {
    return "(" + this.left + " &= " + this.right + ")";
};


//@export BitXorAssignExpression
function BitXorAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = BitXorAssignExpression.prototype = new AssignExpression();
proto.constructor = BitXorAssignExpression;

proto.toString = function ( ) {
    return "(" + this.left + " ^= " + this.right + ")";
};


//@export BitOrAssignExpression
function BitOrAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = BitOrAssignExpression.prototype = new AssignExpression();
proto.constructor = BitOrAssignExpression;

proto.toString = function ( ) {
    return "(" + this.left + " |= " + this.right + ")";
};


//@export CommaExpression
function CommaExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = CommaExpression.prototype = new BinaryExpression();
proto.constructor = CommaExpression;

proto.toString = function ( ) {
    return "(" + this.left + ", " + this.right + ")";
};


