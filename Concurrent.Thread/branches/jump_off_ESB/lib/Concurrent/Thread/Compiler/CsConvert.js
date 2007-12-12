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
//@require Concurrent.Thread.Compiler.IntermediateLanguage

//@require Data.Cons 0.2.0
//@with-namespace Data.Cons



var Cs = "Concurrent.Thread.Compiler.CsConvert";

var undefinedExp = new VoidExpression(new NumberLiteral(0));



//@export CsConvert
function CsConvert ( pack, func ) {
    pack.addStatement(pack.createLabel());
    for ( var c=func.cdr;  !c.isNil();  c=c.cdr ) c.car[Cs](pack);
    pack.addStatement( new GotoStatement(pack.cont_return, undefinedExp) );
    for ( var c=pack.head;  !c.cdr.cdr.isNil();  c=c.cdr ) {
        if ( !(c.car instanceof GotoStatement || c.car instanceof CallStatement)
          && c.cdr.car instanceof Label
        ) {
            c.cdr = cons( new GotoStatement(c.cdr.car.id, undefinedExp), c.cdr);
        }
    }
    func.cdr = pack.head;
    pack.head = pack.tail = nil();
    return func;
}


EmptyStatement.prototype[Cs] = function ( pack ) {
    // Do nothing.
};

Block.prototype[Cs] = function ( pack ) {
    for ( var c=this.cdr;  !c.isNil();  c=c.cdr ) {
        c.car[Cs](pack);
    }
};

ExpStatement.prototype[Cs] = function ( pack ) {
    this.labels = [];
    pack.addStatement(new ILExpStatement(this.exp));
};

IfStatement.prototype[Cs] = function ( pack ) {
    var label = pack.createLabel();
    pack.addStatement( new IfThenStatement(new NotExpression(this.cond), label.id) );
    this.body[Cs](pack);
    pack.addStatement(label);
};

IfElseStatement.prototype[Cs] = function ( pack ) {
    var label1 = pack.createLabel();
    var label2 = pack.createLabel();
    pack.addStatement( new IfThenStatement(this.cond, label1.id) );
    this.fbody[Cs](pack);
    pack.addStatement( new GotoStatement(label2.id, undefinedExp) );
    pack.addStatement(label1);
    this.tbody[Cs](pack);
    pack.addStatement( new GotoStatement(label2.id, undefinedExp) );
    pack.addStatement(label2);
};

DoWhileStatement.prototype[Cs] = function ( pack ) {
    var label = pack.createLabel();
    pack.addStatement(label);
    this.body[Cs](pack);
    pack.addStatement( new IfThenStatement(this.cond, label.id) );
};

WhileStatement.prototype[Cs] = function ( pack ) {
    var label1 = pack.createLabel();
    var label2 = pack.createLabel();
    pack.addStatement(label1);
    pack.addStatement( new IfThenStatement(new NotExpression(this.cond), label2.id) );
    this.body[Cs](pack);
    pack.addStatement( new GotoStatement(label1.id, undefinedExp) );
    pack.addStatement(label2);
};

ReturnStatement.prototype[Cs] = function ( pack ) {
    pack.addStatement( new GotoStatement(
        pack.cont_return,
        this.exp || undefinedExp
    ) );
};

ThrowStatement.prototype[Cs] = function ( pack ) {
    pack.addStatement( new GotoStatement(pack.cont_throw, this.exp) );
};

TryCatchStatement.prototype[Cs] = function ( pack ) {
    var label1 = pack.createLabel();
    var label2 = pack.createLabel();
    var label3 = pack.createLabel();
    label2.exception = label1.id;
    pack.addStatement(new GotoStatement(label2.id, undefinedExp));
    pack.addStatement(label1);
    pack.addStatement(new RecieveStatement(this.variable));
    this.catchBlock[Cs](pack);
    pack.addStatement(new GotoStatement(label3.id, undefinedExp));
    pack.addStatement(label2);
    var store_cont = pack.cont_throw;
    pack.cont_throw = label1.id;
    try {
        this.tryBlock[Cs](pack);
    } finally {
        pack.cont_throw = store_cont;
    }
    pack.addStatement(new GotoStatement(label3.id, undefinedExp));
    pack.addStatement(label3);
};
