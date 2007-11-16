//@esmodpp
//@namespace WebBrowser.ScriptExecuter


var executers    = {};
var default_type = "text/javascript";


//@export register
function register ( type, exec ) {
    if ( typeof exec != "function" ) throw new TypeError("function required, but got: " + exec);
    executers[String(type).toLowerCase()] = exec;
}


//@export exec
function exec ( ) {
    var metas = document.getElementsByTagName("META");
    for ( var i=0;  i < metas.length;  i++ ) {
        if ( String(metas[i].httpEquiv).match(/^Content-Script-Type$/i) ) {
            default_type = metas[i].content;
        }
    }
    var scripts = document.getElementsByTagName("SCRIPT");
    for ( var i=0;  i < scripts.length;  i++ ) {
        (function( el ){
            setTimeout(function(){ exec_aux(el); }, 0);
        })(scripts[i]);
    }
}


function exec_aux ( el ) {
    var mime = parseMIMEType(el.type ? el.type : default_type);
    if ( executers[mime.type] ) {
        if ( el.src ) {
            var req = createXHR();
            req.open("GET", el.src, true);
            req.onreadystatechange = function ( ) {
                if ( req.readyState == 4 ) rest(req.responseText);
            };
            req.send(null);
        } else {
            rest(el.innerHTML);
        }
    }
    function rest ( source ) {
        el.parentNode.removeChild(el);
        executers[mime.type](source, mime.attr);
    }
}


function createXHR ( ) {
    try {
        return new XMLHttpRequest();
    } catch (_){
        try {
            return new ActiveXObject("Msxml2.XMLHTTP");
        } catch (_){
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
}


var NOT_TSPECIAL  = '[^][()<>@,;:\\\\"/?=\\x00-\\x20]';
var TOKEN         = "(?:" + NOT_TSPECIAL + "+)";
var MIME_TYPE     = "(?:" + TOKEN + "/" + TOKEN + ")";
var QUOTED_STRING = '(?:"[^"]*(?:\\\\.[^"]*)*")';
var VALUE         = "(?:" + TOKEN + "|" + QUOTED_STRING + ")";

function parseMIMEType ( text ) {
    text = String(text);
    var re = new RegExp("^" + MIME_TYPE, "g");
    re.lastIndex = 0;
    var result = re.exec(text);
    if ( !result ) return {type:text.toLowerCase(), attr:{}};
    var type = result[0].toLowerCase();
    var attr = {};
    text = text.substring(re.lastIndex);
    re = new RegExp("^\\s*;\\s*(" + TOKEN + ")\\s*=\\s*(" + VALUE + ")", "g");
    re.lastIndex = 0;
    while ( result = re.exec(text) ) {
        attr[result[1].toLowerCase()] = result[2];
        text = text.substring(re.lastIndex);
        re.lastIndex = 0;
    }
    return {type:type, attr:attr};
}


if ( window.addEventListener ) {
    window.addEventListener("load", exec, false);
} else if ( window.attachEvent ) {
    window.attachEvent("onload", exec);
} else {
    if ( window.onload ) {
        var temp = window.onload;
        window.onload = function ( ) {
            var r = temp.apply(this, arguments);
            exec();
            return r;
        };
    } else {
        window.onload = exec;
    }
}
