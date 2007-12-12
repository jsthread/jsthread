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
//@namespace Concurrent.Thread.Compiler.IntermediateLanguage

//@require Concurrent.Thread
//@require Concurrent.Thread.Compiler.Statement
//@require Concurrent.Thread.Compiler.Expression

//@require Data.Cons.List
//@require Data.Cons.Util
//@with-namespace Data.Cons
//@with-namespace Data.Cons.Util



//@export Function
function Function ( name, params, vars, body, start ) {
    this.name   = name;    // Identifier | Null
    this.params = params;  // [Identifier]
    this.vars   = vars;    // [Identifier]
    this.body   = body;    // <Block>
    this.start  = start;   // Block
}

Function.prototype.toString = function ( ) {
    return  [ "function ", this.name, "( ", this.params.join(", "), " ) {\n",
              "  var ", this.vars.join(", "), ";\n",
              this.body.join("\n").replace(/^/mg, "  "),
              "\n}" ].join("");
};


//@export Block
var block_id = 0;

function Block ( scopes, body, target, exception ) {
    this.id        = "label" + block_id++;
    this.scopes    = scopes;     // [Expression]
    this.body      = body;       // <Statement>
    this.target    = target;     // Block | "return" | "throw"
    this.exception = exception;  // Block | "return" | "throw"
}

var proto = Block.prototype;

proto.toString = function ( ) {
    Kit.codeBug('"toString" is not implemented for ', this.constructor);
};

proto.appendStatement = function ( /* variable arguments */ ) {
    var args = arguments;
    if ( this.body.isNil() ) {
        this.body = cons(arguments[0], this.body);
        args = Array.prototype.slice.call(arguments, 1, arguments.length);
    } else {
        adder(this.body).apply(null, args);
    }
};

proto.prependStatement = function ( /* variable arguments */ ) {
    for ( var i=arguments.length-1;  i >= 0;  i-- ) {
        this.body = cons(arguments[i], this.body);
    }
};


function stringify ( b ) {
    if ( b instanceof Block ) {
        return b.id;
    } else {
        return '"' + b + '"';
    }
}


//@export GotoBlock
function GotoBlock ( scopes, body, arg, target, exception ) {
    Block.call(this, scopes, body, target, exception);
    this.arg = arg;
}

var proto = GotoBlock.prototype = new Block();

proto.constructor = GotoBlock;

proto.toString = function ( ) {
    return [ this.id, "([", this.scopes.join(", "), "], ", stringify(this.exception), "): {\n",
             this.body.join("\n").replace(/^/mg, "  "), "\n",
             "  goto ", this.arg, " -> ", stringify(this.target), "\n",
             "}" ].join("");
};


//@export CallBlock
function CallBlock ( scopes, body, this_val, func, args, target, exception ) {
    Block.call(this, scopes, body, target, exception);
    this.this_val  = this_val;   // Expression
    this.func      = func;       // Expression
    this.args      = args;       // [Expression]
}

var proto = CallBlock.prototype = new Block();

proto.constructor = CallBlock;

proto.toString = function ( ) {
    return [ this.id, "([", this.scopes.join(", "), "], ", stringify(this.exception), "): {\n",
             this.body.join("\n").replace(/^/mg, "  "), "\n",
             "  call ", this.this_val, ".", this.func, "(", this.args.join(", "), ") -> ", stringify(this.target), "\n",
             "}" ].join("");
};


//@export NewBlock
function NewBlock ( scopes, body, func, args, target, exception ) {
    Block.call(this, scopes, body, target, exception);
    this.func      = func;       // Expression
    this.args      = args;       // [Expression]
}

var proto = NewBlock.prototype = new Block();

proto.constructor = NewBlock;

proto.toString = function ( ) {
    return [ this.id, "([", this.scopes.join(", "), "], ", stringify(this.exception), "): {\n",
             this.body.join("\n").replace(/^/mg, "  "), "\n",
             "  new ", this.func, "(", this.args.join(", "), ") -> ", stringify(this.target), "\n",
             "}" ].join("");
};



//@export Statement
function Statement ( ) {
    // This is kind of interface.
}

Statement.prototype.toString = function ( ) {
    Kit.codeBug('"toString" is not implemented for ', this.constructor);
};


//@export ExpStatement
function ExpStatement ( e ) {
    this.exp = e;  // Expression
}

var proto = ExpStatement.prototype = new Statement();

proto.constructor = ExpStatement;

proto.toString = function ( ) {
    return this.exp + ";";
};


//@export CondStatement
function CondStatement ( c, t ) {
    this.cond   = c;  // Expression
    this.target = t;  // Block
}

var proto = CondStatement.prototype = new Statement();

proto.constructor = CondStatement;

proto.toString = function ( ) {
    return [ "if ", this.cond, " -> ", stringify(this.target), ";" ].join("");
};


//@export RecvStatement
function RecvStatement ( a ) {
    this.assignee = a;  // Identifier | DotAccessor | BracketAccessor
}

var proto = RecvStatement.prototype = new Statement();

proto.constructor = RecvStatement;

proto.toString = function ( ) {
    return [ "recv ", this.assignee, ";" ].join("");
};


//@export EnumStatement
function EnumStatement ( e, a ) {
    this.exp      = e;  // Expression
    this.assignee = a;  // Identifier | DotAccessor | BracketAccessor
}

var proto = EnumStatement.prototype = new Statement();

proto.constructor = EnumStatement;

proto.toString = function ( ) {
    return [ "enum ", this.assignee, " <- ", this.exp, ";" ].join("");
};
