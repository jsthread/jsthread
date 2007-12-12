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
//@namespace Concurrent.Thread.Http
//@require   Concurrent.Thread


var createXMLHttpRequest;  // Set up according to environment.
try {
    new XMLHttpRequest();
    createXMLHttpRequest = function ( ) {
        return new XMLHttpRequest();
    };
} catch ( e ) {
    try {
        // MSXML3 or later
        new ActiveXObject("Msxml2.XMLHTTP");
        createXMLHttpRequest = function ( ) {
            return new ActiveXObject("Msxml2.XMLHTTP");
        };
    } catch ( e ) {
        try {
            // MSXML up to 2
            new ActiveXObject("Microsoft.XMLHTTP");
            createXMLHttpRequest = function ( ) {
                return new ActiveXObject("Microsoft.XMLHTTP");
            };
        } catch ( e ) {
            throw new Error(NAMESPACE + ": can't load XMLHttpRequest object");
        }
    }
}



//@export get
function get ( url ) {
	throw new Error();
}

get.$Concurrent_Thread_compiled = function (
    $Concurrent_Thread_this,
    $Concurrent_Thread_arguments,
    $Concurrent_Thread_continuation
) {
    var req = createXMLHttpRequest();
    req.open("GET", $Concurrent_Thread_arguments[0], true);
    var self = Concurrent.Thread.self();
    var loaded    = false;
    var cache_hit = true;
    req.onreadystatechange = function ( ) {
        if ( req.readyState == 4 ) {
            loaded = true;
            if ( !cache_hit ) self.notify();
        }
    };
    req.send(null);  // "send" method occasionally causes "onload" event here.
    cache_hit = false;
    if ( loaded ) {
        return {
            continuation: $Concurrent_Thread_continuation,
            ret_val     : req,
            timeout     : undefined
        };
    } else {
        return {
            timeout     : -1,
            continuation: {
                procedure: function ( ) { },
                this_val : null,
                exception: {
                    procedure: function ( ) {
                        return {
                            continuation: $Concurrent_Thread_continuation,
                            ret_val     : req,
                            timeout     : undefined
                        };
                    },
                    this_val : null,
                    exception: $Concurrent_Thread_continuation.exception
                }
            }
        };
    }
};
