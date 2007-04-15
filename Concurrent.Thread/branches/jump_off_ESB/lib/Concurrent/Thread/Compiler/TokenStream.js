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
 *   Ethan Hugg
 *   Terry Lucas
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
 * This file is based on the file TokenStream.java in Rhino 1.6R5.
 */



//@esmodpp
//@version 0.0.0
//@namespace Concurrent.Thread.Compiler
//@require   Concurrent.Thread
//@require   Concurrent.Thread.Compiler.Kit
//@require   Concurrent.Thread.Compiler.Token
//@require   Concurrent.Thread.Compiler.CharacterClass


/*
 * For chars - because we need something out-of-range
 * to check.  (And checking EOF by exception is annoying.)
 * Fortunatelly, U+FFFF is guaranteed not to be assigned 
 * for any character.
 * Note distinction from EOF token type!
 */
var EOF_CHAR = String.fromCharCode(0xFFFF);



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
    this.lineno      = Number(lineno) || 1;
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
};


function isKeyword ( s )
{
    return Token.EOF != stringToKeyword(s);
}


var strIdMap = {
    "break"         : Token.BREAK,
    "case"          : Token.CASE,
    "catch"         : Token.CATCH,
    "continue"      : Token.CONTINUE,
    "default"       : Token.DEFAULT,
    "delete"        : Token.DELPROP,
    "do"            : Token.DO,
    "else"          : Token.ELSE,
    "export"        : Token.EXPORT,
    "false"         : Token.FALSE,
    "finally"       : Token.FINALLY,
    "for"           : Token.FOR,
    "function"      : Token.FUNCTION,
    "if"            : Token.IF,
    "in"            : Token.IN,
    "instanceof"    : Token.INSTANCEOF,
    "new"           : Token.NEW,
    "null"          : Token.NULL,
    "return"        : Token.RETURN,
    "switch"        : Token.SWITCH,
    "this"          : Token.THIS,
    "throw"         : Token.THROW,
    "true"          : Token.TRUE,
    "try"           : Token.TRY,
    "typeof"        : Token.TYPEOF,
    "var"           : Token.VAR,
    "void"          : Token.VOID,
    "while"         : Token.WHILE,
    "with"          : Token.WITH,
    // Future Reserved Words
    "abstract"      : Token.RESERVED,
    "boolean"       : Token.RESERVED,
    "byte"          : Token.RESERVED,
    "char"          : Token.RESERVED,
    "class"         : Token.RESERVED,
    "const"         : Token.RESERVED,
    "debugger"      : Token.RESERVED,
    "double"        : Token.RESERVED,
    "enum"          : Token.RESERVED,
    "extends"       : Token.RESERVED,
    "final"         : Token.RESERVED,
    "float"         : Token.RESERVED,
    "goto"          : Token.RESERVED,
    "implements"    : Token.RESERVED,
    "import"        : Token.IMPORT,
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
    "throws"        : Token.RESERVED,
    "transient"     : Token.RESERVED,
    "volatile"      : Token.RESERVED
};

function stringToKeyword ( name )
{
    return strIdMap.hasOwnProperty(name) ? strIdMap[name] : Token.EOF;
}


proto.getLineno = function ( ) { return this.lineno; };

proto.getString = function ( ) { return this.string; };

proto.eof = function ( ) { return this.hitEOF; };


proto.getToken = function ( )
{
    var c;

retry:
    for (;;) {
        // Eat whitespace, possibly sensitive to newlines.
        for (;;) {
            c = this.getChar();
            if ( c === EOF_CHAR ) {
                return Token.EOF;
            } else if ( c === '\n' ) {
                this.dirtyLine = false;
                return Token.EOL;
            } else if ( !isSpace(c) ) {
                if ( c !== '-' ) {
                    this.dirtyLine = true;
                }
                break;
            }
        }

        // identifier/keyword/instanceof?
        // watch out for starting with a <backslash>
        var identifierStart      = false;
        var isUnicodeEscapeStart = false;
        if ( c === '\\' ) {
            c = this.getChar();
            if ( c === 'u' ) {
                identifierStart      = true;
                isUnicodeEscapeStart = true;
                this.stringBuffer    = ["\\u"];
            } else {
                identifierStart = false;
                this.ungetChar(c);
                c = '\\';
            }
        } else if ( isIdentifierStart(c) ) {
            identifierStart   = true;
            this.stringBuffer = [c];
        }

        if ( identifierStart ) {
            var containsEscape = isUnicodeEscapeStart;
            for (;;) {
                if ( isUnicodeEscapeStart ) {
                    // strictly speaking we should probably push-back
                    // all the bad characters if the <backslash>uXXXX
                    // sequence is malformed. But since there isn't a
                    // correct context(is there?) for a bad Unicode
                    // escape sequence in an identifier, we can report
                    // an error here.
                    for ( var i=0;  i != 4;  ++i ) {
                        c = this.getChar();
                        if ( isHexDigit(c) ) {
                            this.addToString(c);
                        } else {
                            this.parser.addError("msg.invalid.escape");
                            return Token.ERROR;
                        }
                    }
                    isUnicodeEscapeStart = false;
                } else {
                    c = this.getChar();
                    if (c == '\\') {
                        c = this.getChar();
                        if (c == 'u') {
                            this.addToString("\\u");
                            isUnicodeEscapeStart = true;
                            containsEscape       = true;
                        } else {
                            this.parser.addError("msg.illegal.character");
                            return Token.ERROR;
                        }
                    } else {
                        if ( !isIdentifierPart(c) ) break;
                        this.addToString(c);
                    }
                }
            }
            this.ungetChar(c);

            var str = this.getStringFromBuffer();
            if ( !containsEscape ) {
                // OPT we shouldn't have to make a string to
                // check if it's a keyword.

                // Return the corresponding token if it's a keyword
                var result = stringToKeyword(str);
                if ( result != Token.EOF ) return result;
            }
            this.string = str;
            return Token.NAME;
        }

        // is it a number?
        if ( isDigit(c)  ||  (c==='.' && isDigit(this.peekChar())) ) {
            this.stringBuffer = [];
            var base = 10;

            if ( c === '0' ) {
                this.addToString('0');
                c = this.getChar();
                if ( c === 'x' || c === 'X' ) {
                    this.addToString(c);
                    base = 16;
                    c = this.getChar();
                } else if ( isDigit(c) ) {
                    base = 8;
                }
            }

            if ( base === 16 ) {
                while ( isHexDigit(c) ) {
                    this.addToString(c);
                    c = this.getChar();
                }
            } else {
                while ( isDigit(c) ) {
                    /*
                     * We permit 08 and 09 as decimal numbers, which
                     * makes our behavior a superset of the ECMA
                     * numeric grammar.  We might not always be so
                     * permissive, so we warn about it.
                     */
                    if ( base === 8  &&  (c==='8' || c==='9') ) {
                        this.parser.addWarning("msg.bad.octal.literal", c == '8' ? "8" : "9");
                        base = 10;
                    }
                    this.addToString(c);
                    c = this.getChar();
                }
            }

            if ( base === 10 ) {
                if ( c === '.' ) {
                    do {
                        this.addToString(c);
                        c = this.getChar();
                    } while ( isDigit(c) );
                }
                if ( c === 'e' || c === 'E' ) {
                    this.addToString(c);
                    c = this.getChar();
                    if ( c === '+' || c === '-' ) {
                        this.addToString(c);
                        c = this.getChar();
                    }
                    if ( !isDigit(c) ) {
                        this.parser.addError("msg.missing.exponent");
                        return Token.ERROR;
                    }
                    do {
                        this.addToString(c);
                        c = this.getChar();
                    } while ( isDigit(c) );
                }
            }
            this.ungetChar(c);

            this.string = this.getStringFromBuffer();
            return Token.NUMBER;
        }

        // is it a string?
        if ( c === '"' || c === "'" ) {
            var quoteChar = c;
            this.stringBuffer = [c];
            c = this.getChar();
            while ( c !== quoteChar ) {
                if ( c === '\n' || c === EOF_CHAR ) {
                    this.ungetChar(c);
                    this.parser.addError("msg.unterminated.string.lit");
                    return Token.ERROR;
                }
                if ( c === '\\' ) {
                    this.addToString('\\');
                    c = this.getChar();
                    if ( c === '\n' ) {
                        // Remove line terminator after escape to follow
                        // SpiderMonkey and C/C++
                        // But, issue warning since ECMA262-3 does not allow that.
                        this.parser.addWarning("msg.unsafe.string.lit");
                    } else {
                        this.addToString(c);
                    }
                } else {
                    this.addToString(c);
                }
                c = this.getChar();
            }
            this.addToString(quoteChar);
            this.string = this.getStringFromBuffer();
            return Token.STRING;
        }

        switch ( c.charCodeAt(0) ) {
        case 0x3B:  // ';'
            return Token.SEMI;

        case 0x5B:  // '['
            return Token.LB;

        case 0x5D:  // ']'
            return Token.RB;

        case 0x7B:  // '{'
            return Token.LC;

        case 0x7D:  // '}'
            return Token.RC;

        case 0x28:  // '('
            return Token.LP;

        case 0x29:  // ')'
            return Token.RP;

        case 0x2C:  // ','
            return Token.COMMA;

        case 0x3F:  // '?'
            return Token.HOOK;

        case 0x40:  // '@'
            return Token.XMLATTR;

        case 0x3A:  // ':'
            if ( this.matchChar(':') ) {
                return Token.COLONCOLON;
            } else {
                return Token.COLON;
            }

        case 0x2E:  // '.'
            if ( this.matchChar('.') ) {
                return Token.DOTDOT;
            } else if ( this.matchChar('(') ) {
                return Token.DOTQUERY;
            } else {
                return Token.DOT;
            }

        case 0x7C:  // '|'
            if ( this.matchChar('|') ) {
                return Token.OR;
            } else if ( this.matchChar('=') ) {
                return Token.ASSIGN_BITOR;
            } else {
                return Token.BITOR;
            }

        case 0x5E:  // '^'
            if ( this.matchChar('=') ) {
                return Token.ASSIGN_BITXOR;
            } else {
                return Token.BITXOR;
            }

        case 0x26:  // '&'
            if ( this.matchChar('&') ) {
                return Token.AND;
            } else if ( this.matchChar('=') ) {
                return Token.ASSIGN_BITAND;
            } else {
                return Token.BITAND;
            }

        case 0x3D:  // '='
            if ( this.matchChar('=') ) {
                if ( this.matchChar('=') ) {
                    return Token.SHEQ;
                } else {
                    return Token.EQ;
                }
            } else {
                return Token.ASSIGN;
            }

        case 0x21:  // '!'
            if ( this.matchChar('=') ) {
                if ( this.matchChar('=') ) {
                    return Token.SHNE;
                } else {
                    return Token.NE;
                }
            } else {
                return Token.NOT;
            }

        case 0x3C:  // '<'
            /* NB:treat HTML begin-comment as comment-till-eol */
            if ( this.matchChar('!') ) {
                if ( this.matchChar('-') ) {
                    if ( this.matchChar('-') ) {
                        this.skipLine();
                        continue retry;
                    }
                    this.ungetChar('-');
                }
                this.ungetChar('!');
            }
            if ( this.matchChar('<') ) {
                if ( this.matchChar('=') ) {
                    return Token.ASSIGN_LSH;
                } else {
                    return Token.LSH;
                }
            } else {
                if ( this.matchChar('=') ) {
                    return Token.LE;
                } else {
                    return Token.LT;
                }
            }

        case 0x3E:  // '>'
            if ( this.matchChar('>') ) {
                if ( this.matchChar('>') ) {
                    if ( this.matchChar('=') ) {
                        return Token.ASSIGN_URSH;
                    } else {
                        return Token.URSH;
                    }
                } else {
                    if ( this.matchChar('=') ) {
                        return Token.ASSIGN_RSH;
                    } else {
                        return Token.RSH;
                    }
                }
            } else {
                if ( this.matchChar('=') ) {
                    return Token.GE;
                } else {
                    return Token.GT;
                }
            }

        case 0x2A:  // '*'
            if ( this.matchChar('=') ) {
                return Token.ASSIGN_MUL;
            } else {
                return Token.MUL;
            }

        case 0x2F:  // '/'
            // is it a // comment?
            if ( this.matchChar('/') ) {
                this.skipLine();
                continue retry;
            } else if ( this.matchChar('*') ) {
                c = this.getChar();
                for (;;) {
                    if ( c === EOF_CHAR ) {
                        this.parser.addError("msg.unterminated.comment");
                        return Token.ERROR;
                    } else if ( c === '*' ) {
                        c = this.getChar();
                        if ( c === '/' ) {
                            continue retry;
                        }
                    }
                }
            } else if ( this.matchChar('=') ) {
                return Token.ASSIGN_DIV;
            } else {
                return Token.DIV;
            }

        case 0x25:  // '%'
            if ( this.matchChar('=') ) {
                return Token.ASSIGN_MOD;
            } else {
                return Token.MOD;
            }

        case 0x7E:  // '~'
            return Token.BITNOT;

        case 0x2B:  // '+'
            if ( this.matchChar('=') ) {
                return Token.ASSIGN_ADD;
            } else if ( this.matchChar('+') ) {
                return Token.INC;
            } else {
                return Token.ADD;
            }

        case 0x2D:  // '-'
            if ( this.matchChar('=') ) {
                c = Token.ASSIGN_SUB;
            } else if ( this.matchChar('-') ) {
                if ( !this.dirtyLine ) {
                    // treat HTML end-comment after possible whitespace
                    // after line start as comment-untill-eol
                    if ( this.matchChar('>')) {
                        this.skipLine();
                        continue retry;
                    }
                }
                c = Token.DEC;
            } else {
                c = Token.SUB;
            }
            this.dirtyLine = true;
            return c;

        default:
            parser.addError("msg.illegal.character");
            return Token.ERROR;
        }
    }
};



/**
 * Parser calls the method when it gets / or /= in literal context.
 */
function readRegExp ( startToken )
{
    if ( startToken === Token.ASSIGN_DIV ) {
        // Miss-scanned /=
        stringBuffer = ["/="];
    } else if ( startToken !== Token.DIV ) {
        stringBuffer = ["/"];
    } else {
        Kit.codeBug();
    }

    var c;
    while ( (c = this.getChar()) !== '/' ) {
        if ( c === '\n' || c === EOF_CHAR ) {
            this.ungetChar(c);
            throw this.parser.reportError("msg.unterminated.re.lit");
        }
        if ( c === '\\' ) {
            this.addToString(c);
            c = this.getChar();
        }
        this.addToString(c);
    }
    this.addToString("/");

    while ( isIdentifierPart(c = this.getChar()) ) {
        this.addToString(c);
    }
    this.ungetChar(c);

    this.string = this.getStringFromBuffer();
}


proto.isXMLAttribute = function ( )
{
    return this.xmlIsAttribute;
};

proto.getFirstXMLToken = function ( )
{
    this.xmlOpenTagsCount = 0;
    this.xmlIsAttribute   = false;
    this.xmlIsTagContent  = false;
    this.ungetChar('<');
    return this.getNextXMLToken();
};

proto.getNextXMLToken = function ( )
{
    this.stringBuffer = []; // remember the XML

    for ( var c=this.getChar();  c !== EOF_CHAR;  c=this.getChar() ) {
        if ( this.xmlIsTagContent ) {
            switch ( c.charCodeAt(0) ) {
            case 0x3E:  // '>'
                this.addToString('>');
                this.xmlIsTagContent = false;
                this.xmlIsAttribute  = false;
                break;
            case 0x2F:  // '/'
                this.addToString('/');
                if ( this.matchChar('>') ) {
                    this.addToString('>');
                    this.xmlIsTagContent = false;
                    this.xmlOpenTagsCount--;
                }
                break;
            case 0x7B:  // '{'
                this.ungetChar('{');
                this.string = this.getStringFromBuffer();
                return Token.XML;
            case 0x27:  // "'"
            case 0x22:  // '"'
                this.addToString(c);
                if ( !this.readQuotedString(c) ) return Token.ERROR;
                break;
            case 0x3D:  // '='
                this.addToString('=');
                this.xmlIsAttribute = true;
                break;
            case 0x20:  // ' '
            case 0x09:  // '\t'
            // case 0x0D:  // '\r'  CR never comes here because of the implementation of getChar().
            case 0x0A:  // '\n'
                this.addToString(c);
                break;
            default:
                this.addToString(c);
                this.xmlIsAttribute = false;
                break;
            }

            if ( !this.xmlIsTagContent  &&  this.xmlOpenTagsCount === 0 ) {
                this.string = this.getStringFromBuffer();
                return Token.XMLEND;
            }
        } else {
            switch ( c.charCodeAt(0) ) {
            case 0x3C:  // '<'
                this.addToString('<');
                c = this.getChar();
                switch ( c.charCodeAt(0) ) {
                case 0x21:  // '!'
                    this.addToString('!');
                    c = this.getChar();
                    switch ( c.charCodeAt(0) ) {
                    case 0x2D:  // '-'
                        if ( this.getChar() === '-' ) {
                            this.addToString('--');
                            if ( !this.readXmlComment() ) return Token.ERROR;
                        } else {
                            this.parser.addError("msg.XML.bad.form");
                            return Token.ERROR;
                        }
                        break;
                    case 0x5B:  // '['
                        if ( this.getChar() === 'C' &&
                             this.getChar() === 'D' &&
                             this.getChar() === 'A' &&
                             this.getChar() === 'T' &&
                             this.getChar() === 'A' &&
                             this.getChar() === '['    )
                        {
                            this.addToString('[CDATA[');
                            if ( !this.readCDATA() ) return Token.ERROR;
                        } else {
                            this.parser.addError("msg.XML.bad.form");
                            return Token.ERROR;
                        }
                        break;
                    default:
                        this.ungetChar(c);
                        if( !this.readEntity() ) return Token.ERROR;
                        break;
                    }
                    break;
                case 0x3F:  // '?'
                    this.addToString('?');
                    if ( !this.readPI() ) return Token.ERROR;
                    break;
                case 0x2F:  // '/'
                    // End tag
                    this.addToString('/');
                    if ( this.xmlOpenTagsCount === 0 ) {
                        this.parser.addError("msg.XML.bad.form");
                        return Token.ERROR;
                    }
                    this.xmlIsTagContent = true;
                    this.xmlOpenTagsCount--;
                    break;
                default:
                    // Start tag
                    this.ungetChar(c);
                    this.xmlIsTagContent = true;
                    this.xmlOpenTagsCount++;
                    break;
                }
                break;
            case 0x7B:  // '{'
                this.ungetChar('{');
                this.string = this.getStringFromBuffer();
                return Token.XML;
            default:
                this.addToString(c);
                break;
            }
        }
    }

    this.parser.addError("msg.XML.bad.form");
    return Token.ERROR;
};

proto.readQuotedString = function ( quote )
{
    for ( var c=this.getChar();  c !== EOF_CHAR;  c=this.getChar() ) {
        this.addToString(c);
        if ( c === quote ) return true;
    }
    parser.addError("msg.XML.bad.form");
    return false;
};

proto.readXmlComment = function ( )
{
    for ( var c=this.getChar();  c !== EOF_CHAR; ) {
        this.addToString(c);
        if ( c === '-'  &&  this.matchChar('-') ) {
            this.addToString('-');
            if ( this.matchChar('>') ) {
                this.addToString('>');
                return true;
            } else {
                // Strictly, XMLComment MUST NOT include the sequence "--".
                // So, if the program execution is here, the source is 
                // syntactically wrong, according to ECMA367. However, we 
                // allow the sequence here, so that our syntax is super-set 
                // of the specification.
                c = '-';
                continue;
            }
        }
        c = this.getChar();
    }
    this.parser.addError("msg.XML.bad.form");
    return false;
};

proto.readCDATA = function ( )
{
    for ( var c=this.getChar();  c !== EOF_CHAR; ) {
        this.addToString(c);
        if ( c === ']'  &&  this.matchChar(']') ) {
            this.addToString(']');
            if ( this.matchChar('>') ) {
                this.addToString('>');
                return true;
            } else {
                c = ']';
                continue;
            }
        }
        c = this.getChar();
    }
    this.parser.addError("msg.XML.bad.form");
    return false;
};

proto.readEntity = function ( )
{
    var declTags = 1;
    for ( var c=this.getChar();  c !== EOF_CHAR;  c=this.getChar() ) {
        this.addToString(c);
        switch ( c ) {
        case '<':
            declTags++;
            break;
        case '>':
            declTags--;
            if ( declTags === 0 ) return true;
            break;
        }
    }
    this.parser.addError("msg.XML.bad.form");
    return false;
};

proto.readPI = function ( )
{
    for ( var c=this.getChar();  c !== EOF_CHAR;  c=this.getChar() ) {
        this.addToString(c);
        if ( c === '?'  &&  this.matchChar('>') ) {
            this.addToString('>');
            return true;
        }
    }
    this.parser.addError("msg.XML.bad.form");
    return false;
};


proto.getStringFromBuffer = function ( )
{
    return this.stringBuffer.join("");
};

proto.addToString = function ( /* variable arguments */ )
{
    this.stringBuffer.push.apply(this.stringBuffer, arguments);
};

proto.ungetChar = function ( c )
{
    // can not unread past across line boundary
    if ( this.ungetBuffer.length && this.ungetBuffer[this.ungetBuffer.length-1] == '\n') Kit.codeBug();
    this.ungetBuffer.push(c);
};

proto.matchChar = function ( test )
{
    var c = this.getChar();
    if ( c === test ) {
        return true;
    } else {
        this.ungetChar(c);
        return false;
    }
};

proto.peekChar = function ( )
{
    var c = this.getChar();
    this.ungetChar(c);
    return c;
};

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
};

proto.skipLine = function ( )
{
    // skip to end of line
    var c;
    while ((c=this.getChar()) != EOF_CHAR && c != '\n') { }
    this.ungetChar(c);
};

proto.getOffset = function ( )
{
    var n = this.sourceCursor - this.lineStart;
    if ( this.lineEndChar ) { --n; }
    return n;
};

proto.getLine = function ( )
{
    var lineEnd = this.sourceCursor;
    if ( this.lineEndChar ) {
        --lineEnd;
    } else {
        for (; lineEnd != this.sourceEnd; ++lineEnd) {
            var c = this.sourceString.charAt(lineEnd);
            if ( isLineTerminator(c) ) {
                break;
            }
        }
    }
    return this.sourceString.substring(this.lineStart, lineEnd);
};

