/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0
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
 * The Original Code is Rhino code, released
 * May 6, 1999.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1997-1999
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Mike Ang
 *   Igor Bukanov
 *   Yuh-Ruey Chen
 *   Ethan Hugg
 *   Terry Lucas
 *   Mike McCabe
 *   Milen Nankov
 *   Daisuke Maki
 *
 * Alternatively, the contents of this file may be used under the terms of
 * the GNU General Public License Version 2 or later (the "GPL"), in which
 * case the provisions of the GPL are applicable instead of those above. If
 * you wish to allow use of your version of this file only under the terms of
 * the GPL and not to allow others to use your version of this file under the
 * MPL, indicate your decision by deleting the provisions above and replacing
 * them with the notice and other provisions required by the GPL. If you do
 * not delete the provisions above, a recipient may use your version of this
 * file under either the MPL or the GPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * This file is based on the file Parser.java in Rhino 1.6R5.
 */



//@esmodpp
//@version 0.0.0
//@namespace Concurrent.Thread.Compiler
//@require   Concurrent.Thread
//@require   Concurrent.Thread.Compiler.Kit
//@require   Concurrent.Thread.Compiler.ErrorReporter
//@require   Concurrent.Thread.Compiler.Token
//@require   Concurrent.Thread.Compiler.TokenStream
//@require   Concurrent.Thread.Compiler.Expression
//@require   Concurrent.Thread.Compiler.Statement
//@require   Concurrent.Thread.Compiler.IdentifierSet

//@require Data.Error
//@with-namespace Data.Error

//@require Data.Stack
//@with-namespace Data

//@require Data.Cons
//@with-namespace Data.Cons



// TokenInformation flags : flaggedTokenBuffer stores them together
// with token type
var CLEAR_TI_MASK  = 0xFFFF;   // mask to clear token information bits
var TI_AFTER_EOL   = 1 << 16;  // first token of the source line
var TI_CHECK_LABEL = 1 << 17;  // indicates to check for label


// Exception to unwind
var ParserException = newExceptionClass(NAMESPACE + ".ParserException");

// Exception to return statement-label
function LabelException ( label ) {
    this.label = label;  // Identifier
}


// default error reporter
var defaultReporter = new ErrorReporter();
defaultReporter.error = function ( message, line, lineSource, lineOffset ) {
    throw new SyntaxError("(" + line + ", " + lineOffset + "): " + message + "\nline: " + lineSource);
};


//@export Parser
function Parser ( errorReporter )
{
    this.errorReporter       = errorReporter instanceof ErrorReporter
                                 ?  errorReporter  :  defaultReporter;
    this.ts                  = undefined;  // TokenStream
    this.source              = undefined;  // String       # file-name, URL, ...etc
    this.flaggedTokenBuffer  = null;       // Stack
    this.syntaxErrorCount    = 0;
    this.nestingOfFunction   = 0;
    // The following are per function variables and should be saved/restored
    // during function parsing.
    this.nestingOfLoop   = 0;
    this.nestingOfSwitch = 0;
    this.allLabelSet     = null;  // contains all labels in current scope
    this.loopLabelSet    = null;  // contains only labels qualifying IterationStatement in current scope
}

var proto = Parser.prototype;


proto.getMessage = function ( messageId  /* optional args */ )
{
    //!! fake implementation
    return messageId;
};

proto.addWarning = function ( messageId  /* optional args */ )
{
    this.errorReporter.warning(this.getMessage.apply(this, arguments),
                               this.ts.getLineno()                   ,
                               this.ts.getLine()                     ,
                               this.ts.getOffset()                   );
};

proto.addError = function ( messageId  /* optional args */ )
{
    ++this.syntaxErrorCount;
    this.errorReporter.error(this.getMessage.apply(this, arguments),
                             this.ts.getLineno()                   ,
                             this.ts.getLine()                     ,
                             this.ts.getOffset()                   );
};

proto.reportError = function ( messageId  /* optional args */ )
{
    this.addError.apply(this, arguments);
    // Throw a ParserException exception to unwind the recursive descent
    // parse.
    throw new ParserException();
};


proto.peekToken = function ( )
{
    var tt;
    if ( this.flaggedTokenBuffer.isEmpty() ) {
        tt = this.ts.getToken();
        if ( tt === Token.EOL ) {
            do {
                tt = this.ts.getToken();
            } while ( tt === Token.EOL );
            tt |= TI_AFTER_EOL;
        }
        this.flaggedTokenBuffer.push(tt);
    } else {
        tt = this.flaggedTokenBuffer.peek();
    }
    return tt & CLEAR_TI_MASK;
};

proto.peekFlaggedToken = function ( )
{
    this.peekToken();
    return this.flaggedTokenBuffer.peek();
};

proto.consumeToken = function ( )
{
    this.flaggedTokenBuffer.pop();
};

proto.nextToken = function ( )
{
    var tt = this.peekToken();
    this.consumeToken();
    return tt;
};

proto.nextFlaggedToken = function ( )
{
    this.peekToken();
    var ttFlagged = this.flaggedTokenBuffer.peek();
    this.consumeToken();
    return ttFlagged;
};

proto.matchToken = function ( toMatch )
{
    if ( this.peekToken() !== toMatch ) return false;
    this.consumeToken();
    return true;
};

proto.peekTokenOrEOL = function ( )
{
    var tt = this.peekToken();
    // Check for last peeked token flags
    if ( this.flaggedTokenBuffer.peek() & TI_AFTER_EOL ) return Token.EOL;
    return tt;
};

// Since we need to backtrack to properly parse "default xml namespace"
// in switch-statement.
proto.ungetToken = function ( token )
{
    this.flaggedTokenBuffer.push(token);
};

proto.setCheckForLabel = function ( )
{
    var tt = this.flaggedTokenBuffer.pop();
    if ( (tt & CLEAR_TI_MASK) !== Token.NAME ) throw Kit.codeBug();
    this.flaggedTokenBuffer.push(tt | TI_CHECK_LABEL);
};

proto.mustMatchToken = function ( toMatch, messageId  /* optional args */ )
{
    if ( !this.matchToken(toMatch) ) {
        var args = [];
        for ( var i=1;  i < arguments.length;  i++ ) args.push(arguments[i]);
        this.reportError.apply(this, args);
    }
};

proto.eof = function ( )
{
    return this.ts.eof();
};

proto.insideFunction = function ( )
{
    return this.nestingOfFunction !== 0;
};

proto.insideLoop = function ( )
{
    return this.nestingOfLoop !== 0;
};

proto.enterLoop = function ( labels )
{
    for ( var i=0;  i < labels.length;  i++ ) this.loopLabelSet.add(labels[i]);
    this.nestingOfLoop++;
};

proto.exitLoop = function ( labels )
{
    for ( var i=0;  i < labels.length;  i++ ) this.loopLabelSet.remove(labels[i]);
    this.nestingOfLoop--;
};


proto.parse = function ( sourceString, lineno, source )
{
    this.ts     = new TokenStream(this, sourceString, lineno);
    this.source = source;  // optional
    this.flaggedTokenBuffer = new Stack();
    this.syntaxErrorCount   = 0;
    this.nestingOfFunction  = 0;
    this.nestingOfLoop      = 0;
    this.nestingOfSwitch    = 0;
    this.allLabelSet        = new IdentifierSet();
    this.loopLabelSet       = new IdentifierSet();

    try {
        var body = this.statements();
        this.mustMatchToken(Token.EOF, "msg.syntax");
    } catch ( e ) {
        if ( e instanceof ParserException ) {
            // Ignore it.
        } else {
            // Maybe stack overflow.
            //!!fake implementation
            throw e;
        }
    }

    if ( this.syntaxErrorCount ) {
        var msg = "msg.got.syntax.errors";
        this.addError(msg);
        throw new SyntaxError(this.getMessage("msg.got.syntax.errors"));
    }

    this.ts = null; // It helps GC
    return body;
};


proto.statements = function ( )
{
    var head, cell;
    cell = head = cons(null, nil());
    bodyLoop: for (;;) {
        var n;
        switch ( this.peekToken() ) {
          case Token.ERROR:
          case Token.EOF:
          case Token.RC:
            break bodyLoop;
          case Token.FUNCTION:  // save the stack
            this.consumeToken();
            n = this.functionDecl([]);
            break;
          default:
            n = this.statement();
            break;
        }
        cell = cell.cdr = cons(n, cell.cdr);
    }
    return head.cdr;
};


proto.functionDecl = function ( labels )
{
    var baseLineno = this.ts.getLineno();  // line number where source starts
    this.mustMatchToken(Token.NAME, "msg.no.func.name");
    var name   = new Identifier(this.ts.getString());
    var params = this.parameterList();
    var body   = this.functionBody();
    return new FunctionDeclaration(labels, name, params, body, baseLineno, this.source);
};

proto.functionExpr = function ( )
{
    var name = null;
    if ( this.matchToken(Token.NAME) ) name = new Identifier(this.ts.getString());
    var params = this.parameterList();
    var body   = this.functionBody();
    return new FunctionExpression(name, params, body);
};

proto.parameterList = function ( )
{
    this.mustMatchToken(Token.LP, "msg.no.paren.parms");
    if ( this.matchToken(Token.RP) ) return [];
    var params = [];
    var exists = new IdentifierSet();
    do {
        this.mustMatchToken(Token.NAME, "msg.no.parm");
        var p = new Identifier(this.ts.getString());
        if ( exists.has(p) ) this.addWarning("msg.dup.parms", s);
        params.push(p);
        exists.add(p);
    } while ( this.matchToken(Token.COMMA) );
    this.mustMatchToken(Token.RP, "msg.no.paren.after.parms");
    return params;
};

proto.functionBody = function ( )
{
    this.mustMatchToken(Token.LC, "msg.no.brace.body");
    
    var saveAllLabel  = this.allLabelSet;
    var saveLoopLabel = this.loopLabelSet;
    var saveLoop      = this.nestingOfLoop;
    var saveSwitch    = this.nestingOfSwitch;
    this.allLabelSet  = new IdentifierSet();
    this.loopLabelSet = new IdentifierSet();
    this.nestingOfLoop   = 0;
    this.nestingOfSwitch = 0;
    this.nestingOfFunction++;
    try {
        var body = this.statements();
    } catch ( e ) {
        if ( e instanceof ParserException ) {
            // Ignore it
        } else {
            throw e;
        }
    } finally {
        this.allLabelSet     = saveAllLabel;
        this.loopLabelSet    = saveLoopLabel;
        this.nestingOfLoop   = saveLoop;
        this.nestingOfSwitch = saveSwitch;
        this.nestingOfFunction--;
    }

    this.mustMatchToken(Token.RC, "msg.no.brace.after.body");
    return body;
};


proto.statement = function ( )
{
    try {
        var n = this.statementHelper([]);
        if ( n != null ) return n;
    } catch ( e ) {
        if ( e instanceof ParserException ) {
            // Ignore it.
        } else {
            throw e;
        }
    }

    // skip to end of statement
    guessingStatementEnd: for (;;) {
        var tt = this.peekTokenOrEOL();
        this.consumeToken();
        switch ( tt ) {
          case Token.ERROR:
          case Token.EOF:
          case Token.EOL:
          case Token.SEMI:
            break guessingStatementEnd;
        }
    }
    return null;
};

proto.statementHelper = function ( labels )
{
    var statement = null;
    switch ( this.peekToken() ) {
      case Token.IF: {
        this.consumeToken();
        var lineno = this.ts.getLineno();
        var cond   = this.condition();
        var tstat  = this.statement();
        if ( this.matchToken(Token.ELSE) ) {
            return new IfElseStatement(labels, cond, tstat, this.statement(), lineno, this.source);
        } else {
            return new IfStatement(labels, cond, tstat, lineno, this.source);
        }
      }

      case Token.SWITCH: {
        this.consumeToken();
        var lineno = this.ts.getLineno();
        this.mustMatchToken(Token.LP, "msg.no.paren.switch");
        var exp = this.expr(false);
        this.mustMatchToken(Token.RP, "msg.no.paren.after.switch");
        this.mustMatchToken(Token.LC, "msg.no.brace.switch");
        var switchStatement = new SwitchStatement(labels, exp, nil(), lineno, this.source);
        var clauses = switchStatement;
        this.nestingOfSwitch++;
        try {
            var hasDefault = false;
            switchLoop: for (;;) {
                var lineno = this.ts.getLineno();
                var caseExpression;
                switch ( this.nextToken() ) {
                  case Token.RC:
                    break switchLoop;
                  case Token.CASE:
                    caseExpression = this.expr(false);
                    this.mustMatchToken(Token.COLON, "msg.no.colon.case");
                    break;
                  case Token.DEFAULT:
                    if ( hasDefault ) this.reportError("msg.double.switch.default");
                    hasDefault     = true;
                    caseExpression = null;
                    this.mustMatchToken(Token.COLON, "msg.no.colon.case");
                    break;
                  default:
                    this.reportError("msg.bad.switch");
                    break switchLoop;
                }
                var c = caseExpression
                          ?  new CaseClause(caseExpression, this.statementsInSwitch, lineno, this.source)
                          :  new DefaultClause(this.statementsInSwitch, lineno, this.source);
                clauses = clauses.cdr = cons(c, clauses.cdr);
            }
        } finally {
            this.nestingOfSwitch--;
        }
        return switchStatement;
      }

      case Token.WHILE: {
        this.consumeToken();
        var lineno = this.ts.getLineno();
        this.enterLoop(labels);
        try {
            return new WhileStatement(labels, this.condition(), this.statement(), lineno, this.source);
        } finally {
            this.exitLoop(labels);
        }
      }

      case Token.DO: {
        this.consumeToken();
        var lineno = this.ts.getLineno();
        this.enterLoop(labels);
        try {
            var body = this.statement();
        } finally {
            this.exitLoop(labels);
        }
        this.mustMatchToken(Token.WHILE, "msg.no.while.do");
        var cond = this.condition();
        // Always auto-insert semicon to follow SpiderMonkey:
        // It is required by EMAScript but is ignored by the rest of
        // world, see bug 238945
        this.matchToken(Token.SEMI);
        return new DoWhileStatement(labels, body, cond, lineno, this.source);
      }

      case Token.FOR: {
        this.consumeToken();
        var lineno = this.ts.getLineno();

        var init;  // init is also foo in 'foo in Object'
        var cond;  // cond is also object in 'foo in Object'
        var incr = null;
        var body;

        var isForEach = false;
        var isForIn   = false;
        var isVar     = false;

        // See if this is a for each () instead of just a for ()
        if ( this.matchToken(Token.NAME) ) {
            if ( this.ts.getString() === "each" ) {
                isForEach = true;
            } else {
                this.reportError("msg.no.paren.for");
            }
        }

        this.mustMatchToken(Token.LP, "msg.no.paren.for");

        var tt = this.peekToken();
        if ( tt === Token.SEMI ) {
            init = null;
        } else {
            if ( tt === Token.VAR ) {
                // set init to a var list or initial
                this.consumeToken();    // consume the 'var' token
                init  = this.variables(true);
                isVar = true;
            }
            else {
                init = this.expr(true);
            }
        }

        if ( this.matchToken(Token.IN) ) {
            isForIn = true;
            // 'cond' is the object over which we're iterating
            cond = this.expr(false);
        } else {  // ordinary for loop
            this.mustMatchToken(Token.SEMI, "msg.no.semi.for");
            if ( this.peekToken() === Token.SEMI ) {
                // no loop condition
                cond = null;
            } else {
                cond = this.expr(false);
            }

            this.mustMatchToken(Token.SEMI, "msg.no.semi.for.cond");
            if ( this.peekToken() === Token.RP ) {
                incr = null;
            } else {
                incr = this.expr(false);
            }
        }

        this.mustMatchToken(Token.RP, "msg.no.paren.for.ctrl");

        this.enterLoop(labels);
        try {
            body = this.statement();
        } finally {
            this.exitLoop(labels);
        }
        
        if ( !isForIn ) {
            // Although SpiderMonkey doesn't allow "for each ( ...; ...; ... )",
            // Rhino1.6R5 allowed it. We follow Rhino's position here.
            if ( isVar ) return new ForVarStatement(labels, init, cond, incr, body, lineno, this.source);
            else         return new ForStatement(labels, init, cond, incr, body, lineno, this.source);
        } else {
            if ( isVar ) {
                // Check if init (var declarations) contains only one.
                if ( init.length != 1 ) this.reportError("msg.mult.index");
                if ( isForEach ) return new ForEachVarStatement(labels, init[0], cond, body, lineno, this.source);
                else             return new ForInVarStatement(labels, init[0], cond, body, lineno, this.source);
            } else {
                // Check if init (an expression left-hand-side of "in") has lvalue.
                if ( !init.hasLvalue() ) this.reportError("msg.bad.for.in.lhs");
                if ( isForEach ) return new ForEachStatement(labels, init, cond, body, lineno, this.source);
                else             return new ForInStatement(labels, init, cond, body, lineno, this.source);
            }
        }
      }

      case Token.TRY: {
        this.consumeToken();
        var lineno = this.ts.getLineno();

        // Although ECMA262-3 requires a block here, Rhino1.6R5 allows any kind of statement.
        // We follow Rhino's style, but issue warning when a statement is not a block.
        var tryBlock = this.statement();
        if ( !(tryBlock instanceof Block) ) {
            this.addWarning("msg.no.brace.tryblock");
            tryBlock = new Block([], cons(tryBlock, nil()), tryBlock.lineno, tryBlock.source);
        }

        var catchList;
        var cell = catchList = cons(null, nil());
        var sawDefaultCatch = false;
        var peek = this.peekToken();
        if ( peek === Token.CATCH ) {
            while ( this.matchToken(Token.CATCH) ) {
                if ( sawDefaultCatch ) this.reportError("msg.catch.unreachable");
                var line = this.ts.getLineno();
                this.mustMatchToken(Token.LP, "msg.no.paren.catch");
                this.mustMatchToken(Token.NAME, "msg.bad.catchcond");
                var variable = new Identifier(this.ts.getString());

                var cond = null;
                if ( this.matchToken(Token.IF) ) {
                    cond = this.expr(false);
                } else {
                    sawDefaultCatch = true;
                }

                this.mustMatchToken(Token.RP, "msg.bad.catchcond");
                this.mustMatchToken(Token.LC, "msg.no.brace.catchblock");
                var block = new Block([], this.statements(), line, this.source);
                this.mustMatchToken(Token.RC, "msg.no.brace.after.body");

                var clause = new CatchGuard(variable, cond, block, line, this.source);
                cell = cell.cdr = cons(clause, cell.cdr);
            }
        } else if ( peek !== Token.FINALLY ) {
            this.mustMatchToken(Token.FINALLY, "msg.try.no.catchfinally");
        }
        catchList = catchList.cdr;

        var finallyBlock = null;
        if ( this.matchToken(Token.FINALLY) ) {
            // Rhino also allows any kind of statement here.
            finallyBlock = this.statement();
            if ( !(finallyBlock instanceof Block) ) {
                this.addWarning("msg.no.brace.finallyblock");
                finallyBlock = new Block([], cons(finallyBlock, nil()), finallyBlock.lineno, finallyBlock.source);
            }
        }

        return finallyBlock
                 ? new TryCatchListFinallyStatement(labels, tryBlock, catchList, finallyBlock, lineno, this.source)
                 : new TryCatchListStatement(labels, tryBlock, catchList, lineno, this.source);
      }

      case Token.THROW: {
        this.consumeToken();
        if ( this.peekTokenOrEOL() === Token.EOL ) {
            // ECMAScript does not allow new lines before throw expression,
            // see bug 256617
            this.reportError("msg.bad.throw.eol");
        }

        var lineno = this.ts.getLineno();
        statement = new ThrowStatement(labels, this.expr(false), lineno, this.source);
        break;
      }

      case Token.BREAK: {
        this.consumeToken();
        var lineno = this.ts.getLineno();
        var target = this.matchJumpLabelName(Token.BREAK);
        if ( target == null ) {
            if ( !this.nestingOfLoop || !this.nestingOfSwitch ) this.reportError("msg.bad.break");
        }
        statement = new BreakStatement(labels, target, lineno, this.source);
        break;
      }

      case Token.CONTINUE: {
        this.consumeToken();
        var lineno = this.ts.getLineno();
        var target = this.matchJumpLabelName(Token.CONTINUE);
        if ( target == null ) {
            if ( !this.nestingOfLoop ) reportError("msg.continue.outside");
        }
        statement = new ContinueStatement(labels, target, lineno, this.source);
        break;
      }

      case Token.WITH: {
        this.consumeToken();
        var lineno = this.ts.getLineno();
        this.mustMatchToken(Token.LP, "msg.no.paren.with");
        var exp = this.expr(false);
        this.mustMatchToken(Token.RP, "msg.no.paren.after.with");
        var body = this.statement();
        return new WithStatement(labels, exp, body, lineno, this.source);
      }

      case Token.VAR: {
        this.consumeToken();
        statement = new VarStatement(labels, this.variables(false), lineno, this.source);
        break;
      }

      case Token.RETURN: {
        if ( !this.insideFunction() ) this.reportError("msg.bad.return");
        this.consumeToken();
        var lineno = this.ts.getLineno();
        var exp;
        /* This is ugly, but we don't want to require a semicolon. */
        switch ( this.peekTokenOrEOL() ) {
          case Token.SEMI:
          case Token.RC:
          case Token.EOF:
          case Token.EOL:
          case Token.ERROR:
            exp = null;
            break;
          default:
            exp = this.expr(false);
        }
        statement = new ReturnStatement(labels, exp, lineno, this.source);
        break;
      }

      case Token.LC:
        this.consumeToken();
        var block = new Block(labels, this.statements(), lineno, this.source);
        this.mustMatchToken(Token.RC, "msg.no.brace.block");
        return block;

      case Token.ERROR:
        // Fall thru, to have a node for error recovery to work on
      case Token.SEMI:
        this.consumeToken();
        return new EmptyStatement(labels, lineno, this.source);

      case Token.FUNCTION: {
        this.consumeToken();
        return this.functionDecl(labels);
      }

      case Token.DEFAULT: {
        this.consumeToken();
        this.reportError("msg.XML.not.available");
      }

      case Token.NAME: {
        var lineno = this.ts.getLineno();
        this.setCheckForLabel();
        try {
            statement = new ExpStatement(labels, this.expr(false), lineno, this.source);
        } catch ( e ) {
            if ( e instanceof LabelException ) {
                // Label found!
                if ( this.allLabelSet.has(e.label) ) this.reportError("msg.dup.label");
                this.allLabelSet.add(e.label);
                labels.push(e.label);
                try {
                    return this.statementHelper(labels);
                } finally {
                    this.allLabelSet.remove(e.label);
                }
            } else {
                throw e;
            }
        }
        break;
      }

      default: {
        var lineno = this.ts.getLineno();
        statement = new ExpStatement(labels, this.expr(false), lineno, this.source);
        break;
      }
    }

    switch ( this.peekTokenOrEOL() ) {
      case Token.SEMI:
        // Consume ';' as a part of statement
        this.consumeToken();
        break;
      case Token.ERROR:
      case Token.EOF:
      case Token.EOL:
      case Token.RC:
        // Autoinsert ;
        break;
      default:
        // Report error if no EOL or autoinsert ; otherwise
        this.reportError("msg.no.semi.stmt");
    }

    return statement;
};

proto.condition = function ( )
{
    this.mustMatchToken(Token.LP, "msg.no.paren.cond");
    var exp = this.expr(false);
    this.mustMatchToken(Token.RP, "msg.no.paren.after.cond");
    if ( exp instanceof SimpleAssignExpression ) this.addWarning("msg.assign.cond");
    return exp;
};

// match a NAME; return null if no match.
proto.matchJumpLabelName = function ( token )
{
    if ( this.peekTokenOrEOL() !== Token.NAME ) return null;
    var label = new Identifier(this.ts.getString());
    this.consumeToken();
    switch ( token ) {
      case Token.CONTINUE:
        if ( !this.loopLabelSet.has(label) ) {
            this.reportError("msg.undef.label");
        }
        break;
      case Token.BREAK:
        if ( !this.labelSet.has(label) ) {
            this.reportError("msg.undef.label");
        }
        break;
      default:
        throw Kit.codeBug();
    }
    return label;
};

proto.statementsInSwitch = function ( )
{
    var head, cell;
    head = cell = cons(null, nil());
    clauseLoop: for (;;) {
        switch ( this.peekToken() ) {
          case Token.ERROR:
          case Token.EOF:
          case Token.RC:
          case Token.CASE:
            break clauseLoop;
          case Token.DEFAULT:
            this.consumeToken();
            var tt = this.peekToken();
            this.ungetToken(Token.DEFAULT);
            if ( tt === Token.COLON ) break clauseLoop;
            // fall thru
          default:
            cell = cell.cdr = cons(this.statement(), cell.cdr);
        }
    }
    return head.cdr;
};

proto.variables = function ( inForInit )
{
    var decls = [];
    for (;;) {
        this.mustMatchToken(Token.NAME, "msg.bad.var");
        var name = new Identifier(this.ts.getString());
        var init = this.matchToken(Token.ASSIGN)
                     ?  this.assignExpr(inForInit)
                     :  null;
        decls.push({id: name, exp: init});
        if ( !this.matchToken(Token.COMMA) ) break;
    }
    return decls;
};


proto.expr = function ( inForInit )
{
    var exp = this.assignExpr(inForInit);
    while ( this.matchToken(Token.COMMA) ) {
        exp = new CommaExpression(exp, this.assignExpr(inForInit));
    }
    return exp;
};


proto.assignExpr = function ( inForInit )
{
    var exp = this.condExpr(inForInit);
    var tt  = this.peekToken();
    if ( tt < Token.FIRST_ASSIGN || Token.LAST_ASSIGN < tt ) return exp;

    if ( !exp.hasLvalue() ) this.reportError("msg.bad.assign.left");

    switch ( this.nextToken() ) {
      case Token.ASSIGN:
        return new SimpleAssignExpression(exp, this.assignExpr(inForInit));
      case Token.ASSIGN_BITOR:
        return new BitOrAssignExpression(exp, this.assignExpr(inForInit));
      case Token.ASSIGN_BITXOR:
        return new BitXorAssignExpression(exp, this.assignExpr(inForInit));
      case Token.ASSIGN_BITAND:
        return new BitAndAssignExpression(exp, this.assignExpr(inForInit));
      case Token.ASSIGN_LSH:
        return new LShiftAssignExpression(exp, this.assignExpr(inForInit));
      case Token.ASSIGN_RSH:
        return new RShiftAssignExpression(exp, this.assignExpr(inForInit));
      case Token.ASSIGN_URSH:
        return new URShiftAssignExpression(exp, this.assignExpr(inForInit));
      case Token.ASSIGN_ADD:
        return new AddAssignExpression(exp, this.assignExpr(inForInit));
      case Token.ASSIGN_SUB:
        return new SubAssignExpression(exp, this.assignExpr(inForInit));
      case Token.ASSIGN_MUL:
        return new MulAssignExpression(exp, this.assignExpr(inForInit));
      case Token.ASSIGN_DIV:
        return new DivAssignExpression(exp, this.assignExpr(inForInit));
      case Token.ASSIGN_MOD:
        return new ModAssignExpression(exp, this.assignExpr(inForInit));
      default:
        throw Kit.codeBug();
    }
};


proto.condExpr = function ( inForInit )
{
    var exp = this.orExpr(inForInit);
    if ( !this.matchToken(Token.HOOK) ) return exp;
    var ifTrue = this.assignExpr(false);
    this.mustMatchToken(Token.COLON, "msg.no.colon.cond");
    var ifFalse = this.assignExpr(inForInit);
    return new ConditionalExpression(exp, ifTrue, ifFalse);
};


proto.orExpr = function ( inForInit )
{
    var exp = this.andExpr(inForInit);
    while ( this.matchToken(Token.OR) ) {
        exp = new OrExpression(exp, this.andExpr(inForInit));
    }
    return exp;
};


proto.andExpr = function ( inForInit )
{
    var exp = this.bitOrExpr(inForInit);
    while ( this.matchToken(Token.AND) ) {
        exp = new AndExpression(exp, this.bitOrExpr(inForInit));
    }
    return exp;
};


proto.bitOrExpr = function ( inForInit )
{
    var exp = this.bitXorExpr(inForInit);
    while ( this.matchToken(Token.BITOR) ) {
        exp = new BitOrExpression(exp, this.bitXorExpr(inForInit));
    }
    return exp;
};


proto.bitXorExpr = function ( inForInit )
{
    var exp = this.bitAndExpr(inForInit);
    while ( this.matchToken(Token.BITXOR) ) {
        exp = new BitXorExpression(exp, this.bitAndExpr(inForInit));
    }
    return exp;
};


proto.bitAndExpr = function ( inForInit )
{
    var exp = this.eqExpr(inForInit);
    while ( this.matchToken(Token.BITAND) ) {
        exp = new BitAndExpression(exp, this.eqExpr(inForInit));
    }
    return exp;
};


proto.eqExpr = function ( inForInit )
{
    var exp = this.relExpr(inForInit);
    for (;;) {
        var constructor;
        switch ( this.peekToken() ) {
          case Token.EQ:
            constructor = EqualExpression;
            break;
          case Token.NE:
             constructor = NotEqualExpression;
            break;
          case Token.SHEQ:
            constructor = StrictEqualExpression;
            break;
          case Token.SHNE:
            constructor = StrictNotEqualExpression;
            break;
          default:
            return exp;
        }
        this.consumeToken();
        exp = new constructor(exp, this.relExpr(inForInit));
    }
};


proto.relExpr = function ( inForInit )
{
    var exp = this.shiftExpr();
    for (;;) {
        var constructor;
        switch ( this.peekToken() ) {
          case Token.IN:
            if ( inForInit ) return exp;
            constructor = InExpression;
            break;
          case Token.INSTANCEOF:
            constructor = InstanceofExpression;
            break;
          case Token.LE:
            constructor = LessEqualExpression;
            break;
          case Token.LT:
            constructor = LessThanExpression;
            break;
          case Token.GE:
            constructor = GreaterEqualExpression;
            break;
          case Token.GT:
            constructor = GreaterThanExpression;
            break;
          default:
            return exp;
        }
        this.consumeToken();
        exp = new constructor(exp, this.shiftExpr());
    }
};


proto.shiftExpr = function ( )
{
    var exp = this.addExpr();
    for (;;) {
        var constructor;
        switch ( this.peekToken() ) {
          case Token.LSH:
            constructor = LShiftExpression;
            break;
          case Token.RSH:
            constructor = RShiftExpression;
            break;
          case Token.URSH:
            constructor = URShiftExpression;
            break;
          default:
            return exp;
        }
        this.consumeToken();
        exp = new constructor(exp, this.addExpr());
    }
};


proto.addExpr = function ( )
{
    var exp = this.mulExpr();
    for (;;) {
        var constructor;
        switch ( this.peekToken() ) {
          case Token.ADD:
            constructor = AddExpression;
            break;
          case Token.SUB:
            constructor = SubExpression;
            break;
          default:
            return exp;
        }
        this.consumeToken();
        exp = new constructor(exp, this.mulExpr());
    }
};


proto.mulExpr = function ( )
{
    var exp = this.unaryExpr();
    for (;;) {
        var constructor;
        switch ( this.peekToken() ) {
          case Token.MUL:
            constructor = MulExpression;
            break;
          case Token.DIV:
            constructor = DivExpression;
            break;
          case Token.MOD:
            constructor = ModExpression;
            break;
          default:
            return exp;
        }
        this.consumeToken();
        exp = new constructor(exp, this.unaryExpr());
    }
};


proto.unaryExpr = function ( )
{
    var constructor;
    var needLvalue = null;
    switch( this.peekToken() ) {
      case Token.VOID:
        constructor = VoidExpression;
        break;
      case Token.NOT:
        constructor = NotExpression;
        break;
      case Token.BITNOT:
        constructor = BitNotExpression;
        break;
      case Token.TYPEOF:
        constructor = TypeofExpression;
        break;
      case Token.ADD:
        constructor = PosExpression;
        break;
      case Token.SUB:
        constructor = NegExpression;
        break;
      case Token.INC:
        constructor = PreIncExpression;
        needLvalue = "msg.bad.incr";
        break;
    case Token.DEC:
        constructor = PreDecExpression;
        needLvalue = "msg.bad.decr";
        break;
    case Token.DELPROP:
        constructor = DeleteExpression;
        break;
    default:
        var exp = this.memberExpr(true);
        // Don't look across a newline boundary for a postfix incop.
        switch ( this.peekTokenOrEOL() ) {
          case Token.INC:
            if ( !exp.hasLvalue() ) this.reportError("msg.bad.incr");
            this.consumeToken();
            return new PostIncExpression(exp);
          case Token.DEC:
            if ( !exp.hasLvalue() ) this.reportError("msg.bad.decr");
            this.consumeToken();
            return new PostDecExpression(exp);
          default:
            return exp;
        }
    }
    this.consumeToken();
    var exp = this.unaryExpr();
    if ( needLvalue  &&  !exp.hasLvalue() ) this.reportError(needLvalue);
    return new constructor(exp);
};


proto.argumentList = function ( )
{
    if ( this.matchToken(Token.RP) ) return [];
    var args = [];
    do {
        args.push( this.assignExpr(false) );
    } while ( this.matchToken(Token.COMMA) );
    this.mustMatchToken(Token.RP, "msg.no.paren.arg");
    return args;
};


proto.memberExpr = function ( allowCallSyntax )
{
    var base;
    if ( this.matchToken(Token.NEW) ) {
        var func = this.memberExpr(false);
        var args = this.matchToken(Token.LP)
                     ?  this.argumentList()
                     :  [];
        base = new NewExpression(func, args);
    } else {
        base = this.primaryExpr();
    }
    return this.memberExprTail(allowCallSyntax, base);
}


proto.memberExprTail = function ( allowCallSyntax, base )
{
    tailLoop: for (;;) {
        switch ( this.peekToken() ) {
          case Token.DOTDOT:
            this.reportError("msg.XML.not.available");

          case Token.DOT: {
            this.consumeToken();
            switch ( this.nextToken() ) {
              case Token.NAME:
                base = new DotAccessor(base, new Identifier(this.ts.getString()));
                break;
              case Token.MUL:
                this.reportError("msg.XML.not.available");
              case Token.XMLATTR:
                this.reportError("msg.XML.not.available");
              default:
                this.reportError("msg.no.name.after.dot");
            }
          }
          break;

          case Token.DOTQUERY:
            this.reportError("msg.XML.not.available");

          case Token.LB:
            this.consumeToken();
            base = new BracketAccessor(base, this.expr(false));
            this.mustMatchToken(Token.RB, "msg.no.bracket.index");
            break;

          case Token.LP:
            if ( !allowCallSyntax ) break tailLoop;
            this.consumeToken();
            base = new CallExpression(base, this.argumentList());
            break;

          default:
            break tailLoop;
        }
    }
    return base;
};


proto.primaryExpr = function ( )
{
    var exp;
    var ttFlagged = this.nextFlaggedToken();
    var tt = ttFlagged & CLEAR_TI_MASK;
    switch ( tt ) {

      case Token.FUNCTION:
        return this.functionExpr();

      case Token.LB: {
        var elems = [];
        elemLoop: for (;;) {
            switch ( this.peekToken() ) {
              case Token.RB:
                this.consumeToken();
                break elemLoop;
              case Token.COMMA:
                while ( this.matchToken(Token.COMMA) ) {
                    elems.push(new Elision());
                }
                break;
              default:
                elems.push(this.assignExpr(false));
                if ( this.matchToken(Token.COMMA) ) {
                    continue elemLoop;
                } else if ( this.matchToken(Token.RB) ) {
                    break elemLoop;
                } else {
                    this.reportError("msg.no.bracket.arg");
                }
            }
        }
        return new ArrayInitializer(elems);
      }

      case Token.LC: {
        var pairs = [];
        commaloop: do {
            var prop;
            switch ( this.peekToken() ) {
              case Token.NAME:
                this.consumeToken();
                prop = new Identifier(this.ts.getString());
                break;
              case Token.STRING:
                this.consumeToken();
                prop = new StringLiteral(this.ts.getString());
                break;
              case Token.NUMBER:
                this.consumeToken();
                prop = new NumberLiteral(this.ts.getString());
                break;
              case Token.RC:
                // trailing comma is OK.
                break commaloop;
            default:
                this.reportError("msg.bad.prop");
                break commaloop;
            }
            this.mustMatchToken(Token.COLON, "msg.no.colon.prop");
            pairs.push({prop:prop, exp:this.assignExpr(false)});
        } while ( this.matchToken(Token.COMMA) );
        this.mustMatchToken(Token.RC, "msg.no.brace.prop");
        return new ObjectInitializer(pairs);
      }

      case Token.LP:
        var exp = this.expr(false);
        this.mustMatchToken(Token.RP, "msg.no.paren");
        return exp;

      case Token.XMLATTR:
        this.reportError("msg.XML.not.available");

      case Token.NAME:
        var name = new Identifier(this.ts.getString());
        if ( ttFlagged & TI_CHECK_LABEL ) {
            if ( this.matchToken(Token.COLON) ) throw new LabelException(name);
        }
        return name;

      case Token.NUMBER:
        return new NumberLiteral(this.ts.getString());

      case Token.STRING:
        return new StringLiteral(this.ts.getString());

      case Token.DIV:
      case Token.ASSIGN_DIV:
        // Got / or /= which should be treated as regexp in fact
        this.ts.readRegExp(tt);
        return new RegExpLiteral(this.ts.getString());

      case Token.NULL:
        return new NullLiteral();
        
      case Token.THIS:
        return new ThisExpression();

      case Token.TRUE:
        return new TrueLiteral();

      case Token.FALSE:
        return new FalseLiteral();

      case Token.RESERVED:
        this.reportError("msg.reserved.id");
        break;

      case Token.ERROR:
        /* the scanner or one of its subroutines reported the error. */
        break;

      case Token.EOF:
        this.reportError("msg.unexpected.eof");
        break;

      default:
        this.reportError("msg.syntax");
        break;
    }
    return null;    // should never reach here
}


