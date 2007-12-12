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

proto.hasSideEffect = function ( ) {
    Kit.codeBug("Unimplemented method `hasSideEffect' of class: " + this.constructor);
};

proto.hasLvalue = function ( ) {
    return false;
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

proto.hasSideEffect = function ( ) {
    return this.exp.hasSideEffect();
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

proto.hasSideEffect = function ( ) {
    return this.left.hasSideEfect() || this.right.hasSideEffect();
};


//@export ThisExpression
function ThisExpression ( ) {
    return THIS_EXPRESSION;  // Reuse object.
}

var proto = ThisExpression.prototype = new Expression();
proto.constructor = ThisExpression;

proto.toString = function ( ) {
    return "this";
};

proto.containsFunctionCall = function ( ) {
    return false;
};

proto.hasSideEffect = function ( ) {
    return false;
};

function temp ( ) { }
temp.prototype = ThisExpression.prototype;
var THIS_EXPRESSION = new temp();


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

proto.hasLvalue = function ( ) {
    return true;
};

proto.containsFunctionCall = function ( ) {
    return false;
};

proto.hasSideEffect = function ( ) {
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

proto.hasSideEffect = function ( ) {
    return false;
};


//@export NumberLiteral
function NumberLiteral ( s ) {
    Literal.apply(this, arguments);
}

var proto = NumberLiteral.prototype = new Literal();
proto.constructor = NumberLiteral;


//@export StringLiteral
function StringLiteral ( s ) {
    Literal.apply(this, arguments);
}

var proto = StringLiteral.prototype = new Literal();
proto.constructor = StringLiteral;


//@export RegExpLiteral
function RegExpLiteral ( s ) {
    Literal.apply(this, arguments);
}

var proto = RegExpLiteral.prototype = new Literal();
proto.constructor = RegExpLiteral;


//@export NullLiteral
function NullLiteral ( ) {
    return NULL_LITERAL;  // Reuse object.
}

var proto = NullLiteral.prototype = new Literal();
proto.constructor = NullLiteral;

proto.string = "null";
proto.vakue  = null;

proto.toString = function ( ) {
    return "null";
};

proto.valueOf = function ( ) {
    return null;
};

function temp ( ) { }
temp.prototype = NullLiteral.prototype;
var NULL_LITERAL = new temp();


//@export BooleanLiteral
function BooleanLiteral ( ) { }

var proto = BooleanLiteral.prototype = new Literal();
proto.constructor = BooleanLiteral;


//@export TrueLiteral
function TrueLiteral ( ) {
    return TRUE_LITERAL;  // Reuse object.
}

var proto = TrueLiteral.prototype = new BooleanLiteral();
proto.constructor = TrueLiteral;

proto.string = "true";
proto.vakue  = true;

proto.toString = function ( ) {
    return "true";
};

proto.valueOf = function ( ) {
    return true;
};

function temp ( ) { }
temp.prototype = TrueLiteral.prototype;
var TRUE_LITERAL = new temp();


//@export FalseLiteral
function FalseLiteral ( ) {
    return FALSE_LITERAL;  // Reuse object.
}

var proto = FalseLiteral.prototype = new BooleanLiteral();
proto.constructor = FalseLiteral;

proto.string = "false";
proto.vakue  = false;

proto.toString = function ( ) {
    return "false";
};

proto.valueOf = function ( ) {
    return false;
};

function temp ( ) { }
temp.prototype = FalseLiteral.prototype;
var FALSE_LITERAL = new temp();


//@export ArrayInitializer
function ArrayInitializer ( elems ) {
    this.elems = elems;  // array of Expression
}

var proto = ArrayInitializer.prototype = new Expression();
proto.constructor = ArrayInitializer;

proto.toString = function ( ) {
    return "[" + this.elems.join(", ") + "]";
};

proto.containsFunctionCall = function ( ) {
    for ( var i=0;  i < this.elems.length;  i++ ) {
        if ( this.elems[i].containsFunctionCall() ) return true;
    }
    return false;
};

proto.hasSideEfect = function ( ) {
    for ( var i=0;  i < this.elems.length;  i++ ) {
        if ( this.elems[i].hasSideEffect() ) return true;
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

proto.hasSideEffect = function ( ) {
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
        buf.push( String(this.pairs[i].prop) + ":" + String(this.pairs[i].exp) );
    }
    return "{" + buf.join(", ") + "}";
};

proto.containsFunctionCall = function ( ) {
    for ( var i=0;  i < this.pairs.length;  i++ ) {
        if ( this.pairs[i].exp.containsFunctionCall() ) return true;
    }
    return false;
};

proto.hasSideEffect = function ( ) {
    for ( var i=0;  i < this.pairs.length;  i++ ) {
        if ( this.pairs[i].exp.hasSideEffect() ) return true;
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
    buf.push( "(", this.params.join(", "), ") {\n");
    this.cdr.forEach(function( it ){
        buf.push(it, "\n");
    });
    buf.push("}");
    return buf.join("");
};

proto.containsFunctionCall = function ( ) {
    return false;
};

proto.hasSideEffect = function ( ) {
    return false;
};


//@export DotAccessor
function DotAccessor ( base, prop ) {
    this.base = base;  // Expression
    this.prop = prop;  // Identifier
}

var proto = DotAccessor.prototype = new Expression();
proto.constructor = DotAccessor;

proto.toString = function ( ) {
    return String(this.base) + "." + String(this.prop);
};

proto.hasLvalue = function ( ) {
    return true;
};

proto.containsFunctionCall = function ( ) {
    return this.base.containsFunctionCall();
};

proto.hasSideEffect = function ( ) {
    return this.base.hasSideEffect();
};


//@export BracketAccessor
function BracketAccessor ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = BracketAccessor.prototype = new BinaryExpression();
proto.constructor = BracketAccessor;

proto.toString = function ( ) {
    return [ this.left, "[", this.right, "]" ].join("");
};

proto.hasLvalue = function ( ) {
    return true;
};


//@export NewExpression
function NewExpression ( func, args ) {
    this.func = func;  // Expression
    this.args = args;  // array of Expression
}

var proto = NewExpression.prototype = new Expression();
proto.constructor = NewExpression;

proto.toString = function ( ) {
    return [ "new ", this.func, "(", this.args.join(", "), ")" ].join("");
};

proto.containsFunctionCall = function ( ) {
    return true;
};

proto.hasSideEffect = function ( ) {
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
    return [ this.func, "(", this.args.join(", "), ")" ].join("");
};

proto.containsFunctionCall = function ( ) {
    return true;
};

proto.hasSideEffect = function ( ) {
    return true;
};


//@export PostIncExpression
function PostIncExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = PostIncExpression.prototype = new UnaryExpression();
proto.constructor = PostIncExpression;

proto.toString = function ( ) {
    return String(this.exp) + "++";
};

proto.hasSideEffect = function ( ) {
    return true;
};


//@export PostDecExpression
function PostDecExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = PostDecExpression.prototype = new UnaryExpression();
proto.constructor = PostDecExpression;

proto.toString = function ( ) {
    return String(this.exp) + "--";
};

proto.hasSideEffect = function ( ) {
    return true;
};


//@export PreIncExpression
function PreIncExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = PreIncExpression.prototype = new UnaryExpression();
proto.constructor = PreIncExpression;

proto.toString = function ( ) {
    return "++" + String(this.exp);
};

proto.hasSideEffect = function ( ) {
    return true;
};


//@export PreDecExpression
function PreDecExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = PreDecExpression.prototype = new UnaryExpression();
proto.constructor = PreDecExpression;

proto.toString = function ( ) {
    return "--" + String(this.exp);
};

proto.hasSideEffect = function ( ) {
    return true;
};


//@export DeleteExpression
function DeleteExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = DeleteExpression.prototype = new UnaryExpression();
proto.constructor = DeleteExpression;

proto.toString = function ( ) {
    return "delete " + String(this.exp);
};

proto.hasSideEffect = function ( ) {
    return true;
};


//@export VoidExpression
function VoidExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = VoidExpression.prototype = new UnaryExpression();
proto.constructor = VoidExpression;

proto.toString = function ( ) {
    return "void " + String(this.exp);
};


//@export TypeofExpression
function TypeofExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = TypeofExpression.prototype = new UnaryExpression();
proto.constructor = TypeofExpression;

proto.toString = function ( ) {
    return "typeof " + String(this.exp);
};


//@export PosExpression
function PosExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = PosExpression.prototype = new UnaryExpression();
proto.constructor = PosExpression;

proto.toString = function ( ) {
    return "+ " + String(this.exp);
};


//@export NegExpression
function NegExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = NegExpression.prototype = new UnaryExpression();
proto.constructor = NegExpression;

proto.toString = function ( ) {
    return "- " + String(this.exp);
};


//@export BitNotExpression
function BitNotExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = BitNotExpression.prototype = new UnaryExpression();
proto.constructor = BitNotExpression;

proto.toString = function ( ) {
    return "~" + String(this.exp);
};


//@export NotExpression
function NotExpression ( e ) {
    UnaryExpression.apply(this, arguments);
}

var proto = NotExpression.prototype = new UnaryExpression();
proto.constructor = NotExpression;

proto.toString = function ( ) {
    return "!" + String(this.exp);
};


//@export MulExpression
function MulExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = MulExpression.prototype = new BinaryExpression();
proto.constructor = MulExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " * ", this.right, ")" ].join("");
};


//@export DivExpression
function DivExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = DivExpression.prototype = new BinaryExpression();
proto.constructor = DivExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " / ", this.right, ")" ].join("");
};


//@export ModExpression
function ModExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = ModExpression.prototype = new BinaryExpression();
proto.constructor = ModExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " % ", this.right, ")" ].join("");
};


//@export AddExpression
function AddExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = AddExpression.prototype = new BinaryExpression();
proto.constructor = AddExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " + ", this.right, ")" ].join("");
};


//@export SubExpression
function SubExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = SubExpression.prototype = new BinaryExpression();
proto.constructor = SubExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " - ", this.right, ")" ].join("");
};


//@export LShiftExpression
function LShiftExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = LShiftExpression.prototype = new BinaryExpression();
proto.constructor = LShiftExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " << ", this.right, ")" ].join("");
};


//@export RShiftExpression
function RShiftExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = RShiftExpression.prototype = new BinaryExpression();
proto.constructor = RShiftExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " >> ", this.right, ")" ].join("");
};


//@export URShiftExpression
function URShiftExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = URShiftExpression.prototype = new BinaryExpression();
proto.constructor = URShiftExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " >>> ", this.right, ")" ].join("");
};


//@export LessThanExpression
function LessThanExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = LessThanExpression.prototype = new BinaryExpression();
proto.constructor = LessThanExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " < ", this.right, ")" ].join("");
};


//@export GreaterThanExpression
function GreaterThanExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = GreaterThanExpression.prototype = new BinaryExpression();
proto.constructor = GreaterThanExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " > ", this.right, ")" ].join("");
};


//@export LessEqualExpression
function LessEqualExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = LessEqualExpression.prototype = new BinaryExpression();
proto.constructor = LessEqualExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " <= ", this.right, ")" ].join("");
};


//@export GreaterEqualExpression
function GreaterEqualExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = GreaterEqualExpression.prototype = new BinaryExpression();
proto.constructor = GreaterEqualExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " >= ", this.right, ")" ].join("");
};


//@export InstanceofExpression
function InstanceofExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = InstanceofExpression.prototype = new BinaryExpression();
proto.constructor = InstanceofExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " instanceof ", this.right, ")" ].join("");
};


//@export InExpression
function InExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = InExpression.prototype = new BinaryExpression();
proto.constructor = InExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " in ", this.right, ")" ].join("");
};


//@export EqualExpression
function EqualExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = EqualExpression.prototype = new BinaryExpression();
proto.constructor = EqualExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " == ", this.right, ")" ].join("");
};


//@export NotEqualExpression
function NotEqualExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = NotEqualExpression.prototype = new BinaryExpression();
proto.constructor = NotEqualExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " != ", this.right, ")" ].join("");
};


//@export StrictEqualExpression
function StrictEqualExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = StrictEqualExpression.prototype = new BinaryExpression();
proto.constructor = StrictEqualExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " === ", this.right, ")" ].join("");
};


//@export StrictNotEqualExpression
function StrictNotEqualExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = StrictNotEqualExpression.prototype = new BinaryExpression();
proto.constructor = StrictNotEqualExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " !== ", this.right, ")" ].join("");
};


//@export BitAndExpression
function BitAndExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = BitAndExpression.prototype = new BinaryExpression();
proto.constructor = BitAndExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " & ", this.right, ")" ].join("");
};


//@export BitXorExpression
function BitXorExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = BitXorExpression.prototype = new BinaryExpression();
proto.constructor = BitXorExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " ^ ", this.right, ")" ].join("");
};


//@export BitOrExpression
function BitOrExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = BitOrExpression.prototype = new BinaryExpression();
proto.constructor = BitOrExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " | ", this.right, ")" ].join("");
};


//@export AndExpression
function AndExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = AndExpression.prototype = new BinaryExpression();
proto.constructor = AndExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " && ", this.right, ")" ].join("");
};


//@export OrExpression
function OrExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = OrExpression.prototype = new BinaryExpression();
proto.constructor = OrExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " || ", this.right, ")" ].join("");
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
    return [ "(", this.cond, " ? ", this.texp, " : ", this.fexp, ")" ].join("");
};

proto.containsFunctionCall = function ( ) {
    return this.cond.containsFunctionCall()
        || this.texp.containsFunctionCall()
        || this.fexp.containsFunctionCall();
};

proto.hasSideEffect = function ( ) {
    return this.cond.hasSideEffect()
        || this.texp.hasSideEffect()
        || this.fexp.hasSideEffect();
};


//@export AssignExpression
function AssignExpression ( left, right ) {
    // This is kind of interface. It just represents a set of classes.
    BinaryExpression.apply(this, arguments);
}

var proto = AssignExpression.prototype = new BinaryExpression();
proto.constructor = AssignExpression;

proto.hasSideEffect = function ( ) {
    return true;
};


//@export SimpleAssignExpression
function SimpleAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = SimpleAssignExpression.prototype = new AssignExpression();
proto.constructor = SimpleAssignExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " = ", this.right, ")" ].join("");
};


//@export MulAssignExpression
function MulAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = MulAssignExpression.prototype = new AssignExpression();
proto.constructor = MulAssignExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " *= ", this.right, ")" ].join("");
};


//@export DivAssignExpression
function DivAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = DivAssignExpression.prototype = new AssignExpression();
proto.constructor = DivAssignExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " /= ", this.right, ")" ].join("");
};


//@export ModAssignExpression
function ModAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = ModAssignExpression.prototype = new AssignExpression();
proto.constructor = ModAssignExpression;

proto.toString = function ( ) {
    return [ "(",  this.left, " %= ", this.right, ")" ].join("");
};


//@export AddAssignExpression
function AddAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = AddAssignExpression.prototype = new AssignExpression();
proto.constructor = AddAssignExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " += ", this.right, ")" ].join("");
};


//@export SubAssignExpression
function SubAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = SubAssignExpression.prototype = new AssignExpression();
proto.constructor = SubAssignExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " -= ", this.right, ")" ].join("");
};


//@export LShiftAssignExpression
function LShiftAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = LShiftAssignExpression.prototype = new AssignExpression();
proto.constructor = LShiftAssignExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " <<= ", this.right, ")" ].join("");
};


//@export RShiftAssignExpression
function RShiftAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = RShiftAssignExpression.prototype = new AssignExpression();
proto.constructor = RShiftAssignExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " >>= ", this.right, ")" ].join("");
};


//@export URShiftAssignExpression
function URShiftAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = URShiftAssignExpression.prototype = new AssignExpression();
proto.constructor = URShiftAssignExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " >>>= ", this.right, ")" ].join("");
};


//@export BitAndAssignExpression
function BitAndAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = BitAndAssignExpression.prototype = new AssignExpression();
proto.constructor = BitAndAssignExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " &= ", this.right, ")" ].join("");
};


//@export BitXorAssignExpression
function BitXorAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = BitXorAssignExpression.prototype = new AssignExpression();
proto.constructor = BitXorAssignExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " ^= ", this.right, ")" ].join("");
};


//@export BitOrAssignExpression
function BitOrAssignExpression ( left, right ) {
    AssignExpression.apply(this, arguments);
}

var proto = BitOrAssignExpression.prototype = new AssignExpression();
proto.constructor = BitOrAssignExpression;

proto.toString = function ( ) {
    return [ "(", this.left, " |= ", this.right, ")" ].join("");
};


//@export CommaExpression
function CommaExpression ( left, right ) {
    BinaryExpression.apply(this, arguments);
}

var proto = CommaExpression.prototype = new BinaryExpression();
proto.constructor = CommaExpression;

proto.toString = function ( ) {
    return [ "(", this.left, ", ", this.right, ")" ].join("");
};


