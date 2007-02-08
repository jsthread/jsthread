//@esmodpp
//@namespace Concurrent.Thread.Compiler

//@require Concurrent.Thread
//@require Concurrent.Thread.Compiler.IntermediateLanguage

//@require Data.Cons
//@with-namespace Data.Cons



var Cz = "$Concurrent_Thread_Compiler_CzConvert";

var PREFIX   = "$Concurrent_Thread_";
var var_this = new Identifier(PREFIX+"this");
var var_args = new Identifier(PREFIX+"arguments");
var var_cont = new Identifier(PREFIX+"continuation");
var var_self = new Identifier(PREFIX+"self");
var var_intermediate = new Identifier(PREFIX+"intermediate");

var name_compiled  = new Identifier(PREFIX+"compiled");
var name_arguments = new Identifier("arguments");
var name_prototype = new Identifier("prototype");
var name_apply     = new Identifier("apply");

var name_null_function = new Identifier(PREFIX+"null_function");
var null_function = new FunctionDeclaration([], name_null_function, [], nil);



//@export CzConvert
function CzConvert ( pack, func ) {
    pack.head = pack.tail = nil;
    var head = func.cdr;
    do{
        var block = head;
        for ( var c=head;  !(c.cdr === nil || c.cdr.car instanceof Label);  c=c.cdr );
        head  = c.cdr;
        c.cdr = nil;
        pack.addStatement( block_to_continuation(block) );
    } while ( head !== nil );
    var body = inner_function(func.params, pack.vars, pack.head);
    return new FunctionExpression(
               null,
               [var_this, var_args, var_cont],
               cons(
                   new ReturnStatement([],
                       new CallExpression(
                           new DotAccessor(body, name_apply),
                           [var_this, var_args]
                       )
                   ),
                   nil
               )
           );
}


var name_procedure = new Identifier("procedure");
var name_this_val  = new Identifier("this_val");
var name_exception = new Identifier("exception");

function block_to_continuation ( block ) {
    var label = block.car;
    for ( var c=block.cdr;  c !== nil;  c=c.cdr ) {
        c.car = c.car[Cz]();
    }
    block = cons( make_assign(name_arguments, var_args), block.cdr );
    return new VarStatement([], [
        { id : label.id,
          exp: new ObjectInitializer([
                   {prop: name_procedure, exp: new FunctionExpression(null, [var_intermediate], block)},
                   {prop: name_this_val , exp: new ThisExpression() },
                   {prop: name_exception, exp: label.exception }
               ])
        }
    ]);
}


var arguments_callee = new DotAccessor(name_arguments, new Identifier("callee"));

function inner_function ( params, vars, blocks ) {
    var label0 = blocks.car.decls[0].id;
    blocks = cons( var_declaration(vars),
             cons( null_function,
             cons( make_assign(var_args, name_arguments),
             cons( make_assign(arguments_callee, var_self),
                   blocks  ) ) ) );
    for ( var c=blocks;  c.cdr !== nil;  c=c.cdr );
    c.cdr = cons( make_return(label0), nil );
    return new FunctionExpression(null, params, blocks);
}

function var_declaration ( vars ) {
    var decls = [];
/*  // IdentifierSet is not a subclass of Data.Functional.Set yet!
    vars.forEach(function( it ){
        decls.push({ id:it, exp:null });
    });
 */
    vars = vars.toArray();
    if ( vars.length == 0 ) return new EmptyStatement([]);
    for ( var i=0;  i < vars.length;  i++ ) {
        decls.push({ id:vars[i], exp:null });
    }
    return new VarStatement([], decls);
}


function make_assign ( lhs, rhs ) {
    return new ExpStatement( [], new SimpleAssignExpression(lhs, rhs) );
}


var undefinedExp = new VoidExpression(new Literal(0));
var name_continuation = new Identifier("continuation");
var name_timeout      = new Identifier("timeout");
var name_ret_val      = new Identifier("ret_val");

function make_return ( continuation, ret_val ) {
    return new ReturnStatement([], new ObjectInitializer([
               { prop: name_continuation, exp: continuation            },
               { prop: name_ret_val     , exp: ret_val || undefinedExp },
               { prop: name_timeout     , exp: undefinedExp            }
           ]) );
}



ILExpStatement.prototype[Cz] = function ( ) {
    return new ExpStatement([], this.exp);
};


GotoStatement.prototype[Cz] = function ( ) {
    return make_return(this.continuation, this.ret_val);
};


IfThenStatement.prototype[Cz] = function ( ) {
    return new IfStatement([],
        this.condition,
        make_return(this.continuation)
    );
};


var string_function = new StringLiteral('"function"');

CallStatement.prototype[Cz] = function ( ) {
    return new IfElseStatement([],
        new AndExpression(
            this.func,
            new StrictEqualExpression(
                new TypeofExpression(
                    new DotAccessor(this.func, name_compiled)
                ),
                string_function
            )
        ),
        new ReturnStatement([],
            new CallExpression(
                new DotAccessor(this.func, name_compiled),
                [
                    this.this_val,
                    new ArrayInitializer(this.args),
                    this.continuation
                ]
            )
        ),
        make_return(
            this.continuation,
            new CallExpression(this.func, this.args)
        )
    );
};


NewStatement.prototype[Cz] = function ( ) {
/*  // Construct the following code-tree.
    if ( CONSTRUCTOR && typeof CONSTRUCTOR.$Concurrent_Thread_compiled == "function" ) {
    $Concurrent_Thread_null_function.prototype = CONSTRUCTOR.prototype;
    return CONSTRUCTOR.$Concurrent_Thread_compiled(
               new $Concurrent_Thread_null_function(),
               [ARG1, ARG2, ...],
               CONTINUATION
           );
    } else {
        return { continuation: CONTINUATION,
                 ret_val     : new CONSTRUCTOR(ARG1, ARG2...),
                 timeout     : void 0
               };
    } 
 */
    return new IfElseStatement([],
        new AndExpression(
            this.func,
            new StrictEqualExpression(
                new TypeofExpression(
                    new DotAccessor(this.func, name_compiled)
                ),
                string_function
            )
        ),
        new Block([],
            cons( make_assign( new DotAccessor(name_null_function, name_prototype),
                               new DotAccessor(this.func         , name_prototype) ),
            cons( new ReturnStatement([],
                      new CallExpression(
                          new DotAccessor(this.func, name_compiled),
                          [
                              new NewExpression(name_null_function, []),
                              new ArrayInitializer(this.args),
                              this.continuation
                          ]
                      )
                  ),
                  nil
            ))
        ),
        make_return(
            this.continuation,
            new NewExpression(this.func, this.args)
        )
    );
};


RecieveStatement.prototype[Cz] = function ( ) {
    return new make_assign(this.lhs, var_intermediate);
};

