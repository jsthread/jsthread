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
 * Portions created by the Initial Developer are Copyright (C) 2008
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
//@namespace Concurrent.Thread

//@require Concurrent.Thread
//@with-namespace Concurrent

//@require        Data.Error.IllegalStateError
//@with-namespace Data.Error

//@require        Data.LinkedList
//@with-namespace Data



//@export Mutex
function Mutex ( ) {
    this._acquiring = null;
    this._waiting   = new LinkedList();
}

var proto = Mutex.prototype;


proto.isAcquirable = function ( ) {
    return !this._acquiring  &&  this._waiting.isEmpty();
};


proto.acquire = function ( ) {
    throw new Error("can't `acquire' in non-converted function");
};

proto.acquire.$Concurrent_Thread_compiled = function ( $this, $args, $cont ) {
    if ( $this.isAcquirable() ) {
        $this._acquiring = Thread.self();
        return {
            continuation: $cont ,
            ret_val     : void 0,
            timeout     : void 0
        };
    } else {
        $this._waiting.push(Thread.self());
        var callee = arguments.callee;
        return {
            continuation: {
                procedure: null,
                this_val : null,
                exception: {
                    procedure: function( e ){
                        if ( e === releasedException ) {
                            if ( $this._waiting.shift() !== Thread.self() ) {
                                return {
                                    continuation: $cont.exception,
                                    ret_val     : new IllegalStateError("unknown state (maybe bug)"),
                                    timeout     : void 0
                                };
                            }
                            $this._acquiring = Thread.self();
                            return {
                                continuation: $cont,
                                ret_val     : void 0,
                                timeout     : void 0
                            };
                        } else {
                            $this._waiting.head().find(function( it ){
                                return it === Thread.self();
                            }).remove();
                            return {
                                continuation: $cont.exception,
                                ret_val     : e,
                                timeout     : void 0
                            };
                        }
                    },
                    this_val : null,
                    exception: $cont.exception
                }
            },
            ret_val: void 0,
            timeout: -1
        };
    }
};


proto.release = function ( ) {
    if ( !this._acquiring ) {
        throw new IllegalStateError("mutex is not locked");
    }
    if ( this._acquiring !== Thread.self() ) {
        throw new IllegalStateError("mutex can be released only by the thread locking it");
    }
    this._acquiring = null;
    if ( !this._waiting.isEmpty() ) {
        this._waiting.head().value().notify(releasedException);
    }
};


var releasedException = {};
