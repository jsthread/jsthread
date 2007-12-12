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
//@namespace Concurrent.Thread.Compiler

//@require Concurrent.Thread
//@require Concurrent.Thread.Compiler.Statement
//@require Concurrent.Thread.Compiler.Expression



//@export StackVariable
function StackVariable ( n ) {
    Identifier.call(this, "$Concurrent_Thread_stack"+n);
}

StackVariable.prototype = new Identifier();
StackVariable.prototype.constructor = StackVariable;



//@export Label
function Label ( n, e ) {
    this.id = new Identifier(n);
    this.exception = e;
}

Label.prototype.toString = function ( ) {
    return [ "  ", this.id, "[", this.exception, "]:" ].join("");
};



//@export ILExpStatement
function ILExpStatement ( e ) {
    this.exp = e;
}

ILExpStatement.prototype.toString = function ( ) {
    return [ "    ", this.exp, ";" ].join("");
};



//@export PropsStatement
function PropsStatement ( e ) {
    this.expression = e;  // Expression
}

PropsStatement.prototype.toString = function ( ) {
    return [ "    props( ", this.expression, " );" ].join("");
};



//@export GotoStatement
function GotoStatement ( c, r ) {
    this.continuation  = c;  // Identifier
    this.ret_val       = r;  // Expression
}

GotoStatement.prototype.toString = function ( ) {
    return [ "    goto[", this.continuation, "]",
                     "(", this.ret_val     , ");" ].join("");
};



//@export IfThenStatement
function IfThenStatement ( e, c ) {
    this.condition    = e;  // Expression
    this.continuation = c;  // Identifier
}

IfThenStatement.prototype.toString = function ( ) {
    return [ "    if ( ", this.condition, " ) ",
                 "then[", this.continuation, "];" ].join("");
};



//@export CallStatement
function CallStatement ( c, t, f, a ) {
    this.continuation = c;  // Label
    this.this_val     = t;  // Expression
    this.func         = f;  // Expression
    this.args         = a;  // array of Expression
}

CallStatement.prototype.toString = function ( ) {
    return [ "    call[", this.continuation, "]",
                     "(", this.this_val, ", ", this.func, ")",
                     "(", this.args.join(", ")          , ");" ].join("");
};



//@export NewStatement
function NewStatement ( c, f, a ) {
    this.continuation = c;  // Label
    this.func         = f;  // Expression
    this.args         = a;  // array of Expression
}

NewStatement.prototype.toString = function ( ) {
    return [ "    new[", this.continuation, "]",
                    "(", this.func            , ")",
                    "(", this.args.join(", ") , ");" ].join("");
};



//@export RecieveStatement
function RecieveStatement ( e ) {
    this.lhs = e;  // Identifier or DotAccessor or BracketAccessor
}

RecieveStatement.prototype.toString = function ( ) {
    return [ "    recieve( ", this.lhs, " );" ].join("");
};

