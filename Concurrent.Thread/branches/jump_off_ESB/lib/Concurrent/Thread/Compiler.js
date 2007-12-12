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
//@namespace Concurrent.Thread

//@require Concurrent.Thread
//@require Concurrent.Thread.Compiler.Parser
//@require Concurrent.Thread.Compiler.CssConvert
//@require Concurrent.Thread.Compiler.CfConvert
//@require Concurrent.Thread.Compiler.CsConvert
//@require Concurrent.Thread.Compiler.CeConvert
//@require Concurrent.Thread.Compiler.CzConvert
//@require Concurrent.Thread.Compiler.IntermediateLanguage
//@with-namespace Concurrent.Thread.Compiler

//@require Data.Cons 0.2.0
//@with-namespace Data.Cons



var PREFIX            = "$Concurrent_Thread_";
var intermediateVar   = new Identifier(PREFIX + "intermediate");
var nullFunctionVar   = new Identifier(PREFIX + "null_function");
var initialContReturn = new Identifier(PREFIX + "continuation");
var initialContThrow  = new DotAccessor(initialContReturn, new Identifier("exception"));


//@export compile
function compile ( f ) {
    return eval(prepare(f));
}

//@export prepare
function prepare ( f ) {
    var func = parseFunction(f);
    var name = func.name;
    func.name = null;
    f = func.toString();
    func = CssConvert(func);
    var pack = new TransPack();
    func = CfConvert(pack, func);
    func = CsConvert(pack, func);
    func = CeConvert(pack, func);
    func = CzConvert(pack, func);
    return [
        "(function(){ ",
        "  var $Concurrent_Thread_self = ", f, ";",
        "  $Concurrent_Thread_self.$Concurrent_Thread_compiled = ", func, ";",
        "  return $Concurrent_Thread_self;",
        "})();"
    ].join("");
}

function parseFunction ( f ) {
    if ( typeof f != "function" ) throw new TypeError();
    var parser = new Parser();
    var stmts = parser.parse("(" + f + ");");
    if ( !(stmts.car instanceof ExpStatement) ) throw new Error("not exp-statement!");
    if ( !(stmts.car.exp instanceof FunctionExpression) ) throw new Error("not function-expression!");
    return stmts.car.exp;
}



function TransPack ( ) {
    this.label_cnt = 0;
    this.stack_max = -1;
//    this.cont_break    = null;
//    this.cont_continue = null;
    this.cont_return   = initialContReturn;
    this.cont_throw    = initialContThrow;
    this.vars = new IdentifierSet();
    this.head = this.tail = nil();
}

var proto = TransPack.prototype;

proto.registerVar = function ( id ) {
    this.vars.add(id);
};

proto.createLabel = function ( ) {
    return new Label(PREFIX + "label" + this.label_cnt++, this.cont_throw);
};

proto.createStackVar = function ( n ) {
    var id = new Identifier(PREFIX + "stack" + n);
    if ( n > this.stack_max ) {
        this.stack_max = n;
        this.registerVar(id);
    }
    return id;
};

proto.addStatement = function ( s ) {
    if ( this.tail.isNil() ) {
        this.head = this.tail = cons(s, this.tail);
    } else {
        this.tail = this.tail.cdr = cons(s, this.tail.cdr);
    }
};

