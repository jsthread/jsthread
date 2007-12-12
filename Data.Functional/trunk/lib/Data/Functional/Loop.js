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
 * The Original Code is Data.Functional code.
 *
 * The Initial Developer of the Original Code is
 * Daisuke Maki.
 * Portions created by the Initial Developer are Copyright (C) 2005-2007
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
//@version 0.5.0



//@namespace Data.Functional

//@export discontinue
function discontinue ( /* variable arguments */ ) {
    throw new DiscontinueException(arguments);
}

//@export DiscontinueException
function DiscontinueException ( args ) {
    this.args = args;
}
var proto = DiscontinueException.prototype;
proto.name    = NAMESPACE + ".DiscontinueException";
proto.message = "unusual use of `discontinue' (this should be caught by `forEach' or other iteration-methods).";


//@export ignore
function ignore ( /* variable arguments */ ) {
    throw new IgnoreException(arguments);
}

//@export IgnoreException
function IgnoreException ( args ) {
    this.args = args;
}
var proto = IgnoreException.prototype;
proto.name    = NAMESPACE + ".IgnoreException";
proto.message = "unusual use of `ignore' (this should be caught by `forEach' or other iteration-methods).";


//@export return_list
function return_list ( /* variable arguments */ ) {
    throw new ReturnListException(arguments);
}

//@export ReturnListException
function ReturnListException ( args ) {
    this.args = args;
}
var proto = ReturnListException.prototype;
proto.name    = NAMESPACE + ".ReturnListException";
proto.message = "unusual use of `return_list' (this should be caught by `forEach' or other iteration-methods).";



//@namespace Data.Functional.Loop

//@export EndOfLoopException
function EndOfLoopException ( v ) {
    this.result = v;
}
var proto = EndOfLoopException.prototype;
proto.name    = NAMESPACE + ".EndOfLoopException";
proto.message = "this should be caught by `forEach' or other iteration-methods";


//@export wrap_for_forEach
function wrap_for_forEach ( t, f ) {
    if ( typeof f != "function" ) throw new TypeError("argument to forEach must be function");
    return function ( v ) {
        try {
            f.call(t, v);
        } catch ( e ) {
            if ( e instanceof DiscontinueException ) {
                throw new EndOfLoopException();
            } else if ( e instanceof IgnoreException ) {
                // Do nothing.
            } else if ( e instanceof ReturnListException ) {
                // Do nothing.
            } else {
                throw e;
            }
        }
    };
}


//@export wrap_for_fold
function wrap_for_fold ( t, f, s ) {
    if ( typeof f != "function" ) throw new TypeError("argument to fold must be function");
    return function ( v ) {
        try {
            return s = f.call(t, s, v);
        } catch ( e ) {
            if ( e instanceof DiscontinueException ) {
                throw new EndOfLoopException(e.args[e.args.length-1]);
            } else if ( e instanceof IgnoreException ) {
                return s;
            } else if ( e instanceof ReturnListException ) {
                return s = f.call(t, s, e.args[e.args.length-1]);
            } else {
                throw e;
            }
        }
    };
}


//@export wrap_for_map
function wrap_for_map ( t, f, a ) {
    if ( typeof f != "function" ) throw new TypeError("argument to map must be function");
    if ( typeof a != "function" ) throw new TypeError("the third argument to wrap_for_map must be function");
    return function ( v ) {
        try {
            a.call(null, f.call(t, v));
        } catch ( e ) {
            if ( e instanceof DiscontinueException ) {
                a.apply(null, e.args);
                throw new EndOfLoopException();
            } else if ( e instanceof IgnoreException ) {
                // Do nothing.
            } else if ( e instanceof ReturnListException ) {
                a.apply(null, e.args);
            } else {
                throw e;
            }
        }
    };
}
