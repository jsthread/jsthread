/* The contents of this file are subject to the Netscape Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * The Original Code is Rhino code, released
 * May 6, 1999.
 *
 * The Initial Developer of the Original Code is Netscape
 * Communications Corporation.  Portions created by Netscape are
 * Copyright (C) 1997-1999 Netscape Communications Corporation. All
 * Rights Reserved.
 *
 * Contributor(s):
 * Roger Lawrence
 * Mike McCabe
 * Igor Bukanov
 * Ethan Hugg
 * Terry Lucas
 * Milen Nankov
 *
 * Alternatively, the contents of this file may be used under the
 * terms of the GNU Public License (the "GPL"), in which case the
 * provisions of the GPL are applicable instead of those above.
 * If you wish to allow use of your version of this file only
 * under the terms of the GPL and not to allow others to use your
 * version of this file under the NPL, indicate your decision by
 * deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL.  If you do not delete
 * the provisions above, a recipient may use your version of this
 * file under either the NPL or the GPL.
 */


/**
 * This class implements the JavaScript scanner.
 *
 * It is based on the C source files jsscan.c and jsscan.h
 * in the jsref package.
 *
 * @see org.mozilla.javascript.Parser
 *
 * @author Mike McCabe
 * @author Brendan Eich
 */



//@esmodpp
//@version 0.0.0
//@namespace Concurrent.Thread.Compiler
//@require   Concurrent.Thread.Compiler.Kit
//@require   Concurrent.Thread.Compiler.Token


/*
 * For chars - because we need something out-of-range
 * to check.  (And checking EOF by exception is annoying.)
 * Note distinction from EOF token type!
 */
var EOF_CHAR = String.fromCharCode(0xFFFF);  // This is equivalent to String.fromCharCode(-1).
                                             // Fortunatelly, U+FFFF is guaranteed not to be assigned for any character.


//@export TokenStream
function TokenStream( parser, sourceString, lineno )
{
    this.parser = parser;
    this.sourceString = String(sourceString);
    this.sourceEnd    = this.sourceString.length;
    this.sourceCursor = 0;

    // stuff other than whitespace since start of line
    this.dirtyLine = false;

    this.string = "";

    this.stringBuffer = [];
    this.ungetBuffer  = [];

    this.hitEOF = false;

    this.lineStart   = 0;
    this.lineno      = lineno;
    this.lineEndChar = -1;

    // for xml tokenizer
    this.xmlIsAttribute   = false;
    this.xmlIsTagContent  = false;
    this.xmlOpenTagsCount = 0;
}

var proto = TokenStream.prototype;


/* This function uses the cached op, string and number fields in
 * TokenStream; if getToken has been called since the passed token
 * was scanned, the op or string printed may be incorrect.
 */
proto.tokenToString = function ( token )
{
    if (Token.printTrees) {
        var name = Token.name(token);

        switch ( token ) {
        case Token.STRING:
        case Token.REGEXP:
        case Token.NAME:
            return name + " `" + this.string + "'";

        case Token.NUMBER:
            return "NUMBER " + this.number;
        }

        return name;
    }
    return "";
}


function isKeyword ( s )
{
    return Token.EOF != stringToKeyword(s);
}


var strIdMap = {
    "break"         : Token.BREAK,
    "case"          : Token.CASE,
    "continue"      : Token.CONTINUE,
    "default"       : Token.DEFAULT,
    "delete"        : Token.DELPROP,
    "do"            : Token.DO,
    "else"          : Token.ELSE,
    "export"        : Token.EXPORT,
    "false"         : Token.FALSE,
    "for"           : Token.FOR,
    "function"      : Token.FUNCTION,
    "if"            : Token.IF,
    "in"            : Token.IN,
    "new"           : Token.NEW,
    "null"          : Token.NULL,
    "return"        : Token.RETURN,
    "switch"        : Token.SWITCH,
    "this"          : Token.THIS,
    "true"          : Token.TRUE,
    "typeof"        : Token.TYPEOF,
    "var"           : Token.VAR,
    "void"          : Token.VOID,
    "while"         : Token.WHILE,
    "with"          : Token.WITH,

    // the following are #ifdef RESERVE_JAVA_KEYWORDS in jsscan.c
    "abstract"      : Token.RESERVED,
    "boolean"       : Token.RESERVED,
    "byte"          : Token.RESERVED,
    "catch"         : Token.CATCH,
    "char"          : Token.RESERVED,
    "class"         : Token.RESERVED,
    "const"         : Token.RESERVED,
    "debugger"      : Token.RESERVED,
    "double"        : Token.RESERVED,
    "enum"          : Token.RESERVED,
    "extends"       : Token.RESERVED,
    "final"         : Token.RESERVED,
    "finally"       : Token.FINALLY,
    "float"         : Token.RESERVED,
    "goto"          : Token.RESERVED,
    "implements"    : Token.RESERVED,
    "import"        : Token.IMPORT,
    "instanceof"    : Token.INSTANCEOF,
    "int"           : Token.RESERVED,
    "interface"     : Token.RESERVED,
    "long"          : Token.RESERVED,
    "native"        : Token.RESERVED,
    "package"       : Token.RESERVED,
    "private"       : Token.RESERVED,
    "protected"     : Token.RESERVED,
    "public"        : Token.RESERVED,
    "short"         : Token.RESERVED,
    "static"        : Token.RESERVED,
    "super"         : Token.RESERVED,
    "synchronized"  : Token.RESERVED,
    "throw"         : Token.THROW,
    "throws"        : Token.RESERVED,
    "transient"     : Token.RESERVED,
    "try"           : Token.TRY,
    "volatile"      : Token.RESERVED
};

function stringToKeyword ( name )
{
    return strIdMap[name] || Token.EOF;
}


proto.getLineno = function ( ) { return this.lineno; };

proto.getString = function ( ) { return this.string; };

proto.getNumber = function ( ) { return this.number; };

proto.eof = function ( ) { return this.hitEOF; };


proto.getToken = function ( )
{
    var c;

retry:
    for (;;) {
        // Eat whitespace, possibly sensitive to newlines.
        for (;;) {
            c = this.getChar();
            if (c == EOF_CHAR) {
                return Token.EOF;
            } else if (c == '\n') {
                this.dirtyLine = false;
                return Token.EOL;
            } else if (!isJSSpace(c)) {
                if (c != '-') {
                    dirtyLine = true;
                }
                break;
            }
        }

        if (c == '@') return Token.XMLATTR;

        // identifier/keyword/instanceof?
        // watch out for starting with a <backslash>
        boolean identifierStart;
        boolean isUnicodeEscapeStart = false;
        if (c == '\\') {
            c = getChar();
            if (c == 'u') {
                identifierStart = true;
                isUnicodeEscapeStart = true;
                stringBufferTop = 0;
            } else {
                identifierStart = false;
                ungetChar(c);
                c = '\\';
            }
        } else {
            identifierStart = Character.isJavaIdentifierStart((char)c);
            if (identifierStart) {
                stringBufferTop = 0;
                addToString(c);
            }
        }

        if (identifierStart) {
            boolean containsEscape = isUnicodeEscapeStart;
            for (;;) {
                if (isUnicodeEscapeStart) {
                    // strictly speaking we should probably push-back
                    // all the bad characters if the <backslash>uXXXX
                    // sequence is malformed. But since there isn't a
                    // correct context(is there?) for a bad Unicode
                    // escape sequence in an identifier, we can report
                    // an error here.
                    int escapeVal = 0;
                    for (int i = 0; i != 4; ++i) {
                        c = getChar();
                        escapeVal = Kit.xDigitToInt(c, escapeVal);
                        // Next check takes care about c < 0 and bad escape
                        if (escapeVal < 0) { break; }
                    }
                    if (escapeVal < 0) {
                        parser.addError("msg.invalid.escape");
                        return Token.ERROR;
                    }
                    addToString(escapeVal);
                    isUnicodeEscapeStart = false;
                } else {
                    c = getChar();
                    if (c == '\\') {
                        c = getChar();
                        if (c == 'u') {
                            isUnicodeEscapeStart = true;
                            containsEscape = true;
                        } else {
                            parser.addError("msg.illegal.character");
                            return Token.ERROR;
                        }
                    } else {
                        if (c == EOF_CHAR
                            || !Character.isJavaIdentifierPart((char)c))
                        {
                            break;
                        }
                        addToString(c);
                    }
                }
            }
            ungetChar(c);

            String str = getStringFromBuffer();
            if (!containsEscape) {
                // OPT we shouldn't have to make a string (object!) to
                // check if it's a keyword.

                // Return the corresponding token if it's a keyword
                int result = stringToKeyword(str);
                if (result != Token.EOF) {
                    if (result != Token.RESERVED) {
                        return result;
                    } else if (!parser.compilerEnv.
                                    isReservedKeywordAsIdentifier())
                    {
                        return result;
                    } else {
                        // If implementation permits to use future reserved
                        // keywords in violation with the EcmaScript,
                        // treat it as name but issue warning
                        parser.addWarning("msg.reserved.keyword", str);
                    }
                }
            }
            this.string = (String)allStrings.intern(str);
            return Token.NAME;
        }

        // is it a number?
        if (isDigit(c) || (c == '.' && isDigit(peekChar()))) {

            stringBufferTop = 0;
            int base = 10;

            if (c == '0') {
                c = getChar();
                if (c == 'x' || c == 'X') {
                    base = 16;
                    c = getChar();
                } else if (isDigit(c)) {
                    base = 8;
                } else {
                    addToString('0');
                }
            }

            if (base == 16) {
                while (0 <= Kit.xDigitToInt(c, 0)) {
                    addToString(c);
                    c = getChar();
                }
            } else {
                while ('0' <= c && c <= '9') {
                    /*
                     * We permit 08 and 09 as decimal numbers, which
                     * makes our behavior a superset of the ECMA
                     * numeric grammar.  We might not always be so
                     * permissive, so we warn about it.
                     */
                    if (base == 8 && c >= '8') {
                        parser.addWarning("msg.bad.octal.literal",
                                          c == '8' ? "8" : "9");
                        base = 10;
                    }
                    addToString(c);
                    c = getChar();
                }
            }

            boolean isInteger = true;

            if (base == 10 && (c == '.' || c == 'e' || c == 'E')) {
                isInteger = false;
                if (c == '.') {
                    do {
                        addToString(c);
                        c = getChar();
                    } while (isDigit(c));
                }
                if (c == 'e' || c == 'E') {
                    addToString(c);
                    c = getChar();
                    if (c == '+' || c == '-') {
                        addToString(c);
                        c = getChar();
                    }
                    if (!isDigit(c)) {
                        parser.addError("msg.missing.exponent");
                        return Token.ERROR;
                    }
                    do {
                        addToString(c);
                        c = getChar();
                    } while (isDigit(c));
                }
            }
            ungetChar(c);
            String numString = getStringFromBuffer();

            double dval;
            if (base == 10 && !isInteger) {
                try {
                    // Use Java conversion to number from string...
                    dval = Double.valueOf(numString).doubleValue();
                }
                catch (NumberFormatException ex) {
                    parser.addError("msg.caught.nfe");
                    return Token.ERROR;
                }
            } else {
                dval = ScriptRuntime.stringToNumber(numString, 0, base);
            }

            this.number = dval;
            return Token.NUMBER;
        }

        // is it a string?
        if (c == '"' || c == '\'') {
            // We attempt to accumulate a string the fast way, by
            // building it directly out of the reader.  But if there
            // are any escaped characters in the string, we revert to
            // building it out of a StringBuffer.

            int quoteChar = c;
            stringBufferTop = 0;

            c = getChar();
        strLoop: while (c != quoteChar) {
                if (c == '\n' || c == EOF_CHAR) {
                    ungetChar(c);
                    parser.addError("msg.unterminated.string.lit");
                    return Token.ERROR;
                }

                if (c == '\\') {
                    // We've hit an escaped character
                    int escapeVal;

                    c = getChar();
                    switch (c) {
                    case 'b': c = '\b'; break;
                    case 'f': c = '\f'; break;
                    case 'n': c = '\n'; break;
                    case 'r': c = '\r'; break;
                    case 't': c = '\t'; break;

                    // \v a late addition to the ECMA spec,
                    // it is not in Java, so use 0xb
                    case 'v': c = 0xb; break;

                    case 'u':
                        // Get 4 hex digits; if the u escape is not
                        // followed by 4 hex digits, use 'u' + the
                        // literal character sequence that follows.
                        int escapeStart = stringBufferTop;
                        addToString('u');
                        escapeVal = 0;
                        for (int i = 0; i != 4; ++i) {
                            c = getChar();
                            escapeVal = Kit.xDigitToInt(c, escapeVal);
                            if (escapeVal < 0) {
                                continue strLoop;
                            }
                            addToString(c);
                        }
                        // prepare for replace of stored 'u' sequence
                        // by escape value
                        stringBufferTop = escapeStart;
                        c = escapeVal;
                        break;
                    case 'x':
                        // Get 2 hex digits, defaulting to 'x'+literal
                        // sequence, as above.
                        c = getChar();
                        escapeVal = Kit.xDigitToInt(c, 0);
                        if (escapeVal < 0) {
                            addToString('x');
                            continue strLoop;
                        } else {
                            int c1 = c;
                            c = getChar();
                            escapeVal = Kit.xDigitToInt(c, escapeVal);
                            if (escapeVal < 0) {
                                addToString('x');
                                addToString(c1);
                                continue strLoop;
                            } else {
                                // got 2 hex digits
                                c = escapeVal;
                            }
                        }
                        break;

                    case '\n':
                        // Remove line terminator after escape to follow
                        // SpiderMonkey and C/C++
                        c = getChar();
                        continue strLoop;

                    default:
                        if ('0' <= c && c < '8') {
                            int val = c - '0';
                            c = getChar();
                            if ('0' <= c && c < '8') {
                                val = 8 * val + c - '0';
                                c = getChar();
                                if ('0' <= c && c < '8' && val <= 037) {
                                    // c is 3rd char of octal sequence only
                                    // if the resulting val <= 0377
                                    val = 8 * val + c - '0';
                                    c = getChar();
                                }
                            }
                            ungetChar(c);
                            c = val;
                        }
                    }
                }
                addToString(c);
                c = getChar();
            }

            String str = getStringFromBuffer();
            this.string = (String)allStrings.intern(str);
            return Token.STRING;
        }

        switch (c) {
        case ';': return Token.SEMI;
        case '[': return Token.LB;
        case ']': return Token.RB;
        case '{': return Token.LC;
        case '}': return Token.RC;
        case '(': return Token.LP;
        case ')': return Token.RP;
        case ',': return Token.COMMA;
        case '?': return Token.HOOK;
        case ':':
            if (matchChar(':')) {
                return Token.COLONCOLON;
            } else {
                return Token.COLON;
            }
        case '.':
            if (matchChar('.')) {
                return Token.DOTDOT;
            } else if (matchChar('(')) {
                return Token.DOTQUERY;
            } else {
                return Token.DOT;
            }

        case '|':
            if (matchChar('|')) {
                return Token.OR;
            } else if (matchChar('=')) {
                return Token.ASSIGN_BITOR;
            } else {
                return Token.BITOR;
            }

        case '^':
            if (matchChar('=')) {
                return Token.ASSIGN_BITXOR;
            } else {
                return Token.BITXOR;
            }

        case '&':
            if (matchChar('&')) {
                return Token.AND;
            } else if (matchChar('=')) {
                return Token.ASSIGN_BITAND;
            } else {
                return Token.BITAND;
            }

        case '=':
            if (matchChar('=')) {
                if (matchChar('='))
                    return Token.SHEQ;
                else
                    return Token.EQ;
            } else {
                return Token.ASSIGN;
            }

        case '!':
            if (matchChar('=')) {
                if (matchChar('='))
                    return Token.SHNE;
                else
                    return Token.NE;
            } else {
                return Token.NOT;
            }

        case '<':
            /* NB:treat HTML begin-comment as comment-till-eol */
            if (matchChar('!')) {
                if (matchChar('-')) {
                    if (matchChar('-')) {
                        skipLine();
                        continue retry;
                    }
                    ungetChar('-');
                }
                ungetChar('!');
            }
            if (matchChar('<')) {
                if (matchChar('=')) {
                    return Token.ASSIGN_LSH;
                } else {
                    return Token.LSH;
                }
            } else {
                if (matchChar('=')) {
                    return Token.LE;
                } else {
                    return Token.LT;
                }
            }

        case '>':
            if (matchChar('>')) {
                if (matchChar('>')) {
                    if (matchChar('=')) {
                        return Token.ASSIGN_URSH;
                    } else {
                        return Token.URSH;
                    }
                } else {
                    if (matchChar('=')) {
                        return Token.ASSIGN_RSH;
                    } else {
                        return Token.RSH;
                    }
                }
            } else {
                if (matchChar('=')) {
                    return Token.GE;
                } else {
                    return Token.GT;
                }
            }

        case '*':
            if (matchChar('=')) {
                return Token.ASSIGN_MUL;
            } else {
                return Token.MUL;
            }

        case '/':
            // is it a // comment?
            if (matchChar('/')) {
                skipLine();
                continue retry;
            }
            if (matchChar('*')) {
                boolean lookForSlash = false;
                for (;;) {
                    c = getChar();
                    if (c == EOF_CHAR) {
                        parser.addError("msg.unterminated.comment");
                        return Token.ERROR;
                    } else if (c == '*') {
                        lookForSlash = true;
                    } else if (c == '/') {
                        if (lookForSlash) {
                            continue retry;
                        }
                    } else {
                        lookForSlash = false;
                    }
                }
            }

            if (matchChar('=')) {
                return Token.ASSIGN_DIV;
            } else {
                return Token.DIV;
            }

        case '%':
            if (matchChar('=')) {
                return Token.ASSIGN_MOD;
            } else {
                return Token.MOD;
            }

        case '~':
            return Token.BITNOT;

        case '+':
            if (matchChar('=')) {
                return Token.ASSIGN_ADD;
            } else if (matchChar('+')) {
                return Token.INC;
            } else {
                return Token.ADD;
            }

        case '-':
            if (matchChar('=')) {
                c = Token.ASSIGN_SUB;
            } else if (matchChar('-')) {
                if (!dirtyLine) {
                    // treat HTML end-comment after possible whitespace
                    // after line start as comment-utill-eol
                    if (matchChar('>')) {
                        skipLine();
                        continue retry;
                    }
                }
                c = Token.DEC;
            } else {
                c = Token.SUB;
            }
            dirtyLine = true;
            return c;

        default:
            parser.addError("msg.illegal.character");
            return Token.ERROR;
        }
    }
}

    private static boolean isAlpha(int c)
    {
        // Use 'Z' < 'a'
        if (c <= 'Z') {
            return 'A' <= c;
        } else {
            return 'a' <= c && c <= 'z';
        }
    }

function isDigit ( c )
{
    c = c.charCodeAt(0);
    return 0x30 <= c && c <= 0x39;
    //      '0'               '9'
}

function isJSLineTerminator ( c ) {
    switch ( c.charCodeAt(0) ) {
    case 0x000A:  // Line Feed           <LF>
    case 0x000D:  // Carriage Return     <CR>
    case 0x2028:  // Line separator      <LS>
    case 0x2029:  // Paragraph separator <PS>
        return true;
    default:
        return false;
    }
}

function isJSSpace ( c )
{
    c = c.charCodeAt(0);
    if ( c <= 255 ) {
        switch ( c ) {
        case 0x0009:  // Tab            <TAB>
        case 0x000B:  // Vertical Tab   <VT>
        case 0x000C:  // Form Feed      <FF>
        case 0x0020:  // Space          <SP>
        case 0x00A0:  // No-break space <NBSP>
            return true;
        default:
            return false;
    }
    else {
        // the following code is derived from the Unicode category Zs based on:
        // http://www.unicode.org/Public/UNIDATA/extracted/DerivedGeneralCategory.txt
        // #generated# Last update: Mon, 31 Jul 2006 01:24:55 -0000
        if ( 0x2000 <= c && c <= 0x200A ) return true;
        switch ( c ) {
        case 0x20:
        case 0xA0:
        case 0x1680:
        case 0x180E:
        case 0x202F:
        case 0x205F:
        case 0x3000:
            return true;
        default:
            return false;
        }
        // #/generated#
    }
}

function isJSFormatChar ( c )
{
    c = c.charCodeAt(0);
    if ( c <= 127 ) return false;  // optimization for ASCII characters
    // the following code is derived from the Unicode category Cf based on:
    // http://www.unicode.org/Public/UNIDATA/extracted/DerivedGeneralCategory.txt
    // #generated# Last update: Mon, 31 Jul 2006 01:09:34 -0000
    if ( 0x600 <= c && c <= 0x603 ) return true;
    if ( 0x17B4 <= c && c <= 0x17B5 ) return true;
    if ( 0x200B <= c && c <= 0x200F ) return true;
    if ( 0x202A <= c && c <= 0x202E ) return true;
    if ( 0x2060 <= c && c <= 0x2063 ) return true;
    if ( 0x206A <= c && c <= 0x206F ) return true;
    if ( 0xFFF9 <= c && c <= 0xFFFB ) return true;
    if ( 0x1D173 <= c && c <= 0x1D17A ) return true;
    if ( 0xE0020 <= c && c <= 0xE007F ) return true;
    switch ( c ) {
    case 0xAD:
    case 0x6DD:
    case 0x70F:
    case 0xFEFF:
    case 0xE0001:
        return true;
    default:
        return false;
    }
    // #/generated#
}

function isUnicodeLetter ( c ) {
    var c = c.charCodeAt(0);
    // the following code is derived from the Unicode category Lu, Ll, Lt, Lm, Lo, and Nl based on:
    // http://www.unicode.org/Public/UNIDATA/extracted/DerivedGeneralCategory.txt
    // #generated# Last update: Mon, 31 Jul 2006 00:37:53 -0000
    if ( 0x41 <= c && c <= 0x5A ) return true;
    if ( 0x61 <= c && c <= 0x7A ) return true;
    if ( c <= 127 ) return false;  // hand-coded optimization for ASCII characters
    if ( 0xC0 <= c && c <= 0xD6 ) return true;
    if ( 0xD8 <= c && c <= 0xF6 ) return true;
    if ( 0xF8 <= c && c <= 0x2C1 ) return true;
    if ( 0x2C6 <= c && c <= 0x2D1 ) return true;
    if ( 0x2E0 <= c && c <= 0x2E4 ) return true;
    if ( 0x37A <= c && c <= 0x37D ) return true;
    if ( 0x388 <= c && c <= 0x38A ) return true;
    if ( 0x38E <= c && c <= 0x3A1 ) return true;
    if ( 0x3A3 <= c && c <= 0x3CE ) return true;
    if ( 0x3D0 <= c && c <= 0x3F5 ) return true;
    if ( 0x3F7 <= c && c <= 0x481 ) return true;
    if ( 0x48A <= c && c <= 0x513 ) return true;
    if ( 0x531 <= c && c <= 0x556 ) return true;
    if ( 0x561 <= c && c <= 0x587 ) return true;
    if ( 0x5D0 <= c && c <= 0x5EA ) return true;
    if ( 0x5F0 <= c && c <= 0x5F2 ) return true;
    if ( 0x621 <= c && c <= 0x63A ) return true;
    if ( 0x640 <= c && c <= 0x64A ) return true;
    if ( 0x66E <= c && c <= 0x66F ) return true;
    if ( 0x671 <= c && c <= 0x6D3 ) return true;
    if ( 0x6E5 <= c && c <= 0x6E6 ) return true;
    if ( 0x6EE <= c && c <= 0x6EF ) return true;
    if ( 0x6FA <= c && c <= 0x6FC ) return true;
    if ( 0x712 <= c && c <= 0x72F ) return true;
    if ( 0x74D <= c && c <= 0x76D ) return true;
    if ( 0x780 <= c && c <= 0x7A5 ) return true;
    if ( 0x7CA <= c && c <= 0x7EA ) return true;
    if ( 0x7F4 <= c && c <= 0x7F5 ) return true;
    if ( 0x904 <= c && c <= 0x939 ) return true;
    if ( 0x958 <= c && c <= 0x961 ) return true;
    if ( 0x97B <= c && c <= 0x97F ) return true;
    if ( 0x985 <= c && c <= 0x98C ) return true;
    if ( 0x98F <= c && c <= 0x990 ) return true;
    if ( 0x993 <= c && c <= 0x9A8 ) return true;
    if ( 0x9AA <= c && c <= 0x9B0 ) return true;
    if ( 0x9B6 <= c && c <= 0x9B9 ) return true;
    if ( 0x9DC <= c && c <= 0x9DD ) return true;
    if ( 0x9DF <= c && c <= 0x9E1 ) return true;
    if ( 0x9F0 <= c && c <= 0x9F1 ) return true;
    if ( 0xA05 <= c && c <= 0xA0A ) return true;
    if ( 0xA0F <= c && c <= 0xA10 ) return true;
    if ( 0xA13 <= c && c <= 0xA28 ) return true;
    if ( 0xA2A <= c && c <= 0xA30 ) return true;
    if ( 0xA32 <= c && c <= 0xA33 ) return true;
    if ( 0xA35 <= c && c <= 0xA36 ) return true;
    if ( 0xA38 <= c && c <= 0xA39 ) return true;
    if ( 0xA59 <= c && c <= 0xA5C ) return true;
    if ( 0xA72 <= c && c <= 0xA74 ) return true;
    if ( 0xA85 <= c && c <= 0xA8D ) return true;
    if ( 0xA8F <= c && c <= 0xA91 ) return true;
    if ( 0xA93 <= c && c <= 0xAA8 ) return true;
    if ( 0xAAA <= c && c <= 0xAB0 ) return true;
    if ( 0xAB2 <= c && c <= 0xAB3 ) return true;
    if ( 0xAB5 <= c && c <= 0xAB9 ) return true;
    if ( 0xAE0 <= c && c <= 0xAE1 ) return true;
    if ( 0xB05 <= c && c <= 0xB0C ) return true;
    if ( 0xB0F <= c && c <= 0xB10 ) return true;
    if ( 0xB13 <= c && c <= 0xB28 ) return true;
    if ( 0xB2A <= c && c <= 0xB30 ) return true;
    if ( 0xB32 <= c && c <= 0xB33 ) return true;
    if ( 0xB35 <= c && c <= 0xB39 ) return true;
    if ( 0xB5C <= c && c <= 0xB5D ) return true;
    if ( 0xB5F <= c && c <= 0xB61 ) return true;
    if ( 0xB85 <= c && c <= 0xB8A ) return true;
    if ( 0xB8E <= c && c <= 0xB90 ) return true;
    if ( 0xB92 <= c && c <= 0xB95 ) return true;
    if ( 0xB99 <= c && c <= 0xB9A ) return true;
    if ( 0xB9E <= c && c <= 0xB9F ) return true;
    if ( 0xBA3 <= c && c <= 0xBA4 ) return true;
    if ( 0xBA8 <= c && c <= 0xBAA ) return true;
    if ( 0xBAE <= c && c <= 0xBB9 ) return true;
    if ( 0xC05 <= c && c <= 0xC0C ) return true;
    if ( 0xC0E <= c && c <= 0xC10 ) return true;
    if ( 0xC12 <= c && c <= 0xC28 ) return true;
    if ( 0xC2A <= c && c <= 0xC33 ) return true;
    if ( 0xC35 <= c && c <= 0xC39 ) return true;
    if ( 0xC60 <= c && c <= 0xC61 ) return true;
    if ( 0xC85 <= c && c <= 0xC8C ) return true;
    if ( 0xC8E <= c && c <= 0xC90 ) return true;
    if ( 0xC92 <= c && c <= 0xCA8 ) return true;
    if ( 0xCAA <= c && c <= 0xCB3 ) return true;
    if ( 0xCB5 <= c && c <= 0xCB9 ) return true;
    if ( 0xCE0 <= c && c <= 0xCE1 ) return true;
    if ( 0xD05 <= c && c <= 0xD0C ) return true;
    if ( 0xD0E <= c && c <= 0xD10 ) return true;
    if ( 0xD12 <= c && c <= 0xD28 ) return true;
    if ( 0xD2A <= c && c <= 0xD39 ) return true;
    if ( 0xD60 <= c && c <= 0xD61 ) return true;
    if ( 0xD85 <= c && c <= 0xD96 ) return true;
    if ( 0xD9A <= c && c <= 0xDB1 ) return true;
    if ( 0xDB3 <= c && c <= 0xDBB ) return true;
    if ( 0xDC0 <= c && c <= 0xDC6 ) return true;
    if ( 0xE01 <= c && c <= 0xE30 ) return true;
    if ( 0xE32 <= c && c <= 0xE33 ) return true;
    if ( 0xE40 <= c && c <= 0xE46 ) return true;
    if ( 0xE81 <= c && c <= 0xE82 ) return true;
    if ( 0xE87 <= c && c <= 0xE88 ) return true;
    if ( 0xE94 <= c && c <= 0xE97 ) return true;
    if ( 0xE99 <= c && c <= 0xE9F ) return true;
    if ( 0xEA1 <= c && c <= 0xEA3 ) return true;
    if ( 0xEAA <= c && c <= 0xEAB ) return true;
    if ( 0xEAD <= c && c <= 0xEB0 ) return true;
    if ( 0xEB2 <= c && c <= 0xEB3 ) return true;
    if ( 0xEC0 <= c && c <= 0xEC4 ) return true;
    if ( 0xEDC <= c && c <= 0xEDD ) return true;
    if ( 0xF40 <= c && c <= 0xF47 ) return true;
    if ( 0xF49 <= c && c <= 0xF6A ) return true;
    if ( 0xF88 <= c && c <= 0xF8B ) return true;
    if ( 0x1000 <= c && c <= 0x1021 ) return true;
    if ( 0x1023 <= c && c <= 0x1027 ) return true;
    if ( 0x1029 <= c && c <= 0x102A ) return true;
    if ( 0x1050 <= c && c <= 0x1055 ) return true;
    if ( 0x10A0 <= c && c <= 0x10C5 ) return true;
    if ( 0x10D0 <= c && c <= 0x10FA ) return true;
    if ( 0x1100 <= c && c <= 0x1159 ) return true;
    if ( 0x115F <= c && c <= 0x11A2 ) return true;
    if ( 0x11A8 <= c && c <= 0x11F9 ) return true;
    if ( 0x1200 <= c && c <= 0x1248 ) return true;
    if ( 0x124A <= c && c <= 0x124D ) return true;
    if ( 0x1250 <= c && c <= 0x1256 ) return true;
    if ( 0x125A <= c && c <= 0x125D ) return true;
    if ( 0x1260 <= c && c <= 0x1288 ) return true;
    if ( 0x128A <= c && c <= 0x128D ) return true;
    if ( 0x1290 <= c && c <= 0x12B0 ) return true;
    if ( 0x12B2 <= c && c <= 0x12B5 ) return true;
    if ( 0x12B8 <= c && c <= 0x12BE ) return true;
    if ( 0x12C2 <= c && c <= 0x12C5 ) return true;
    if ( 0x12C8 <= c && c <= 0x12D6 ) return true;
    if ( 0x12D8 <= c && c <= 0x1310 ) return true;
    if ( 0x1312 <= c && c <= 0x1315 ) return true;
    if ( 0x1318 <= c && c <= 0x135A ) return true;
    if ( 0x1380 <= c && c <= 0x138F ) return true;
    if ( 0x13A0 <= c && c <= 0x13F4 ) return true;
    if ( 0x1401 <= c && c <= 0x166C ) return true;
    if ( 0x166F <= c && c <= 0x1676 ) return true;
    if ( 0x1681 <= c && c <= 0x169A ) return true;
    if ( 0x16A0 <= c && c <= 0x16EA ) return true;
    if ( 0x16EE <= c && c <= 0x16F0 ) return true;
    if ( 0x1700 <= c && c <= 0x170C ) return true;
    if ( 0x170E <= c && c <= 0x1711 ) return true;
    if ( 0x1720 <= c && c <= 0x1731 ) return true;
    if ( 0x1740 <= c && c <= 0x1751 ) return true;
    if ( 0x1760 <= c && c <= 0x176C ) return true;
    if ( 0x176E <= c && c <= 0x1770 ) return true;
    if ( 0x1780 <= c && c <= 0x17B3 ) return true;
    if ( 0x1820 <= c && c <= 0x1877 ) return true;
    if ( 0x1880 <= c && c <= 0x18A8 ) return true;
    if ( 0x1900 <= c && c <= 0x191C ) return true;
    if ( 0x1950 <= c && c <= 0x196D ) return true;
    if ( 0x1970 <= c && c <= 0x1974 ) return true;
    if ( 0x1980 <= c && c <= 0x19A9 ) return true;
    if ( 0x19C1 <= c && c <= 0x19C7 ) return true;
    if ( 0x1A00 <= c && c <= 0x1A16 ) return true;
    if ( 0x1B05 <= c && c <= 0x1B33 ) return true;
    if ( 0x1B45 <= c && c <= 0x1B4B ) return true;
    if ( 0x1D00 <= c && c <= 0x1DBF ) return true;
    if ( 0x1E00 <= c && c <= 0x1E9B ) return true;
    if ( 0x1EA0 <= c && c <= 0x1EF9 ) return true;
    if ( 0x1F00 <= c && c <= 0x1F15 ) return true;
    if ( 0x1F18 <= c && c <= 0x1F1D ) return true;
    if ( 0x1F20 <= c && c <= 0x1F45 ) return true;
    if ( 0x1F48 <= c && c <= 0x1F4D ) return true;
    if ( 0x1F50 <= c && c <= 0x1F57 ) return true;
    if ( 0x1F5F <= c && c <= 0x1F7D ) return true;
    if ( 0x1F80 <= c && c <= 0x1FB4 ) return true;
    if ( 0x1FB6 <= c && c <= 0x1FBC ) return true;
    if ( 0x1FC2 <= c && c <= 0x1FC4 ) return true;
    if ( 0x1FC6 <= c && c <= 0x1FCC ) return true;
    if ( 0x1FD0 <= c && c <= 0x1FD3 ) return true;
    if ( 0x1FD6 <= c && c <= 0x1FDB ) return true;
    if ( 0x1FE0 <= c && c <= 0x1FEC ) return true;
    if ( 0x1FF2 <= c && c <= 0x1FF4 ) return true;
    if ( 0x1FF6 <= c && c <= 0x1FFC ) return true;
    if ( 0x2090 <= c && c <= 0x2094 ) return true;
    if ( 0x210A <= c && c <= 0x2113 ) return true;
    if ( 0x2119 <= c && c <= 0x211D ) return true;
    if ( 0x212A <= c && c <= 0x212D ) return true;
    if ( 0x212F <= c && c <= 0x2139 ) return true;
    if ( 0x213C <= c && c <= 0x213F ) return true;
    if ( 0x2145 <= c && c <= 0x2149 ) return true;
    if ( 0x2160 <= c && c <= 0x2184 ) return true;
    if ( 0x2C00 <= c && c <= 0x2C2E ) return true;
    if ( 0x2C30 <= c && c <= 0x2C5E ) return true;
    if ( 0x2C60 <= c && c <= 0x2C6C ) return true;
    if ( 0x2C74 <= c && c <= 0x2C77 ) return true;
    if ( 0x2C80 <= c && c <= 0x2CE4 ) return true;
    if ( 0x2D00 <= c && c <= 0x2D25 ) return true;
    if ( 0x2D30 <= c && c <= 0x2D65 ) return true;
    if ( 0x2D80 <= c && c <= 0x2D96 ) return true;
    if ( 0x2DA0 <= c && c <= 0x2DA6 ) return true;
    if ( 0x2DA8 <= c && c <= 0x2DAE ) return true;
    if ( 0x2DB0 <= c && c <= 0x2DB6 ) return true;
    if ( 0x2DB8 <= c && c <= 0x2DBE ) return true;
    if ( 0x2DC0 <= c && c <= 0x2DC6 ) return true;
    if ( 0x2DC8 <= c && c <= 0x2DCE ) return true;
    if ( 0x2DD0 <= c && c <= 0x2DD6 ) return true;
    if ( 0x2DD8 <= c && c <= 0x2DDE ) return true;
    if ( 0x3005 <= c && c <= 0x3007 ) return true;
    if ( 0x3021 <= c && c <= 0x3029 ) return true;
    if ( 0x3031 <= c && c <= 0x3035 ) return true;
    if ( 0x3038 <= c && c <= 0x303C ) return true;
    if ( 0x3041 <= c && c <= 0x3096 ) return true;
    if ( 0x309D <= c && c <= 0x309F ) return true;
    if ( 0x30A1 <= c && c <= 0x30FA ) return true;
    if ( 0x30FC <= c && c <= 0x30FF ) return true;
    if ( 0x3105 <= c && c <= 0x312C ) return true;
    if ( 0x3131 <= c && c <= 0x318E ) return true;
    if ( 0x31A0 <= c && c <= 0x31B7 ) return true;
    if ( 0x31F0 <= c && c <= 0x31FF ) return true;
    if ( 0x3400 <= c && c <= 0x4DB5 ) return true;
    if ( 0x4E00 <= c && c <= 0x9FBB ) return true;
    if ( 0xA000 <= c && c <= 0xA48C ) return true;
    if ( 0xA717 <= c && c <= 0xA71A ) return true;
    if ( 0xA800 <= c && c <= 0xA801 ) return true;
    if ( 0xA803 <= c && c <= 0xA805 ) return true;
    if ( 0xA807 <= c && c <= 0xA80A ) return true;
    if ( 0xA80C <= c && c <= 0xA822 ) return true;
    if ( 0xA840 <= c && c <= 0xA873 ) return true;
    if ( 0xAC00 <= c && c <= 0xD7A3 ) return true;
    if ( 0xF900 <= c && c <= 0xFA2D ) return true;
    if ( 0xFA30 <= c && c <= 0xFA6A ) return true;
    if ( 0xFA70 <= c && c <= 0xFAD9 ) return true;
    if ( 0xFB00 <= c && c <= 0xFB06 ) return true;
    if ( 0xFB13 <= c && c <= 0xFB17 ) return true;
    if ( 0xFB1F <= c && c <= 0xFB28 ) return true;
    if ( 0xFB2A <= c && c <= 0xFB36 ) return true;
    if ( 0xFB38 <= c && c <= 0xFB3C ) return true;
    if ( 0xFB40 <= c && c <= 0xFB41 ) return true;
    if ( 0xFB43 <= c && c <= 0xFB44 ) return true;
    if ( 0xFB46 <= c && c <= 0xFBB1 ) return true;
    if ( 0xFBD3 <= c && c <= 0xFD3D ) return true;
    if ( 0xFD50 <= c && c <= 0xFD8F ) return true;
    if ( 0xFD92 <= c && c <= 0xFDC7 ) return true;
    if ( 0xFDF0 <= c && c <= 0xFDFB ) return true;
    if ( 0xFE70 <= c && c <= 0xFE74 ) return true;
    if ( 0xFE76 <= c && c <= 0xFEFC ) return true;
    if ( 0xFF21 <= c && c <= 0xFF3A ) return true;
    if ( 0xFF41 <= c && c <= 0xFF5A ) return true;
    if ( 0xFF66 <= c && c <= 0xFFBE ) return true;
    if ( 0xFFC2 <= c && c <= 0xFFC7 ) return true;
    if ( 0xFFCA <= c && c <= 0xFFCF ) return true;
    if ( 0xFFD2 <= c && c <= 0xFFD7 ) return true;
    if ( 0xFFDA <= c && c <= 0xFFDC ) return true;
    if ( 0x10000 <= c && c <= 0x1000B ) return true;
    if ( 0x1000D <= c && c <= 0x10026 ) return true;
    if ( 0x10028 <= c && c <= 0x1003A ) return true;
    if ( 0x1003C <= c && c <= 0x1003D ) return true;
    if ( 0x1003F <= c && c <= 0x1004D ) return true;
    if ( 0x10050 <= c && c <= 0x1005D ) return true;
    if ( 0x10080 <= c && c <= 0x100FA ) return true;
    if ( 0x10140 <= c && c <= 0x10174 ) return true;
    if ( 0x10300 <= c && c <= 0x1031E ) return true;
    if ( 0x10330 <= c && c <= 0x1034A ) return true;
    if ( 0x10380 <= c && c <= 0x1039D ) return true;
    if ( 0x103A0 <= c && c <= 0x103C3 ) return true;
    if ( 0x103C8 <= c && c <= 0x103CF ) return true;
    if ( 0x103D1 <= c && c <= 0x103D5 ) return true;
    if ( 0x10400 <= c && c <= 0x1049D ) return true;
    if ( 0x10800 <= c && c <= 0x10805 ) return true;
    if ( 0x1080A <= c && c <= 0x10835 ) return true;
    if ( 0x10837 <= c && c <= 0x10838 ) return true;
    if ( 0x10900 <= c && c <= 0x10915 ) return true;
    if ( 0x10A10 <= c && c <= 0x10A13 ) return true;
    if ( 0x10A15 <= c && c <= 0x10A17 ) return true;
    if ( 0x10A19 <= c && c <= 0x10A33 ) return true;
    if ( 0x12000 <= c && c <= 0x1236E ) return true;
    if ( 0x12400 <= c && c <= 0x12462 ) return true;
    if ( 0x1D400 <= c && c <= 0x1D454 ) return true;
    if ( 0x1D456 <= c && c <= 0x1D49C ) return true;
    if ( 0x1D49E <= c && c <= 0x1D49F ) return true;
    if ( 0x1D4A5 <= c && c <= 0x1D4A6 ) return true;
    if ( 0x1D4A9 <= c && c <= 0x1D4AC ) return true;
    if ( 0x1D4AE <= c && c <= 0x1D4B9 ) return true;
    if ( 0x1D4BD <= c && c <= 0x1D4C3 ) return true;
    if ( 0x1D4C5 <= c && c <= 0x1D505 ) return true;
    if ( 0x1D507 <= c && c <= 0x1D50A ) return true;
    if ( 0x1D50D <= c && c <= 0x1D514 ) return true;
    if ( 0x1D516 <= c && c <= 0x1D51C ) return true;
    if ( 0x1D51E <= c && c <= 0x1D539 ) return true;
    if ( 0x1D53B <= c && c <= 0x1D53E ) return true;
    if ( 0x1D540 <= c && c <= 0x1D544 ) return true;
    if ( 0x1D54A <= c && c <= 0x1D550 ) return true;
    if ( 0x1D552 <= c && c <= 0x1D6A5 ) return true;
    if ( 0x1D6A8 <= c && c <= 0x1D6C0 ) return true;
    if ( 0x1D6C2 <= c && c <= 0x1D6DA ) return true;
    if ( 0x1D6DC <= c && c <= 0x1D6FA ) return true;
    if ( 0x1D6FC <= c && c <= 0x1D714 ) return true;
    if ( 0x1D716 <= c && c <= 0x1D734 ) return true;
    if ( 0x1D736 <= c && c <= 0x1D74E ) return true;
    if ( 0x1D750 <= c && c <= 0x1D76E ) return true;
    if ( 0x1D770 <= c && c <= 0x1D788 ) return true;
    if ( 0x1D78A <= c && c <= 0x1D7A8 ) return true;
    if ( 0x1D7AA <= c && c <= 0x1D7C2 ) return true;
    if ( 0x1D7C4 <= c && c <= 0x1D7CB ) return true;
    if ( 0x20000 <= c && c <= 0x2A6D6 ) return true;
    if ( 0x2F800 <= c && c <= 0x2FA1D ) return true;
    switch ( c ) {
    case 0xAA:
    case 0xB5:
    case 0xBA:
    case 0x2EE:
    case 0x386:
    case 0x38C:
    case 0x559:
    case 0x6D5:
    case 0x6FF:
    case 0x710:
    case 0x7B1:
    case 0x7FA:
    case 0x93D:
    case 0x950:
    case 0x9B2:
    case 0x9BD:
    case 0x9CE:
    case 0xA5E:
    case 0xABD:
    case 0xAD0:
    case 0xB3D:
    case 0xB71:
    case 0xB83:
    case 0xB9C:
    case 0xCBD:
    case 0xCDE:
    case 0xDBD:
    case 0xE84:
    case 0xE8A:
    case 0xE8D:
    case 0xEA5:
    case 0xEA7:
    case 0xEBD:
    case 0xEC6:
    case 0xF00:
    case 0x10FC:
    case 0x1258:
    case 0x12C0:
    case 0x17D7:
    case 0x17DC:
    case 0x1F59:
    case 0x1F5B:
    case 0x1F5D:
    case 0x1FBE:
    case 0x2071:
    case 0x207F:
    case 0x2102:
    case 0x2107:
    case 0x2115:
    case 0x2124:
    case 0x2126:
    case 0x2128:
    case 0x214E:
    case 0x2D6F:
    case 0xFB1D:
    case 0xFB3E:
    case 0x10808:
    case 0x1083C:
    case 0x1083F:
    case 0x10A00:
    case 0x1D4A2:
    case 0x1D4BB:
    case 0x1D546:
        return true;
    default:
        return false;
    }
    // #/generated#
}

function isUnicodeIdentifierPart ( c ) {
    var c = c.charCodeAt(0);
    // the following code is derived from the Unicode category Lu, Ll, Lt, Lm, Lo, Nl, Mn, Mc, Nd, and Pc based on:
    // http://www.unicode.org/Public/UNIDATA/extracted/DerivedGeneralCategory.txt
    // #generated# Last update: Mon, 31 Jul 2006 01:30:59 -0000
    if ( 0x30 <= c && c <= 0x39 ) return true;
    if ( 0x41 <= c && c <= 0x5A ) return true;
    if ( 0x61 <= c && c <= 0x7A ) return true;
    if ( 0xC0 <= c && c <= 0xD6 ) return true;
    if ( c <= 127 ) return false;  // hand-coded optimization for ASCII characters
    if ( 0xD8 <= c && c <= 0xF6 ) return true;
    if ( 0xF8 <= c && c <= 0x2C1 ) return true;
    if ( 0x2C6 <= c && c <= 0x2D1 ) return true;
    if ( 0x2E0 <= c && c <= 0x2E4 ) return true;
    if ( 0x300 <= c && c <= 0x36F ) return true;
    if ( 0x37A <= c && c <= 0x37D ) return true;
    if ( 0x388 <= c && c <= 0x38A ) return true;
    if ( 0x38E <= c && c <= 0x3A1 ) return true;
    if ( 0x3A3 <= c && c <= 0x3CE ) return true;
    if ( 0x3D0 <= c && c <= 0x3F5 ) return true;
    if ( 0x3F7 <= c && c <= 0x481 ) return true;
    if ( 0x483 <= c && c <= 0x486 ) return true;
    if ( 0x48A <= c && c <= 0x513 ) return true;
    if ( 0x531 <= c && c <= 0x556 ) return true;
    if ( 0x561 <= c && c <= 0x587 ) return true;
    if ( 0x591 <= c && c <= 0x5BD ) return true;
    if ( 0x5C1 <= c && c <= 0x5C2 ) return true;
    if ( 0x5C4 <= c && c <= 0x5C5 ) return true;
    if ( 0x5D0 <= c && c <= 0x5EA ) return true;
    if ( 0x5F0 <= c && c <= 0x5F2 ) return true;
    if ( 0x610 <= c && c <= 0x615 ) return true;
    if ( 0x621 <= c && c <= 0x63A ) return true;
    if ( 0x640 <= c && c <= 0x65E ) return true;
    if ( 0x660 <= c && c <= 0x669 ) return true;
    if ( 0x66E <= c && c <= 0x6D3 ) return true;
    if ( 0x6D5 <= c && c <= 0x6DC ) return true;
    if ( 0x6DF <= c && c <= 0x6E8 ) return true;
    if ( 0x6EA <= c && c <= 0x6FC ) return true;
    if ( 0x710 <= c && c <= 0x74A ) return true;
    if ( 0x74D <= c && c <= 0x76D ) return true;
    if ( 0x780 <= c && c <= 0x7B1 ) return true;
    if ( 0x7C0 <= c && c <= 0x7F5 ) return true;
    if ( 0x901 <= c && c <= 0x939 ) return true;
    if ( 0x93C <= c && c <= 0x94D ) return true;
    if ( 0x950 <= c && c <= 0x954 ) return true;
    if ( 0x958 <= c && c <= 0x963 ) return true;
    if ( 0x966 <= c && c <= 0x96F ) return true;
    if ( 0x97B <= c && c <= 0x97F ) return true;
    if ( 0x981 <= c && c <= 0x983 ) return true;
    if ( 0x985 <= c && c <= 0x98C ) return true;
    if ( 0x98F <= c && c <= 0x990 ) return true;
    if ( 0x993 <= c && c <= 0x9A8 ) return true;
    if ( 0x9AA <= c && c <= 0x9B0 ) return true;
    if ( 0x9B6 <= c && c <= 0x9B9 ) return true;
    if ( 0x9BC <= c && c <= 0x9C4 ) return true;
    if ( 0x9C7 <= c && c <= 0x9C8 ) return true;
    if ( 0x9CB <= c && c <= 0x9CE ) return true;
    if ( 0x9DC <= c && c <= 0x9DD ) return true;
    if ( 0x9DF <= c && c <= 0x9E3 ) return true;
    if ( 0x9E6 <= c && c <= 0x9F1 ) return true;
    if ( 0xA01 <= c && c <= 0xA03 ) return true;
    if ( 0xA05 <= c && c <= 0xA0A ) return true;
    if ( 0xA0F <= c && c <= 0xA10 ) return true;
    if ( 0xA13 <= c && c <= 0xA28 ) return true;
    if ( 0xA2A <= c && c <= 0xA30 ) return true;
    if ( 0xA32 <= c && c <= 0xA33 ) return true;
    if ( 0xA35 <= c && c <= 0xA36 ) return true;
    if ( 0xA38 <= c && c <= 0xA39 ) return true;
    if ( 0xA3E <= c && c <= 0xA42 ) return true;
    if ( 0xA47 <= c && c <= 0xA48 ) return true;
    if ( 0xA4B <= c && c <= 0xA4D ) return true;
    if ( 0xA59 <= c && c <= 0xA5C ) return true;
    if ( 0xA66 <= c && c <= 0xA74 ) return true;
    if ( 0xA81 <= c && c <= 0xA83 ) return true;
    if ( 0xA85 <= c && c <= 0xA8D ) return true;
    if ( 0xA8F <= c && c <= 0xA91 ) return true;
    if ( 0xA93 <= c && c <= 0xAA8 ) return true;
    if ( 0xAAA <= c && c <= 0xAB0 ) return true;
    if ( 0xAB2 <= c && c <= 0xAB3 ) return true;
    if ( 0xAB5 <= c && c <= 0xAB9 ) return true;
    if ( 0xABC <= c && c <= 0xAC5 ) return true;
    if ( 0xAC7 <= c && c <= 0xAC9 ) return true;
    if ( 0xACB <= c && c <= 0xACD ) return true;
    if ( 0xAE0 <= c && c <= 0xAE3 ) return true;
    if ( 0xAE6 <= c && c <= 0xAEF ) return true;
    if ( 0xB01 <= c && c <= 0xB03 ) return true;
    if ( 0xB05 <= c && c <= 0xB0C ) return true;
    if ( 0xB0F <= c && c <= 0xB10 ) return true;
    if ( 0xB13 <= c && c <= 0xB28 ) return true;
    if ( 0xB2A <= c && c <= 0xB30 ) return true;
    if ( 0xB32 <= c && c <= 0xB33 ) return true;
    if ( 0xB35 <= c && c <= 0xB39 ) return true;
    if ( 0xB3C <= c && c <= 0xB43 ) return true;
    if ( 0xB47 <= c && c <= 0xB48 ) return true;
    if ( 0xB4B <= c && c <= 0xB4D ) return true;
    if ( 0xB56 <= c && c <= 0xB57 ) return true;
    if ( 0xB5C <= c && c <= 0xB5D ) return true;
    if ( 0xB5F <= c && c <= 0xB61 ) return true;
    if ( 0xB66 <= c && c <= 0xB6F ) return true;
    if ( 0xB82 <= c && c <= 0xB83 ) return true;
    if ( 0xB85 <= c && c <= 0xB8A ) return true;
    if ( 0xB8E <= c && c <= 0xB90 ) return true;
    if ( 0xB92 <= c && c <= 0xB95 ) return true;
    if ( 0xB99 <= c && c <= 0xB9A ) return true;
    if ( 0xB9E <= c && c <= 0xB9F ) return true;
    if ( 0xBA3 <= c && c <= 0xBA4 ) return true;
    if ( 0xBA8 <= c && c <= 0xBAA ) return true;
    if ( 0xBAE <= c && c <= 0xBB9 ) return true;
    if ( 0xBBE <= c && c <= 0xBC2 ) return true;
    if ( 0xBC6 <= c && c <= 0xBC8 ) return true;
    if ( 0xBCA <= c && c <= 0xBCD ) return true;
    if ( 0xBE6 <= c && c <= 0xBEF ) return true;
    if ( 0xC01 <= c && c <= 0xC03 ) return true;
    if ( 0xC05 <= c && c <= 0xC0C ) return true;
    if ( 0xC0E <= c && c <= 0xC10 ) return true;
    if ( 0xC12 <= c && c <= 0xC28 ) return true;
    if ( 0xC2A <= c && c <= 0xC33 ) return true;
    if ( 0xC35 <= c && c <= 0xC39 ) return true;
    if ( 0xC3E <= c && c <= 0xC44 ) return true;
    if ( 0xC46 <= c && c <= 0xC48 ) return true;
    if ( 0xC4A <= c && c <= 0xC4D ) return true;
    if ( 0xC55 <= c && c <= 0xC56 ) return true;
    if ( 0xC60 <= c && c <= 0xC61 ) return true;
    if ( 0xC66 <= c && c <= 0xC6F ) return true;
    if ( 0xC82 <= c && c <= 0xC83 ) return true;
    if ( 0xC85 <= c && c <= 0xC8C ) return true;
    if ( 0xC8E <= c && c <= 0xC90 ) return true;
    if ( 0xC92 <= c && c <= 0xCA8 ) return true;
    if ( 0xCAA <= c && c <= 0xCB3 ) return true;
    if ( 0xCB5 <= c && c <= 0xCB9 ) return true;
    if ( 0xCBC <= c && c <= 0xCC4 ) return true;
    if ( 0xCC6 <= c && c <= 0xCC8 ) return true;
    if ( 0xCCA <= c && c <= 0xCCD ) return true;
    if ( 0xCD5 <= c && c <= 0xCD6 ) return true;
    if ( 0xCE0 <= c && c <= 0xCE3 ) return true;
    if ( 0xCE6 <= c && c <= 0xCEF ) return true;
    if ( 0xD02 <= c && c <= 0xD03 ) return true;
    if ( 0xD05 <= c && c <= 0xD0C ) return true;
    if ( 0xD0E <= c && c <= 0xD10 ) return true;
    if ( 0xD12 <= c && c <= 0xD28 ) return true;
    if ( 0xD2A <= c && c <= 0xD39 ) return true;
    if ( 0xD3E <= c && c <= 0xD43 ) return true;
    if ( 0xD46 <= c && c <= 0xD48 ) return true;
    if ( 0xD4A <= c && c <= 0xD4D ) return true;
    if ( 0xD60 <= c && c <= 0xD61 ) return true;
    if ( 0xD66 <= c && c <= 0xD6F ) return true;
    if ( 0xD82 <= c && c <= 0xD83 ) return true;
    if ( 0xD85 <= c && c <= 0xD96 ) return true;
    if ( 0xD9A <= c && c <= 0xDB1 ) return true;
    if ( 0xDB3 <= c && c <= 0xDBB ) return true;
    if ( 0xDC0 <= c && c <= 0xDC6 ) return true;
    if ( 0xDCF <= c && c <= 0xDD4 ) return true;
    if ( 0xDD8 <= c && c <= 0xDDF ) return true;
    if ( 0xDF2 <= c && c <= 0xDF3 ) return true;
    if ( 0xE01 <= c && c <= 0xE3A ) return true;
    if ( 0xE40 <= c && c <= 0xE4E ) return true;
    if ( 0xE50 <= c && c <= 0xE59 ) return true;
    if ( 0xE81 <= c && c <= 0xE82 ) return true;
    if ( 0xE87 <= c && c <= 0xE88 ) return true;
    if ( 0xE94 <= c && c <= 0xE97 ) return true;
    if ( 0xE99 <= c && c <= 0xE9F ) return true;
    if ( 0xEA1 <= c && c <= 0xEA3 ) return true;
    if ( 0xEAA <= c && c <= 0xEAB ) return true;
    if ( 0xEAD <= c && c <= 0xEB9 ) return true;
    if ( 0xEBB <= c && c <= 0xEBD ) return true;
    if ( 0xEC0 <= c && c <= 0xEC4 ) return true;
    if ( 0xEC8 <= c && c <= 0xECD ) return true;
    if ( 0xED0 <= c && c <= 0xED9 ) return true;
    if ( 0xEDC <= c && c <= 0xEDD ) return true;
    if ( 0xF18 <= c && c <= 0xF19 ) return true;
    if ( 0xF20 <= c && c <= 0xF29 ) return true;
    if ( 0xF3E <= c && c <= 0xF47 ) return true;
    if ( 0xF49 <= c && c <= 0xF6A ) return true;
    if ( 0xF71 <= c && c <= 0xF84 ) return true;
    if ( 0xF86 <= c && c <= 0xF8B ) return true;
    if ( 0xF90 <= c && c <= 0xF97 ) return true;
    if ( 0xF99 <= c && c <= 0xFBC ) return true;
    if ( 0x1000 <= c && c <= 0x1021 ) return true;
    if ( 0x1023 <= c && c <= 0x1027 ) return true;
    if ( 0x1029 <= c && c <= 0x102A ) return true;
    if ( 0x102C <= c && c <= 0x1032 ) return true;
    if ( 0x1036 <= c && c <= 0x1039 ) return true;
    if ( 0x1040 <= c && c <= 0x1049 ) return true;
    if ( 0x1050 <= c && c <= 0x1059 ) return true;
    if ( 0x10A0 <= c && c <= 0x10C5 ) return true;
    if ( 0x10D0 <= c && c <= 0x10FA ) return true;
    if ( 0x1100 <= c && c <= 0x1159 ) return true;
    if ( 0x115F <= c && c <= 0x11A2 ) return true;
    if ( 0x11A8 <= c && c <= 0x11F9 ) return true;
    if ( 0x1200 <= c && c <= 0x1248 ) return true;
    if ( 0x124A <= c && c <= 0x124D ) return true;
    if ( 0x1250 <= c && c <= 0x1256 ) return true;
    if ( 0x125A <= c && c <= 0x125D ) return true;
    if ( 0x1260 <= c && c <= 0x1288 ) return true;
    if ( 0x128A <= c && c <= 0x128D ) return true;
    if ( 0x1290 <= c && c <= 0x12B0 ) return true;
    if ( 0x12B2 <= c && c <= 0x12B5 ) return true;
    if ( 0x12B8 <= c && c <= 0x12BE ) return true;
    if ( 0x12C2 <= c && c <= 0x12C5 ) return true;
    if ( 0x12C8 <= c && c <= 0x12D6 ) return true;
    if ( 0x12D8 <= c && c <= 0x1310 ) return true;
    if ( 0x1312 <= c && c <= 0x1315 ) return true;
    if ( 0x1318 <= c && c <= 0x135A ) return true;
    if ( 0x1380 <= c && c <= 0x138F ) return true;
    if ( 0x13A0 <= c && c <= 0x13F4 ) return true;
    if ( 0x1401 <= c && c <= 0x166C ) return true;
    if ( 0x166F <= c && c <= 0x1676 ) return true;
    if ( 0x1681 <= c && c <= 0x169A ) return true;
    if ( 0x16A0 <= c && c <= 0x16EA ) return true;
    if ( 0x16EE <= c && c <= 0x16F0 ) return true;
    if ( 0x1700 <= c && c <= 0x170C ) return true;
    if ( 0x170E <= c && c <= 0x1714 ) return true;
    if ( 0x1720 <= c && c <= 0x1734 ) return true;
    if ( 0x1740 <= c && c <= 0x1753 ) return true;
    if ( 0x1760 <= c && c <= 0x176C ) return true;
    if ( 0x176E <= c && c <= 0x1770 ) return true;
    if ( 0x1772 <= c && c <= 0x1773 ) return true;
    if ( 0x1780 <= c && c <= 0x17B3 ) return true;
    if ( 0x17B6 <= c && c <= 0x17D3 ) return true;
    if ( 0x17DC <= c && c <= 0x17DD ) return true;
    if ( 0x17E0 <= c && c <= 0x17E9 ) return true;
    if ( 0x180B <= c && c <= 0x180D ) return true;
    if ( 0x1810 <= c && c <= 0x1819 ) return true;
    if ( 0x1820 <= c && c <= 0x1877 ) return true;
    if ( 0x1880 <= c && c <= 0x18A9 ) return true;
    if ( 0x1900 <= c && c <= 0x191C ) return true;
    if ( 0x1920 <= c && c <= 0x192B ) return true;
    if ( 0x1930 <= c && c <= 0x193B ) return true;
    if ( 0x1946 <= c && c <= 0x196D ) return true;
    if ( 0x1970 <= c && c <= 0x1974 ) return true;
    if ( 0x1980 <= c && c <= 0x19A9 ) return true;
    if ( 0x19B0 <= c && c <= 0x19C9 ) return true;
    if ( 0x19D0 <= c && c <= 0x19D9 ) return true;
    if ( 0x1A00 <= c && c <= 0x1A1B ) return true;
    if ( 0x1B00 <= c && c <= 0x1B4B ) return true;
    if ( 0x1B50 <= c && c <= 0x1B59 ) return true;
    if ( 0x1B6B <= c && c <= 0x1B73 ) return true;
    if ( 0x1D00 <= c && c <= 0x1DCA ) return true;
    if ( 0x1DFE <= c && c <= 0x1E9B ) return true;
    if ( 0x1EA0 <= c && c <= 0x1EF9 ) return true;
    if ( 0x1F00 <= c && c <= 0x1F15 ) return true;
    if ( 0x1F18 <= c && c <= 0x1F1D ) return true;
    if ( 0x1F20 <= c && c <= 0x1F45 ) return true;
    if ( 0x1F48 <= c && c <= 0x1F4D ) return true;
    if ( 0x1F50 <= c && c <= 0x1F57 ) return true;
    if ( 0x1F5F <= c && c <= 0x1F7D ) return true;
    if ( 0x1F80 <= c && c <= 0x1FB4 ) return true;
    if ( 0x1FB6 <= c && c <= 0x1FBC ) return true;
    if ( 0x1FC2 <= c && c <= 0x1FC4 ) return true;
    if ( 0x1FC6 <= c && c <= 0x1FCC ) return true;
    if ( 0x1FD0 <= c && c <= 0x1FD3 ) return true;
    if ( 0x1FD6 <= c && c <= 0x1FDB ) return true;
    if ( 0x1FE0 <= c && c <= 0x1FEC ) return true;
    if ( 0x1FF2 <= c && c <= 0x1FF4 ) return true;
    if ( 0x1FF6 <= c && c <= 0x1FFC ) return true;
    if ( 0x203F <= c && c <= 0x2040 ) return true;
    if ( 0x2090 <= c && c <= 0x2094 ) return true;
    if ( 0x20D0 <= c && c <= 0x20DC ) return true;
    if ( 0x20E5 <= c && c <= 0x20EF ) return true;
    if ( 0x210A <= c && c <= 0x2113 ) return true;
    if ( 0x2119 <= c && c <= 0x211D ) return true;
    if ( 0x212A <= c && c <= 0x212D ) return true;
    if ( 0x212F <= c && c <= 0x2139 ) return true;
    if ( 0x213C <= c && c <= 0x213F ) return true;
    if ( 0x2145 <= c && c <= 0x2149 ) return true;
    if ( 0x2160 <= c && c <= 0x2184 ) return true;
    if ( 0x2C00 <= c && c <= 0x2C2E ) return true;
    if ( 0x2C30 <= c && c <= 0x2C5E ) return true;
    if ( 0x2C60 <= c && c <= 0x2C6C ) return true;
    if ( 0x2C74 <= c && c <= 0x2C77 ) return true;
    if ( 0x2C80 <= c && c <= 0x2CE4 ) return true;
    if ( 0x2D00 <= c && c <= 0x2D25 ) return true;
    if ( 0x2D30 <= c && c <= 0x2D65 ) return true;
    if ( 0x2D80 <= c && c <= 0x2D96 ) return true;
    if ( 0x2DA0 <= c && c <= 0x2DA6 ) return true;
    if ( 0x2DA8 <= c && c <= 0x2DAE ) return true;
    if ( 0x2DB0 <= c && c <= 0x2DB6 ) return true;
    if ( 0x2DB8 <= c && c <= 0x2DBE ) return true;
    if ( 0x2DC0 <= c && c <= 0x2DC6 ) return true;
    if ( 0x2DC8 <= c && c <= 0x2DCE ) return true;
    if ( 0x2DD0 <= c && c <= 0x2DD6 ) return true;
    if ( 0x2DD8 <= c && c <= 0x2DDE ) return true;
    if ( 0x3005 <= c && c <= 0x3007 ) return true;
    if ( 0x3021 <= c && c <= 0x302F ) return true;
    if ( 0x3031 <= c && c <= 0x3035 ) return true;
    if ( 0x3038 <= c && c <= 0x303C ) return true;
    if ( 0x3041 <= c && c <= 0x3096 ) return true;
    if ( 0x3099 <= c && c <= 0x309A ) return true;
    if ( 0x309D <= c && c <= 0x309F ) return true;
    if ( 0x30A1 <= c && c <= 0x30FA ) return true;
    if ( 0x30FC <= c && c <= 0x30FF ) return true;
    if ( 0x3105 <= c && c <= 0x312C ) return true;
    if ( 0x3131 <= c && c <= 0x318E ) return true;
    if ( 0x31A0 <= c && c <= 0x31B7 ) return true;
    if ( 0x31F0 <= c && c <= 0x31FF ) return true;
    if ( 0x3400 <= c && c <= 0x4DB5 ) return true;
    if ( 0x4E00 <= c && c <= 0x9FBB ) return true;
    if ( 0xA000 <= c && c <= 0xA48C ) return true;
    if ( 0xA717 <= c && c <= 0xA71A ) return true;
    if ( 0xA800 <= c && c <= 0xA827 ) return true;
    if ( 0xA840 <= c && c <= 0xA873 ) return true;
    if ( 0xAC00 <= c && c <= 0xD7A3 ) return true;
    if ( 0xF900 <= c && c <= 0xFA2D ) return true;
    if ( 0xFA30 <= c && c <= 0xFA6A ) return true;
    if ( 0xFA70 <= c && c <= 0xFAD9 ) return true;
    if ( 0xFB00 <= c && c <= 0xFB06 ) return true;
    if ( 0xFB13 <= c && c <= 0xFB17 ) return true;
    if ( 0xFB1D <= c && c <= 0xFB28 ) return true;
    if ( 0xFB2A <= c && c <= 0xFB36 ) return true;
    if ( 0xFB38 <= c && c <= 0xFB3C ) return true;
    if ( 0xFB40 <= c && c <= 0xFB41 ) return true;
    if ( 0xFB43 <= c && c <= 0xFB44 ) return true;
    if ( 0xFB46 <= c && c <= 0xFBB1 ) return true;
    if ( 0xFBD3 <= c && c <= 0xFD3D ) return true;
    if ( 0xFD50 <= c && c <= 0xFD8F ) return true;
    if ( 0xFD92 <= c && c <= 0xFDC7 ) return true;
    if ( 0xFDF0 <= c && c <= 0xFDFB ) return true;
    if ( 0xFE00 <= c && c <= 0xFE0F ) return true;
    if ( 0xFE20 <= c && c <= 0xFE23 ) return true;
    if ( 0xFE33 <= c && c <= 0xFE34 ) return true;
    if ( 0xFE4D <= c && c <= 0xFE4F ) return true;
    if ( 0xFE70 <= c && c <= 0xFE74 ) return true;
    if ( 0xFE76 <= c && c <= 0xFEFC ) return true;
    if ( 0xFF10 <= c && c <= 0xFF19 ) return true;
    if ( 0xFF21 <= c && c <= 0xFF3A ) return true;
    if ( 0xFF41 <= c && c <= 0xFF5A ) return true;
    if ( 0xFF66 <= c && c <= 0xFFBE ) return true;
    if ( 0xFFC2 <= c && c <= 0xFFC7 ) return true;
    if ( 0xFFCA <= c && c <= 0xFFCF ) return true;
    if ( 0xFFD2 <= c && c <= 0xFFD7 ) return true;
    if ( 0xFFDA <= c && c <= 0xFFDC ) return true;
    if ( 0x10000 <= c && c <= 0x1000B ) return true;
    if ( 0x1000D <= c && c <= 0x10026 ) return true;
    if ( 0x10028 <= c && c <= 0x1003A ) return true;
    if ( 0x1003C <= c && c <= 0x1003D ) return true;
    if ( 0x1003F <= c && c <= 0x1004D ) return true;
    if ( 0x10050 <= c && c <= 0x1005D ) return true;
    if ( 0x10080 <= c && c <= 0x100FA ) return true;
    if ( 0x10140 <= c && c <= 0x10174 ) return true;
    if ( 0x10300 <= c && c <= 0x1031E ) return true;
    if ( 0x10330 <= c && c <= 0x1034A ) return true;
    if ( 0x10380 <= c && c <= 0x1039D ) return true;
    if ( 0x103A0 <= c && c <= 0x103C3 ) return true;
    if ( 0x103C8 <= c && c <= 0x103CF ) return true;
    if ( 0x103D1 <= c && c <= 0x103D5 ) return true;
    if ( 0x10400 <= c && c <= 0x1049D ) return true;
    if ( 0x104A0 <= c && c <= 0x104A9 ) return true;
    if ( 0x10800 <= c && c <= 0x10805 ) return true;
    if ( 0x1080A <= c && c <= 0x10835 ) return true;
    if ( 0x10837 <= c && c <= 0x10838 ) return true;
    if ( 0x10900 <= c && c <= 0x10915 ) return true;
    if ( 0x10A00 <= c && c <= 0x10A03 ) return true;
    if ( 0x10A05 <= c && c <= 0x10A06 ) return true;
    if ( 0x10A0C <= c && c <= 0x10A13 ) return true;
    if ( 0x10A15 <= c && c <= 0x10A17 ) return true;
    if ( 0x10A19 <= c && c <= 0x10A33 ) return true;
    if ( 0x10A38 <= c && c <= 0x10A3A ) return true;
    if ( 0x12000 <= c && c <= 0x1236E ) return true;
    if ( 0x12400 <= c && c <= 0x12462 ) return true;
    if ( 0x1D165 <= c && c <= 0x1D169 ) return true;
    if ( 0x1D16D <= c && c <= 0x1D172 ) return true;
    if ( 0x1D17B <= c && c <= 0x1D182 ) return true;
    if ( 0x1D185 <= c && c <= 0x1D18B ) return true;
    if ( 0x1D1AA <= c && c <= 0x1D1AD ) return true;
    if ( 0x1D242 <= c && c <= 0x1D244 ) return true;
    if ( 0x1D400 <= c && c <= 0x1D454 ) return true;
    if ( 0x1D456 <= c && c <= 0x1D49C ) return true;
    if ( 0x1D49E <= c && c <= 0x1D49F ) return true;
    if ( 0x1D4A5 <= c && c <= 0x1D4A6 ) return true;
    if ( 0x1D4A9 <= c && c <= 0x1D4AC ) return true;
    if ( 0x1D4AE <= c && c <= 0x1D4B9 ) return true;
    if ( 0x1D4BD <= c && c <= 0x1D4C3 ) return true;
    if ( 0x1D4C5 <= c && c <= 0x1D505 ) return true;
    if ( 0x1D507 <= c && c <= 0x1D50A ) return true;
    if ( 0x1D50D <= c && c <= 0x1D514 ) return true;
    if ( 0x1D516 <= c && c <= 0x1D51C ) return true;
    if ( 0x1D51E <= c && c <= 0x1D539 ) return true;
    if ( 0x1D53B <= c && c <= 0x1D53E ) return true;
    if ( 0x1D540 <= c && c <= 0x1D544 ) return true;
    if ( 0x1D54A <= c && c <= 0x1D550 ) return true;
    if ( 0x1D552 <= c && c <= 0x1D6A5 ) return true;
    if ( 0x1D6A8 <= c && c <= 0x1D6C0 ) return true;
    if ( 0x1D6C2 <= c && c <= 0x1D6DA ) return true;
    if ( 0x1D6DC <= c && c <= 0x1D6FA ) return true;
    if ( 0x1D6FC <= c && c <= 0x1D714 ) return true;
    if ( 0x1D716 <= c && c <= 0x1D734 ) return true;
    if ( 0x1D736 <= c && c <= 0x1D74E ) return true;
    if ( 0x1D750 <= c && c <= 0x1D76E ) return true;
    if ( 0x1D770 <= c && c <= 0x1D788 ) return true;
    if ( 0x1D78A <= c && c <= 0x1D7A8 ) return true;
    if ( 0x1D7AA <= c && c <= 0x1D7C2 ) return true;
    if ( 0x1D7C4 <= c && c <= 0x1D7CB ) return true;
    if ( 0x1D7CE <= c && c <= 0x1D7FF ) return true;
    if ( 0x20000 <= c && c <= 0x2A6D6 ) return true;
    if ( 0x2F800 <= c && c <= 0x2FA1D ) return true;
    if ( 0xE0100 <= c && c <= 0xE01EF ) return true;
    switch ( c ) {
    case 0x5F:
    case 0xAA:
    case 0xB5:
    case 0xBA:
    case 0x2EE:
    case 0x386:
    case 0x38C:
    case 0x559:
    case 0x5BF:
    case 0x5C7:
    case 0x6FF:
    case 0x7FA:
    case 0x9B2:
    case 0x9D7:
    case 0xA3C:
    case 0xA5E:
    case 0xAD0:
    case 0xB71:
    case 0xB9C:
    case 0xBD7:
    case 0xCDE:
    case 0xD57:
    case 0xDBD:
    case 0xDCA:
    case 0xDD6:
    case 0xE84:
    case 0xE8A:
    case 0xE8D:
    case 0xEA5:
    case 0xEA7:
    case 0xEC6:
    case 0xF00:
    case 0xF35:
    case 0xF37:
    case 0xF39:
    case 0xFC6:
    case 0x10FC:
    case 0x1258:
    case 0x12C0:
    case 0x135F:
    case 0x17D7:
    case 0x1F59:
    case 0x1F5B:
    case 0x1F5D:
    case 0x1FBE:
    case 0x2054:
    case 0x2071:
    case 0x207F:
    case 0x20E1:
    case 0x2102:
    case 0x2107:
    case 0x2115:
    case 0x2124:
    case 0x2126:
    case 0x2128:
    case 0x214E:
    case 0x2D6F:
    case 0xFB3E:
    case 0xFF3F:
    case 0x10808:
    case 0x1083C:
    case 0x1083F:
    case 0x10A3F:
    case 0x1D4A2:
    case 0x1D4BB:
    case 0x1D546:
        return true;
    default:
        return false;
    }
    // #/generated#
}


    /**
     * Parser calls the method when it gets / or /= in literal context.
     */
    void readRegExp(int startToken)
        throws IOException
    {
        stringBufferTop = 0;
        if (startToken == Token.ASSIGN_DIV) {
            // Miss-scanned /=
            addToString('=');
        } else {
            if (startToken != Token.DIV) Kit.codeBug();
        }

        int c;
        while ((c = getChar()) != '/') {
            if (c == '\n' || c == EOF_CHAR) {
                ungetChar(c);
                throw parser.reportError("msg.unterminated.re.lit");
            }
            if (c == '\\') {
                addToString(c);
                c = getChar();
            }

            addToString(c);
        }
        int reEnd = stringBufferTop;

        while (true) {
            if (matchChar('g'))
                addToString('g');
            else if (matchChar('i'))
                addToString('i');
            else if (matchChar('m'))
                addToString('m');
            else
                break;
        }

        if (isAlpha(peekChar())) {
            throw parser.reportError("msg.invalid.re.flag");
        }

        this.string = new String(stringBuffer, 0, reEnd);
        this.regExpFlags = new String(stringBuffer, reEnd,
                                      stringBufferTop - reEnd);
    }

    boolean isXMLAttribute()
    {
        return xmlIsAttribute;
    }

    int getFirstXMLToken() throws IOException
    {
        xmlOpenTagsCount = 0;
        xmlIsAttribute = false;
        xmlIsTagContent = false;
        ungetChar('<');
        return getNextXMLToken();
    }

    int getNextXMLToken() throws IOException
    {
        stringBufferTop = 0; // remember the XML

        for (int c = getChar(); c != EOF_CHAR; c = getChar()) {
            if (xmlIsTagContent) {
                switch (c) {
                case '>':
                    addToString(c);
                    xmlIsTagContent = false;
                    xmlIsAttribute = false;
                    break;
                case '/':
                    addToString(c);
                    if (peekChar() == '>') {
                        c = getChar();
                        addToString(c);
                        xmlIsTagContent = false;
                        xmlOpenTagsCount--;
                    }
                    break;
                case '{':
                    ungetChar(c);
                    this.string = getStringFromBuffer();
                    return Token.XML;
                case '\'':
                case '"':
                    addToString(c);
                    if (!readQuotedString(c)) return Token.ERROR;
                    break;
                case '=':
                    addToString(c);
                    xmlIsAttribute = true;
                    break;
                case ' ':
                case '\t':
                case '\r':
                case '\n':
                    addToString(c);
                    break;
                default:
                    addToString(c);
                    xmlIsAttribute = false;
                    break;
                }

                if (!xmlIsTagContent && xmlOpenTagsCount == 0) {
                    this.string = getStringFromBuffer();
                    return Token.XMLEND;
                }
            } else {
                switch (c) {
                case '<':
                    addToString(c);
                    c = peekChar();
                    switch (c) {
                    case '!':
                        c = getChar(); // Skip !
                        addToString(c);
                        c = peekChar();
                        switch (c) {
                        case '-':
                            c = getChar(); // Skip -
                            addToString(c);
                            c = getChar();
                            if (c == '-') {
                                addToString(c);
                                if(!readXmlComment()) return Token.ERROR;
                            } else {
                                // throw away the string in progress
                                stringBufferTop = 0;
                                this.string = null;
                                parser.addError("msg.XML.bad.form");
                                return Token.ERROR;
                            }
                            break;
                        case '[':
                            c = getChar(); // Skip [
                            addToString(c);
                            if (getChar() == 'C' &&
                                getChar() == 'D' &&
                                getChar() == 'A' &&
                                getChar() == 'T' &&
                                getChar() == 'A' &&
                                getChar() == '[')
                            {
                                addToString('C');
                                addToString('D');
                                addToString('A');
                                addToString('T');
                                addToString('A');
                                addToString('[');
                                if (!readCDATA()) return Token.ERROR;

                            } else {
                                // throw away the string in progress
                                stringBufferTop = 0;
                                this.string = null;
                                parser.addError("msg.XML.bad.form");
                                return Token.ERROR;
                            }
                            break;
                        default:
                            if(!readEntity()) return Token.ERROR;
                            break;
                        }
                        break;
                    case '?':
                        c = getChar(); // Skip ?
                        addToString(c);
                        if (!readPI()) return Token.ERROR;
                        break;
                    case '/':
                        // End tag
                        c = getChar(); // Skip /
                        addToString(c);
                        if (xmlOpenTagsCount == 0) {
                            // throw away the string in progress
                            stringBufferTop = 0;
                            this.string = null;
                            parser.addError("msg.XML.bad.form");
                            return Token.ERROR;
                        }
                        xmlIsTagContent = true;
                        xmlOpenTagsCount--;
                        break;
                    default:
                        // Start tag
                        xmlIsTagContent = true;
                        xmlOpenTagsCount++;
                        break;
                    }
                    break;
                case '{':
                    ungetChar(c);
                    this.string = getStringFromBuffer();
                    return Token.XML;
                default:
                    addToString(c);
                    break;
                }
            }
        }

        stringBufferTop = 0; // throw away the string in progress
        this.string = null;
        parser.addError("msg.XML.bad.form");
        return Token.ERROR;
    }

    /**
     *
     */
    private boolean readQuotedString(int quote) throws IOException
    {
        for (int c = getChar(); c != EOF_CHAR; c = getChar()) {
            addToString(c);
            if (c == quote) return true;
        }

        stringBufferTop = 0; // throw away the string in progress
        this.string = null;
        parser.addError("msg.XML.bad.form");
        return false;
    }

    /**
     *
     */
    private boolean readXmlComment() throws IOException
    {
        for (int c = getChar(); c != EOF_CHAR;) {
            addToString(c);
            if (c == '-' && peekChar() == '-') {
                c = getChar();
                addToString(c);
                if (peekChar() == '>') {
                    c = getChar(); // Skip >
                    addToString(c);
                    return true;
                } else {
                    continue;
                }
            }
            c = getChar();
        }

        stringBufferTop = 0; // throw away the string in progress
        this.string = null;
        parser.addError("msg.XML.bad.form");
        return false;
    }

    /**
     *
     */
    private boolean readCDATA() throws IOException
    {
        for (int c = getChar(); c != EOF_CHAR;) {
            addToString(c);
            if (c == ']' && peekChar() == ']') {
                c = getChar();
                addToString(c);
                if (peekChar() == '>') {
                    c = getChar(); // Skip >
                    addToString(c);
                    return true;
                } else {
                    continue;
                }
            }
            c = getChar();
        }

        stringBufferTop = 0; // throw away the string in progress
        this.string = null;
        parser.addError("msg.XML.bad.form");
        return false;
    }

    /**
     *
     */
    private boolean readEntity() throws IOException
    {
        int declTags = 1;
        for (int c = getChar(); c != EOF_CHAR; c = getChar()) {
            addToString(c);
            switch (c) {
            case '<':
                declTags++;
                break;
            case '>':
                declTags--;
                if (declTags == 0) return true;
                break;
            }
        }

        stringBufferTop = 0; // throw away the string in progress
        this.string = null;
        parser.addError("msg.XML.bad.form");
        return false;
    }

    /**
     *
     */
    private boolean readPI() throws IOException
    {
        for (int c = getChar(); c != EOF_CHAR; c = getChar()) {
            addToString(c);
            if (c == '?' && peekChar() == '>') {
                c = getChar(); // Skip >
                addToString(c);
                return true;
            }
        }

        stringBufferTop = 0; // throw away the string in progress
        this.string = null;
        parser.addError("msg.XML.bad.form");
        return false;
    }

proto.getStringFromBuffer = function ( )
{
    return this.stringBuffer.join("");
}

proto.addToString = function ( c )
{
    this.stringBuffer.push(c);
}

proto.ungetChar = function ( c )
{
    // can not unread past across line boundary
    if ( this.ungetBuffer.length && this.ungetBuffer[this.ungetBuffer.length-1] == '\n') Kit.codeBug();
    this.ungetBuffer.push(c);
}

    private boolean matchChar(int test) throws IOException
    {
        int c = getChar();
        if (c == test) {
            return true;
        } else {
            ungetChar(c);
            return false;
        }
    }

    private int peekChar() throws IOException
    {
        int c = getChar();
        ungetChar(c);
        return c;
    }

    private int getChar() throws IOException
    {
        if (ungetCursor != 0) {
            return ungetBuffer[--ungetCursor];
        }

        for(;;) {
            int c;
            if (sourceString != null) {
                if (sourceCursor == sourceEnd) {
                    hitEOF = true;
                    return EOF_CHAR;
                }
                c = sourceString.charAt(sourceCursor++);
            } else {
                if (sourceCursor == sourceEnd) {
                    if (!fillSourceBuffer()) {
                        hitEOF = true;
                        return EOF_CHAR;
                    }
                }
                c = sourceBuffer[sourceCursor++];
            }

            if (lineEndChar >= 0) {
                if (lineEndChar == '\r' && c == '\n') {
                    lineEndChar = '\n';
                    continue;
                }
                lineEndChar = -1;
                lineStart = sourceCursor - 1;
                lineno++;
            }

            if (c <= 127) {
                if (c == '\n' || c == '\r') {
                    lineEndChar = c;
                    c = '\n';
                }
            } else {
                if (isJSFormatChar(c)) {
                    continue;
                }
                if (ScriptRuntime.isJSLineTerminator(c)) {
                    lineEndChar = c;
                    c = '\n';
                }
            }
            return c;
        }
    }

    private void skipLine() throws IOException
    {
        // skip to end of line
        int c;
        while ((c = getChar()) != EOF_CHAR && c != '\n') { }
        ungetChar(c);
    }

    final int getOffset()
    {
        int n = sourceCursor - lineStart;
        if (lineEndChar >= 0) { --n; }
        return n;
    }

    final String getLine()
    {
        if (sourceString != null) {
            // String case
            int lineEnd = sourceCursor;
            if (lineEndChar >= 0) {
                --lineEnd;
            } else {
                for (; lineEnd != sourceEnd; ++lineEnd) {
                    int c = sourceString.charAt(lineEnd);
                    if (ScriptRuntime.isJSLineTerminator(c)) {
                        break;
                    }
                }
            }
            return sourceString.substring(lineStart, lineEnd);
        } else {
            // Reader case
            int lineLength = sourceCursor - lineStart;
            if (lineEndChar >= 0) {
                --lineLength;
            } else {
                // Read until the end of line
                for (;; ++lineLength) {
                    int i = lineStart + lineLength;
                    if (i == sourceEnd) {
                        try {
                            if (!fillSourceBuffer()) { break; }
                        } catch (IOException ioe) {
                            // ignore it, we're already displaying an error...
                            break;
                        }
                        // i recalculuation as fillSourceBuffer can move saved
                        // line buffer and change lineStart
                        i = lineStart + lineLength;
                    }
                    int c = sourceBuffer[i];
                    if (ScriptRuntime.isJSLineTerminator(c)) {
                        break;
                    }
                }
            }
            return new String(sourceBuffer, lineStart, lineLength);
        }
    }

    private boolean fillSourceBuffer() throws IOException
    {
        if (sourceString != null) Kit.codeBug();
        if (sourceEnd == sourceBuffer.length) {
            if (lineStart != 0) {
                System.arraycopy(sourceBuffer, lineStart, sourceBuffer, 0,
                                 sourceEnd - lineStart);
                sourceEnd -= lineStart;
                sourceCursor -= lineStart;
                lineStart = 0;
            } else {
                char[] tmp = new char[sourceBuffer.length * 2];
                System.arraycopy(sourceBuffer, 0, tmp, 0, sourceEnd);
                sourceBuffer = tmp;
            }
        }
        int n = sourceReader.read(sourceBuffer, sourceEnd,
                                  sourceBuffer.length - sourceEnd);
        if (n < 0) {
            return false;
        }
        sourceEnd += n;
        return true;
    }

}
