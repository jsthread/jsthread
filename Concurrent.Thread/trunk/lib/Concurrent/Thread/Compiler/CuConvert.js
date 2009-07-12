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
///@require Concurrent.Thread.Compiler.Expression
///@require Concurrent.Thread.Compiler.Statement
//@require Concurrent.Thread.Compiler.IntermediateLanguage
///@require Concurrent.Thread.Compiler.IdentifierMap
//@with-namespace Concurrent.Thread
var IL = Concurrent.Thread.Compiler.IntermediateLanguage;

//@require Data.Cons.List
//@with-namespace Data.Cons


//@export CuConvert
function CuConvert ( func ) {
    // "map" below actually represents context of conversion.
    // Essentially, it maps old-block-ID => optimized-block. But, if the
    // value of a key is of type Array, it means that the block idenfied
    // with the ID is currently in process of the conversion (that means
    // "target" link is cyclic), and that each element of the array is a
    // GotoBlock whose "target" property is to be overwritten with the
    // optimized version of the block identified with old-block-ID.
    var map = {};
    func.body.forEach(function( it ){
        if ( !map.hasOwnProperty(it.id) ) {
            unify_block(it, map);
        }
    });
    func.body = nil();
    for ( var i in map ) {
        if ( map.hasOwnProperty(i) ){
            var block = map[i];
            replace_target(block, "exception", map);
            block.body.forEach(function( it ){
                if ( it instanceof IL.CondStatement ) {
                    replace_target(it, "target", map);
                }
            });
            func.body = cons(map[i], func.body);
        }
    }
    func.start = map[func.start.id];
    return func;
}

function unify_block ( block, map ) {
    map[block.id] = [];
    var next = block.target;
    if ( next instanceof IL.Block ) {
        if ( map.hasOwnProperty(next.id) ) {
            if ( map[next.id] instanceof Array ) {
                map[next.id].push(block);
            } else {
                block.target = map[next.id];
            }
        } else {
            block.target = unify_block(next, map);
        }
    }
    var unified;
    if ( can_unify(block) ) {
        next = block.target;
        switch ( next.constructor ) {
            case IL.GotoBlock:
                unified = new IL.GotoBlock(next.scopes, next.body, next.arg, next.target, next.exception);
                break;
            case IL.CallBlock:
                unified = new IL.CallBlock(next.scopes, next.body, next.this_val, next.func, next.args, next.target, next.exception);
                break;
            case IL.NewBlock:
                unified = new IL.NewBlock(next.scopes, next.body, next.func, next.args, next.target, next.exception);
                break;
            default:
                throw new Error("Concurrent.Thread.Compiler.CuConvert: internal error");
        }
        unified.body = concat_list(block.body, next.body);
        if ( unified.target instanceof IL.Block  &&  map.hasOwnProperty(unified.target.id)  &&  map[unified.target.id] instanceof Array ) {
            map[unified.target.id].push(unified);
        }
    } else {
        unified = block;
    }
    map[block.id].forEach(function( it ){
        it.target = unified;
    });
    map[block.id] = unified;
    return unified;
}

function can_unify ( block ) {
    if ( !(block instanceof IL.GotoBlock)           ) return false;
    var next = block.target;
    if ( !(next instanceof IL.Block)                ) return false;
    if ( block === next                             ) return false;
    if ( block.exception !== next.exception         ) return false;
    if ( block.scopes.length !== next.scopes.length ) return false;
    var length = block.exception.length;
    for ( var i=0;  i < length;  i++ ) {
        if ( block.scopes[i] !== next.scopes[i] ) return false;
    }
    return true;
}

function replace_target ( base, prop, map ) {
    var target = base[prop];
    if ( target === "return" || target === "throw" ) {
        return;
    }
    if ( !(target instanceof IL.Block) ) {
        throw new Error(NAMESPACE + ".CuConvert: internal error - `" + target + "' is not of type IntermediateLanguage.Block");
    }
    var target_id = target.id;
    if ( map.hasOwnProperty(target_id) ) {
        base[prop] = map[target_id];
    }
}


function concat_list ( x, y ) {
    return concat_list_aux(x, concat_list_aux(nil(), y));
}

function concat_list_aux ( list, acc ) {
	if ( list.isNil() ) {
		return acc;
	} else {
		return cons(list.car, concat_list_aux(list.cdr, acc));
	}
}
