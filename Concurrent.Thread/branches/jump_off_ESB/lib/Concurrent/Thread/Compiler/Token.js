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
 *   Roger Lawrence
 *   Mike McCabe
 *   Igor Bukanov
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
 * This file is based on the file Token.java in Rhino 1.6R5.
 */



//@esmodpp
//@version 0.0.0
//@namespace Concurrent.Thread.Compiler
//@require   Concurrent.Thread
//@require   Concurrent.Thread.Compiler.Kit



//@export Token
var Token = {};

// Although Token is in fact a namespace, we here implements it
// "manually" because of efficiency.


// start enum
Token.ERROR          = -1; // well-known as the only code < EOF
Token.EOF            = 0;  // end of file token - (not EOF_CHAR)
Token.EOL            = 1;  // end of line

// Interpreter reuses the following as bytecodes
Token.FIRST_BYTECODE_TOKEN    = 2;

Token.ENTERWITH      = 2;
Token.LEAVEWITH      = 3;
Token.RETURN         = 4;
Token.GOTO           = 5;
Token.IFEQ           = 6;
Token.IFNE           = 7;
Token.SETNAME        = 8;
Token.BITOR          = 9;
Token.BITXOR         = 10;
Token.BITAND         = 11;
Token.EQ             = 12;
Token.NE             = 13;
Token.LT             = 14;
Token.LE             = 15;
Token.GT             = 16;
Token.GE             = 17;
Token.LSH            = 18;
Token.RSH            = 19;
Token.URSH           = 20;
Token.ADD            = 21;
Token.SUB            = 22;
Token.MUL            = 23;
Token.DIV            = 24;
Token.MOD            = 25;
Token.NOT            = 26;
Token.BITNOT         = 27;
Token.POS            = 28;
Token.NEG            = 29;
Token.NEW            = 30;
Token.DELPROP        = 31;
Token.TYPEOF         = 32;
Token.GETPROP        = 33;
Token.SETPROP        = 34;
Token.GETELEM        = 35;
Token.SETELEM        = 36;
Token.CALL           = 37;
Token.NAME           = 38;
Token.NUMBER         = 39;
Token.STRING         = 40;
Token.NULL           = 41;
Token.THIS           = 42;
Token.FALSE          = 43;
Token.TRUE           = 44;
Token.SHEQ           = 45;   // shallow equality (===)
Token.SHNE           = 46;   // shallow inequality (!==)
Token.REGEXP         = 47;
Token.BINDNAME       = 48;
Token.THROW          = 49;
Token.RETHROW        = 50; // rethrow caught execetion: catch (e if ) use it
Token.IN             = 51;
Token.INSTANCEOF     = 52;
Token.LOCAL_LOAD     = 53;
Token.GETVAR         = 54;
Token.SETVAR         = 55;
Token.CATCH_SCOPE    = 56;
Token.ENUM_INIT_KEYS = 57;
Token.ENUM_INIT_VALUES = 58;
Token.ENUM_NEXT      = 59;
Token.ENUM_ID        = 60;
Token.THISFN         = 61;
Token.RETURN_RESULT  = 62; // to return prevoisly stored return result
Token.ARRAYLIT       = 63; // array literal
Token.OBJECTLIT      = 64; // object literal
Token.GET_REF        = 65; // *reference
Token.SET_REF        = 66; // *reference    : something
Token.DEL_REF        = 67; // delete reference
Token.REF_CALL       = 68; // f(args)    = something or f(args)++
Token.REF_SPECIAL    = 69; // reference for special properties like __proto

// For XML support:
Token.DEFAULTNAMESPACE = 70; // default xml namespace =
Token.ESCXMLATTR     = 71;
Token.ESCXMLTEXT     = 72;
Token.REF_MEMBER     = 73; // Reference for x.@y, x..y etc.
Token.REF_NS_MEMBER  = 74; // Reference for x.ns::y, x..ns::y etc.
Token.REF_NAME       = 75; // Reference for @y, @[y] etc.
Token.REF_NS_NAME    = 76; // Reference for ns::y, @ns::y@[y] etc.

// End of interpreter bytecodes

Token.LAST_BYTECODE_TOKEN = Token.REF_NS_NAME;

Token.TRY            = 77;
Token.SEMI           = 78;  // semicolon
Token.LB             = 79;  // left and right brackets
Token.RB             = 80;
Token.LC             = 81;  // left and right curlies (braces)
Token.RC             = 82;
Token.LP             = 83;  // left and right parentheses
Token.RP             = 84;
Token.COMMA          = 85;  // comma operator

Token.ASSIGN         = 86;  // simple assignment  (=)
Token.ASSIGN_BITOR   = 87;  // |=
Token.ASSIGN_BITXOR  = 88;  // ^=
Token.ASSIGN_BITAND  = 89;  // |=
Token.ASSIGN_LSH     = 90;  // <<=
Token.ASSIGN_RSH     = 91;  // >>=
Token.ASSIGN_URSH    = 92;  // >>>=
Token.ASSIGN_ADD     = 93;  // +=
Token.ASSIGN_SUB     = 94;  // -=
Token.ASSIGN_MUL     = 95;  // *=
Token.ASSIGN_DIV     = 96;  // /=
Token.ASSIGN_MOD     = 97;  // %=

Token.FIRST_ASSIGN   = Token.ASSIGN;
Token.LAST_ASSIGN    = Token.ASSIGN_MOD;

Token.HOOK           = 98; // conditional (?:)
Token.COLON          = 99;
Token.OR             = 100; // logical or (||)
Token.AND            = 101; // logical and (&&)
Token.INC            = 102; // increment/decrement (++ --)
Token.DEC            = 103;
Token.DOT            = 104; // member operator (.)
Token.FUNCTION       = 105; // function keyword
Token.EXPORT         = 106; // export keyword
Token.IMPORT         = 107; // import keyword
Token.IF             = 108; // if keyword
Token.ELSE           = 109; // else keyword
Token.SWITCH         = 110; // switch keyword
Token.CASE           = 111; // case keyword
Token.DEFAULT        = 112; // default keyword
Token.WHILE          = 113; // while keyword
Token.DO             = 114; // do keyword
Token.FOR            = 115; // for keyword
Token.BREAK          = 116; // break keyword
Token.CONTINUE       = 117; // continue keyword
Token.VAR            = 118; // var keyword
Token.WITH           = 119; // with keyword
Token.CATCH          = 120; // catch keyword
Token.FINALLY        = 121; // finally keyword
Token.VOID           = 122; // void keyword
Token.RESERVED       = 123; // reserved keywords

Token.EMPTY          = 124;

/* types used for the parse tree - these never get returned
 * by the scanner.
 */

Token.BLOCK          = 125; // statement block
Token.LABEL          = 126; // label
Token.TARGET         = 127;
Token.LOOP           = 128;
Token.EXPR_VOID      = 129; // expression statement in functions
Token.EXPR_RESULT    = 130; // expression statement in scripts
Token.JSR            = 131;
Token.SCRIPT         = 132; // top-level node for entire script
Token.TYPEOFNAME     = 133; // for typeof(simple-name)
Token.USE_STACK      = 134;
Token.SETPROP_OP     = 135; // x.y op= something
Token.SETELEM_OP     = 136; // x[y] op= something
Token.LOCAL_BLOCK    = 137;
Token.SET_REF_OP     = 138; // *reference op= something

// For XML support:
Token.DOTDOT         = 139;  // member operator (..)
Token.COLONCOLON     = 140;  // namespace::name
Token.XML            = 141;  // XML type
Token.DOTQUERY       = 142;  // .() -- e.g., x.emps.emp.(name == "terry")
Token.XMLATTR        = 143;  // @
Token.XMLEND         = 144;

// Optimizer-only-tokens
Token.TO_OBJECT      = 145;
Token.TO_DOUBLE      = 146;

Token.LAST_TOKEN     = 146;


Token.name = function ( token ) 
{
    if ( !Kit.printTrees ) return String(token);
    with ( Token ) {
        switch ( token ) {
          case ERROR:           return "ERROR";
          case EOF:             return "EOF";
          case EOL:             return "EOL";
          case ENTERWITH:       return "ENTERWITH";
          case LEAVEWITH:       return "LEAVEWITH";
          case RETURN:          return "RETURN";
          case GOTO:            return "GOTO";
          case IFEQ:            return "IFEQ";
          case IFNE:            return "IFNE";
          case SETNAME:         return "SETNAME";
          case BITOR:           return "BITOR";
          case BITXOR:          return "BITXOR";
          case BITAND:          return "BITAND";
          case EQ:              return "EQ";
          case NE:              return "NE";
          case LT:              return "LT";
          case LE:              return "LE";
          case GT:              return "GT";
          case GE:              return "GE";
          case LSH:             return "LSH";
          case RSH:             return "RSH";
          case URSH:            return "URSH";
          case ADD:             return "ADD";
          case SUB:             return "SUB";
          case MUL:             return "MUL";
          case DIV:             return "DIV";
          case MOD:             return "MOD";
          case NOT:             return "NOT";
          case BITNOT:          return "BITNOT";
          case POS:             return "POS";
          case NEG:             return "NEG";
          case NEW:             return "NEW";
          case DELPROP:         return "DELPROP";
          case TYPEOF:          return "TYPEOF";
          case GETPROP:         return "GETPROP";
          case SETPROP:         return "SETPROP";
          case GETELEM:         return "GETELEM";
          case SETELEM:         return "SETELEM";
          case CALL:            return "CALL";
          case NAME:            return "NAME";
          case NUMBER:          return "NUMBER";
          case STRING:          return "STRING";
          case NULL:            return "NULL";
          case THIS:            return "THIS";
          case FALSE:           return "FALSE";
          case TRUE:            return "TRUE";
          case SHEQ:            return "SHEQ";
          case SHNE:            return "SHNE";
          case REGEXP:          return "OBJECT";
          case BINDNAME:        return "BINDNAME";
          case THROW:           return "THROW";
          case RETHROW:         return "RETHROW";
          case IN:              return "IN";
          case INSTANCEOF:      return "INSTANCEOF";
          case LOCAL_LOAD:      return "LOCAL_LOAD";
          case GETVAR:          return "GETVAR";
          case SETVAR:          return "SETVAR";
          case CATCH_SCOPE:     return "CATCH_SCOPE";
          case ENUM_INIT_KEYS:  return "ENUM_INIT_KEYS";
          case ENUM_INIT_VALUES:  return "ENUM_INIT_VALUES";
          case ENUM_NEXT:       return "ENUM_NEXT";
          case ENUM_ID:         return "ENUM_ID";
          case THISFN:          return "THISFN";
          case RETURN_RESULT:   return "RETURN_RESULT";
          case ARRAYLIT:        return "ARRAYLIT";
          case OBJECTLIT:       return "OBJECTLIT";
          case GET_REF:         return "GET_REF";
          case SET_REF:         return "SET_REF";
          case DEL_REF:         return "DEL_REF";
          case REF_CALL:        return "REF_CALL";
          case REF_SPECIAL:     return "REF_SPECIAL";
          case DEFAULTNAMESPACE:return "DEFAULTNAMESPACE";
          case ESCXMLTEXT:      return "ESCXMLTEXT";
          case ESCXMLATTR:      return "ESCXMLATTR";
          case REF_MEMBER:      return "REF_MEMBER";
          case REF_NS_MEMBER:   return "REF_NS_MEMBER";
          case REF_NAME:        return "REF_NAME";
          case REF_NS_NAME:     return "REF_NS_NAME";
          case TRY:             return "TRY";
          case SEMI:            return "SEMI";
          case LB:              return "LB";
          case RB:              return "RB";
          case LC:              return "LC";
          case RC:              return "RC";
          case LP:              return "LP";
          case RP:              return "RP";
          case COMMA:           return "COMMA";
          case ASSIGN:          return "ASSIGN";
          case ASSIGN_BITOR:    return "ASSIGN_BITOR";
          case ASSIGN_BITXOR:   return "ASSIGN_BITXOR";
          case ASSIGN_BITAND:   return "ASSIGN_BITAND";
          case ASSIGN_LSH:      return "ASSIGN_LSH";
          case ASSIGN_RSH:      return "ASSIGN_RSH";
          case ASSIGN_URSH:     return "ASSIGN_URSH";
          case ASSIGN_ADD:      return "ASSIGN_ADD";
          case ASSIGN_SUB:      return "ASSIGN_SUB";
          case ASSIGN_MUL:      return "ASSIGN_MUL";
          case ASSIGN_DIV:      return "ASSIGN_DIV";
          case ASSIGN_MOD:      return "ASSIGN_MOD";
          case HOOK:            return "HOOK";
          case COLON:           return "COLON";
          case OR:              return "OR";
          case AND:             return "AND";
          case INC:             return "INC";
          case DEC:             return "DEC";
          case DOT:             return "DOT";
          case FUNCTION:        return "FUNCTION";
          case EXPORT:          return "EXPORT";
          case IMPORT:          return "IMPORT";
          case IF:              return "IF";
          case ELSE:            return "ELSE";
          case SWITCH:          return "SWITCH";
          case CASE:            return "CASE";
          case DEFAULT:         return "DEFAULT";
          case WHILE:           return "WHILE";
          case DO:              return "DO";
          case FOR:             return "FOR";
          case BREAK:           return "BREAK";
          case CONTINUE:        return "CONTINUE";
          case VAR:             return "VAR";
          case WITH:            return "WITH";
          case CATCH:           return "CATCH";
          case FINALLY:         return "FINALLY";
          case RESERVED:        return "RESERVED";
          case EMPTY:           return "EMPTY";
          case BLOCK:           return "BLOCK";
          case LABEL:           return "LABEL";
          case TARGET:          return "TARGET";
          case LOOP:            return "LOOP";
          case EXPR_VOID:       return "EXPR_VOID";
          case EXPR_RESULT:     return "EXPR_RESULT";
          case JSR:             return "JSR";
          case SCRIPT:          return "SCRIPT";
          case TYPEOFNAME:      return "TYPEOFNAME";
          case USE_STACK:       return "USE_STACK";
          case SETPROP_OP:      return "SETPROP_OP";
          case SETELEM_OP:      return "SETELEM_OP";
          case LOCAL_BLOCK:     return "LOCAL_BLOCK";
          case SET_REF_OP:      return "SET_REF_OP";
          case DOTDOT:          return "DOTDOT";
          case COLONCOLON:      return "COLONCOLON";
          case XML:             return "XML";
          case DOTQUERY:        return "DOTQUERY";
          case XMLATTR:         return "XMLATTR";
          case XMLEND:          return "XMLEND";
          case TO_OBJECT:       return "TO_OBJECT";
          case TO_DOUBLE:       return "TO_DOUBLE";
        }
    }
    // Token without name
    Kit.codeBug(token);
};
