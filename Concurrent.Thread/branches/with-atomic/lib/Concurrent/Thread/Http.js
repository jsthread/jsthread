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


//@export send
function send ( method, url, body, headers ) {
    throw new Error(NAMESPACE + ".send is unusable in non-compiled function");
}

var LoadedException = {};

send.$Concurrent_Thread_compiled = function ( $this, $args, $cont ) {
    var method=$args[0], url=$args[1], body=$args[2], headers=$args[3];
    if ( !headers || !(headers instanceof Array) ) headers = [];
    var req = createXMLHttpRequest();
    req.open(method, url, true);
    for ( var i=0;  i < headers.length;  i+=2 ) {
        req.setRequestHeader(headers[i], headers[i+1]);
    }
    var self = Concurrent.Thread.self();
    var loaded    = false;
    var cache_hit = true;
    req.onreadystatechange = function ( ) {
        if ( req.readyState == 4 ) {
            loaded = true;
            if ( !cache_hit ) self.notify(LoadedException);
        }
    };
    req.send(body);  // Firefox occasionally causes "onload" event here. Maybe, it occurs in case of cache-hit.
    cache_hit = false;
    if ( loaded ) {
        return {
            continuation: $cont,
            ret_val     : req,
            timeout     : undefined
        };
    } else {
        var ex_handler = {
            procedure: function ( e ) {
                if ( e === LoadedException ) {
                    return {
                        continuation: $cont,
                        ret_val     : req,
                        timeout     : undefined
                    };
                } else {
                    try{ req.abort(); }catch(_){}  // IE less than 7 does not support "abort".
                    return {
                        continuation: $cont.exception,
                        ret_val     : e,
                        timeout     : undefined
                    };
                }
            },
            this_val : null
        };
        ex_handler.exception = ex_handler;  // Cyclic reference assures to abort request.
        return {
            timeout     : -1,
            continuation: {
                procedure: null,
                this_val : null,
                exception: ex_handler
            }
        };
    }
};


//@export get
function get ( url, headers ) {
    throw new Error(NAMESPACE + ".get is unusable in non-compiled function");
}

get.$Concurrent_Thread_compiled = function ($this, $args, $cont) {
    return send.$Concurrent_Thread_compiled(
        null,
        ["GET", $args[0], $args[1], null],
        $cont
    );
}


//@export post
function post ( url, body, headers ) {
    throw new Error(NAMESPACE + ".post is unusable in non-compiled function");
}

post.$Concurrent_Thread_compiled = function ( $this, $args, $cont ) {
    var url=$args[0], body=$args[1], headers=$args[2];
    if ( typeof body == "object" ) {
        var vals = [];
        for ( var i in body ) {
            if ( body.hasOwnProperty(i) ) {
                vals.push( encodeURIComponent(i) + "=" + encodeURIComponent(body[i]) );
            }
        }
        body = vals.join("&");
    }
    if ( !headers || !(headers instanceof Array) ) headers = [];
    var content_type_exists = false;
    for ( var i=0;  i < headers.length;  i+=2 ) {
        if ( String(headers[i]).match(/^Content-type$/i) ) {
            content_type_exists = true;
            break;
        }
    }
    if ( !content_type_exists ) {
        headers = headers.concat("Content-type", "application/x-www-form-urlencoded");
    }
    return send.$Concurrent_Thread_compiled(
        null,
        ["POST", url, body, headers],
        $cont
    );
};
