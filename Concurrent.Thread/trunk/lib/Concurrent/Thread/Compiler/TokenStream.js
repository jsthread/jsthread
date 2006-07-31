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
//@require   Concurrent.Thread.Compiler.CharacterClass


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
    this.lineno      = Number(lineno) || 0;
    this.lineEndChar = undefined;

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
            } else if (!isSpace(c)) {
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

proto.matchChar = function ( test )
{
    var c = getChar();
    if ( c === test ) {
        return true;
    } else {
        ungetChar(c);
        return false;
    }
}

proto.peekChar = function ( )
{
    var c = getChar();
    ungetChar(c);
    return c;
}

proto.getChar = function ( )
{
    if ( this.ungetBuffer.length ) return this.ungetBuffer.pop();

    for ( ;; ) {
        if ( this.sourceCursor == this.sourceEnd ) {
            this.hitEOF = true;
            return EOF_CHAR;
        }
        var c = this.sourceString.charAt(this.sourceCursor++);

        if ( this.lineEndChar ) {
            if ( this.lineEndChar == '\r' && c == '\n') {
                this.lineEndChar = '\n';
                continue;
            }
            this.lineEndChar = undefined;
            this.lineStart   = this.sourceCursor - 1;
            this.lineno++;
        }

        if ( isLineTerminator(c) ) {
            this.lineEndChar = c;
            c = '\n';
        }
        if ( isFormatChar(c) ) {
            continue;
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

}
