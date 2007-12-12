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

//@require Concurrent.Thread
//@require Concurrent.Thread.Compiler.Expression
//@require Concurrent.Thread.Compiler.Statement
//@require Concurrent.Thread.Compiler.IntermediateLanguage
var IL = Concurrent.Thread.Compiler.IntermediateLanguage;

//@require Data.Cons.List
//@require Data.Cons.Util
//@with-namespace Data.Cons
//@with-namespace Data.Cons.Util
//@require Data.Functional.Array



var Cz = "$Concurrent_Thread_Compiler_CzConvert";

var PREFIX   = "$Concurrent_Thread_";
var var_this = new Identifier(PREFIX+"this");
var var_args = new Identifier(PREFIX+"arguments");
var var_cont = new Identifier(PREFIX+"continuation");
var var_self = new Identifier(PREFIX+"self");
var var_compiled     = new Identifier(PREFIX+"compiled");
var var_intermediate = new Identifier(PREFIX+"intermediate");

var name_arguments = new Identifier("arguments");
var name_prototype = new Identifier("prototype");
var name_apply     = new Identifier("apply");
var name_procedure = new Identifier("procedure");
var name_this_val  = new Identifier("this_val");
var name_exception = new Identifier("exception");

var var_null_function = new Identifier(PREFIX+"null_function");
var null_function = new FunctionDeclaration([], var_null_function, [], nil());



//@export CzConvert
function CzConvert ( func ) {
    var body = inner_function(func);
    return new FunctionExpression(
               null,
               [var_this, var_args, var_cont],
               list(
                   new ReturnStatement([],
                       new CallExpression(
                           new DotAccessor(body, name_apply),
                           [var_this, var_args]
                       )
                   )
               )
           );
}




var arguments_callee = new DotAccessor(name_arguments, new Identifier("callee"));

function inner_function ( func ) {
    var blocks = func.body.map(function(it){ return it[Cz](); });
    blocks = cons( var_declaration(func.vars),
             cons( null_function,
             cons( make_assign(var_args, name_arguments),
             cons( make_assign(arguments_callee, var_self),
                   blocks ) ) ) );
    adder(blocks)( make_return(func.start) );
    return new FunctionExpression(null, func.params, blocks);
}

function var_declaration ( vars ) {
    if ( !vars.length ) return new EmptyStatement([]);
    var decls = [];
    vars.forEach(function( it ){
        decls.push({ id:it, exp:null });
    });
    return new VarStatement([], decls);
}


function make_assign ( lhs, rhs ) {
    return new ExpStatement( [], new SimpleAssignExpression(lhs, rhs) );
}


var var_cont_ex = new DotAccessor(var_cont, name_exception);

function target_to_name ( b ) {
    if ( b instanceof IL.Block ) {
        return new Identifier(PREFIX + b.id);
    } else if ( b === "return" ) {
        return var_cont;
    } else if ( b === "throw" ) {
        return var_cont_ex;
    } else {
        Kit.codeBug("invalid target");
    }
}


var undefinedExp = new VoidExpression(new Literal(0));
var name_continuation = new Identifier("continuation");
var name_timeout      = new Identifier("timeout");
var name_ret_val      = new Identifier("ret_val");

function make_return ( continuation, ret_val ) {
    return new ReturnStatement([], new ObjectInitializer([
               { prop: name_continuation, exp: target_to_name(continuation) },
               { prop: name_ret_val     , exp: ret_val || undefinedExp },
               { prop: name_timeout     , exp: undefinedExp            }
           ]) );
}


var assign_arguments = make_assign(name_arguments, var_args);

function make_continuation ( block, body ) {
    body = new Block([], body);
    for ( var i=block.scopes.length-1;  i >= 0;  i-- ) {
        body = new WithStatement([], block.scopes[i], body);
    }
    return new VarStatement([], [{
        id : target_to_name(block),
        exp: new ObjectInitializer([
                 {prop: name_procedure, exp: new FunctionExpression(null, [var_intermediate], list(assign_arguments, body))},
                 {prop: name_this_val , exp: new ThisExpression() },
                 {prop: name_exception, exp: target_to_name(block.exception) }
             ])
    }]);
}



IL.GotoBlock.prototype[Cz] = function ( ) {
    var body = this.body.map(function( it ) {
        return it[Cz]();
    });
    body = cons(null, body);
    adder(body)( make_return(this.target, this.arg) );
    return make_continuation(this, body.cdr);
};


var string_object   = new StringLiteral('"object"');
var string_function = new StringLiteral('"function"');

IL.CallBlock.prototype[Cz] = function ( ) {
    var body = this.body.map(function( it ) {
        return it[Cz]();
    });
    body = cons(null, body);
    adder(body)( new IfElseStatement([],
        new AndExpression(
            this.func,
            new StrictEqualExpression(
                new TypeofExpression(
                    new DotAccessor(this.func, var_compiled)
                ),
                string_function
            )
        ),
        new ReturnStatement([],
            new CallExpression(
                new DotAccessor(this.func, var_compiled),
                [
                    this.this_val,
                    new ArrayInitializer(this.args),
                    target_to_name(this.target)
                ]
            )
        ),
        make_return(
            this.target,
            new CallExpression(this.func, this.args)
        )
    ) );
    return make_continuation(this, body.cdr);
};


IL.NewBlock.prototype[Cz] = function ( ) {
    var body = this.body.map(function( it ) {
        return it[Cz]();
    });
    body = cons(null, body);
    /*  // Construct the following code-tree.
        if ( CONSTRUCTOR && typeof CONSTRUCTOR.$Concurrent_Thread_compiled == "function" ) {
        $Concurrent_Thread_null_function.prototype = CONSTRUCTOR.prototype;
        $Concurrent_Thread_this = new $Concurrent_Thread_null_function();
        return CONSTRUCTOR.$Concurrent_Thread_compiled(
                   $Concurrent_Thread_this,
                   [ARG1, ARG2, ...],
                   { procedure: function($Concurrent_Thread_intermediate){
                    if ( !($Concurrent_Thread_intermediate && (typeof $Concurrent_Thread_intermediate === "object" || typeof $Concurrent_Thread_intermediate === "function") )
                      $Concurrent_Thread_intermediate = $Concurrent_Thread_this;
                    $Concurrent_Thread_this = null;  // encourages GC
                       return { continuation: CONTINUATION,
                                ret_val     : $Concurrent_Thread_intermediate,
                                timeout     : void 0                          };
                   }, this_val: this, exception: EXCEPTION }
               );
        } else {
            return { continuation: CONTINUATION,
                     ret_val     : new CONSTRUCTOR(ARG1, ARG2...),
                     timeout     : void 0
                   };
        } 
     */
    adder(body)( new IfElseStatement([],
        new AndExpression(
            this.func,
            new StrictEqualExpression(
                new TypeofExpression(
                    new DotAccessor(this.func, var_compiled)
                ),
                string_function
            )
        ),
        new Block([],
            list( 
                make_assign( new DotAccessor(var_null_function, name_prototype),
                             new DotAccessor(this.func        , name_prototype) ),
                make_assign( var_this, new NewExpression(var_null_function, []) ),
                new ReturnStatement([],
                    new CallExpression(
                        new DotAccessor(this.func, var_compiled),
                        [
                            var_this,
                            new ArrayInitializer(this.args),
                            new ObjectInitializer([
                                {prop: name_procedure, exp: new FunctionExpression(null, [var_intermediate], list(
                                    new IfStatement([],
                                        new NotExpression(
                                            new AndExpression(
                                                var_intermediate,
                                                new OrExpression(
                                                    new StrictEqualExpression(new TypeofExpression(var_intermediate), string_object),
                                                    new StrictEqualExpression(new TypeofExpression(var_intermediate), string_function)
                                                )
                                            )
                                        ),
                                        make_assign(var_intermediate, var_this)
                                    ),
                                    make_assign(var_this, new NullLiteral()),
                                    make_return(this.target, var_intermediate)
                                ))},
                                {prop: name_this_val , exp: new ThisExpression()},
                                {prop: name_exception, exp: target_to_name(this.exception)}
                             ])
                        ]
                    )
                )
            )
        ),
        make_return(this.target, new NewExpression(this.func, this.args))
    ) );
    return make_continuation(this, body.cdr);
};


IL.ExpStatement.prototype[Cz] = function ( ) {
    return new ExpStatement([], this.exp);
};


IL.CondStatement.prototype[Cz] = function ( ) {
    return new IfStatement([], this.cond, make_return(this.target));
};


IL.RecvStatement.prototype[Cz] = function ( ) {
    return make_assign(this.assignee, var_intermediate);
};


var name_push = new Identifier("push");

IL.EnumStatement.prototype[Cz] = function ( ) {
    return new Block([], list(
        make_assign(var_this, new ArrayInitializer([])),
        new ForInStatement([], var_intermediate, this.exp, 
            new ExpStatement([], 
                new CallExpression(
                    new DotAccessor(var_this, name_push),
                    [var_intermediate]
                )
            )
        ),
        make_assign(this.assignee, var_this),
        make_assign(var_this, new NullLiteral())
    ));
};
