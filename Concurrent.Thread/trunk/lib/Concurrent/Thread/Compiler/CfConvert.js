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
//@require Concurrent.Thread.Compiler.IdentifierMap
//@with-namespace Concurrent.Thread
var IL = Concurrent.Thread.Compiler.IntermediateLanguage;

//@require Data.Error
//@with-namespace Data.Error

//@require Data.Cons.List
//@require Data.Cons.Util
//@with-namespace Data.Cons
//@with-namespace Data.Cons.Util
//@require Data.Functional.Array



var Cf = "$Concurrent_Thread_Compiler_Cf";

//@export CfConvert
function CfConvert ( func ) {
    var cache = new IdentifierMap();
    var start = CfTarget(func.start, cache);
    var cache2 = new IdentifierMap();
    cache.values().forEach(function( it ){
        cache2.put(new Identifier(it.id), it);
    });
    var body  = cons(null, nil());
    append = adder(body);
    cacheToList(cache2).forEach(function( it ){
        return append(cache2.get(it));
    });
    return new IL.Function(func.name, func.params, func.vars, body.cdr, start);
}


function cacheToList ( cache ) {
    // Resolves exception-dependency and sort blocks in valid order.
    var blocks = [];
    var depends = new IdentifierMap();
    cache.values().forEach(function( it ){
        blocks.push(it);
        depends.put(
            new Identifier(it.id),
            it.exception instanceof IL.Block ? new Identifier(it.exception.id) : undefined
        );
    });
    return check_cyclic(depends);
}


//@export CyclicExceptionHandlerError
var CyclicExceptionHandlerError = newErrorClass(NAMESPACE + ".CyclicExceptionHandlerError");

function check_cyclic ( depends ) {
    var ok = {};
    function traverse ( id, path ) {
        if ( ok[id] ) return "OK";
        var next = depends.get(id);
        if ( !next ) {
            ok[id] = true;
            path.push(id);
            return "OK";
        }
        path.forEach(function( it ){
            if ( it.valueOf() == id.valueOf() ) {
                throw new CyclicExceptionHandlerError("cyclic exception handler: " + path.concat([id]).join(" -> "));
            }
        });
        path.push(id);
        traverse(next, path);
        ok[id] = true;
        return "OK";
    }
    var result = [];
    depends.keys().forEach(function( it ){
        var path = [];
        traverse(it, path);
        result = path.concat(result);
    });
    return result.reverse();
}


function CfTarget ( b, cache ) {
    if ( b === "return" || b === "throw" ) return b;
    if ( cache.get(new Identifier(b.id)) ) return cache.get(new Identifier(b.id));
    return b[Cf](cache);
}


IL.GotoBlock.prototype[Cf] = function ( cache ) {
    var block = new IL.GotoBlock();
    cache.put(new Identifier(this.id), block);
    block.scopes    = this.scopes.map(function( it ){ return it[Cf](cache); });
    block.body      = this.body.map(function( it ){ return it[Cf](cache); });
    block.arg       = this.arg[Cf](cache);
    block.target    = CfTarget(this.target, cache);
    block.exception = CfTarget(this.exception, cache);
    return block;
};

IL.CallBlock.prototype[Cf] = function ( cache ) {
    var block = new IL.CallBlock();
    cache.put(new Identifier(this.id), block);
    block.scopes    = this.scopes.map(function( it ){ return it[Cf](cache); });
    block.body      = this.body.map(function( it ){ return it[Cf](cache); });
    block.this_val  = this.this_val[Cf](cache);
    block.func      = this.func[Cf](cache);
    block.args      = this.args.map(function( it ){ return it[Cf](cache); });
    block.target    = CfTarget(this.target, cache);
    block.exception = CfTarget(this.exception, cache);
    return block;
};

IL.NewBlock.prototype[Cf] = function ( cache ) {
    var block = new IL.NewBlock();
    cache.put(new Identifier(this.id), block);
    block.scopes    = this.scopes.map(function( it ){ return it[Cf](cache); });
    block.body      = this.body.map(function( it ){ return it[Cf](cache); });
    block.func      = this.func[Cf](cache);
    block.args      = this.args.map(function( it ){ return it[Cf](cache); });
    block.target    = CfTarget(this.target, cache);
    block.exception = CfTarget(this.exception, cache);
    return block;
};


IL.ExpStatement.prototype[Cf] = function ( cache ) {
    return new IL.ExpStatement(
        this.exp[Cf](cache)
    );
};

IL.CondStatement.prototype[Cf] = function ( cache ) {
    return new IL.CondStatement(
        this.cond[Cf](cache),
        CfTarget(this.target, cache)
    );
};

IL.RecvStatement.prototype[Cf] = function ( cache ) {
    return new IL.RecvStatement(
        this.assignee[Cf](cache)
    );
};

IL.EnumStatement.prototype[Cf] = function ( cache ) {
    return new IL.EnumStatement(
        this.exp[Cf](cache),
        this.assignee[Cf](cache)
    );
};


Expression.prototype[Cf] = function ( cache ) {
    return this;
};

UnaryExpression.prototype[Cf] = function ( cache ) {
    return new this.constructor(this.exp[Cf](cache));
};

BinaryExpression.prototype[Cf] = function ( cache ) {
    return new this.constructor(this.left[Cf](cache), this.right[Cf](cache));
};

ArrayInitializer.prototype[Cf] = function ( cache ) {
    return new ArrayInitializer(this.elems.map(function( it ){
        return it[Cf](cache);
    }));
};

FunctionExpression.prototype[Cf] = function ( cache ) {
    return prepareTree(this);
};

ObjectInitializer.prototype[Cf] = function ( cache ) {
    return new ObjectInitializer(this.pairs.map(function( it ){
        return { prop: it.prop,  exp: it.exp[Cf](cache) };
    }));
};

DotAccessor.prototype[Cf] = function ( cache ) {
    return new DotAccessor(this.base[Cf](cache), this.prop);
};

ConditionalExpression.prototype[Cf] = function ( cache ) {
    return new ConditionalExpression(
        this.cond[Cf](cache),
        this.texp[Cf](cache),
        this.fexp[Cf](cache)
    );
};

