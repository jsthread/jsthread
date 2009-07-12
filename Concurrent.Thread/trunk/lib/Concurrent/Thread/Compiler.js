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

//@require Concurrent.Thread.Compiler.Kit

//@require Concurrent.Thread
//@require Concurrent.Thread.Compiler.Parser
//@require Concurrent.Thread.Compiler.CssConvert
//@require Concurrent.Thread.Compiler.CvConvert
//@require Concurrent.Thread.Compiler.CsConvert
//@require Concurrent.Thread.Compiler.CuConvert
//@require Concurrent.Thread.Compiler.CfConvert
//@require Concurrent.Thread.Compiler.CzConvert
//@require Concurrent.Thread.Compiler.IntermediateLanguage
//@with-namespace Concurrent.Thread.Compiler

var IL = Concurrent.Thread.Compiler.IntermediateLanguage;

//@require Data.Cons 0.2.0
//@with-namespace Data.Cons



var PREFIX            = "$Concurrent_Thread_";
var var_self     = new Identifier(PREFIX + "self");
var var_compiled = new Identifier(PREFIX + "compiled");


//@export compile
function compile ( f ) {
    return eval(prepare(f));
}


//@shared CACHE_LIMIT
CACHE_LIMIT = 50;
var prepare_cache = {};
var cache_history = [];

//@export prepare
function prepare ( f ) {
    if ( typeof f != "function" ) throw new TypeError("argument must be a function");
    f = f.toString();
    var c = prepare_cache[f];
    if ( c ) return c;
    c = prepareTree(parseFunction(f)).toString();
    while ( cache_history.length >= CACHE_LIMIT  &&  cache_history.length > 0 ) {  // avoid endless loop
        delete prepare_cache[cache_history.shift()];
    }
    if ( CACHE_LIMIT >= 1 ) {
        prepare_cache[f] = c;
        cache_history.push(f);
    }
    return c;
}

function parseFunction ( f ) {
    var stmts = (new Parser()).parse("(" + f + ");");
    if ( !(stmts.car instanceof ExpStatement) ) throw new Error("not exp-statement!");
    if ( !(stmts.car.exp instanceof FunctionExpression) ) throw new Error("not function-expression!");
    return stmts.car.exp;
}


//@export prepareTree
function prepareTree ( f ) {
    if ( !(f instanceof FunctionExpression) ) Kit.codeBug("not FunctionalExpression");
    var name = f.name;
    f.name = null;
    var g = CssConvert(f);
    g = CvConvert(g);
    g = CsConvert(g);
    g = CuConvert(g);
    g = CfConvert(g);
    g = CzConvert(g);
    return new CallExpression(
        new FunctionExpression(null, [], list(
            new VarStatement([], [{id:var_self, exp:f}]),
            name ? new VarStatement([], [{id:name, exp:var_self}]) : new EmptyStatement([]),
            new ExpStatement([], new SimpleAssignExpression(new DotAccessor(var_self, var_compiled), g)),
            new ReturnStatement([], var_self)
        )),
        []
    );
    /* Constructs the following structure:
        "(function(){",
        "  var $Concurrent_Thread_self = ", f, ";",
        name  ?  "var " + name + " = " + "$Concurrent_Thread_self;"  :  "",
        "  $Concurrent_Thread_self.$Concurrent_Thread_compiled = ", func, ";",
        "  return $Concurrent_Thread_self;",
        "})()"
    */
}

