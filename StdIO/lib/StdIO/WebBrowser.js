//@esmodpp 0.10.0
//@version 0.0.0

//@extend    StdIO
//@namespace StdIO

//@require Math.ToInteger
//@with-namespace Math


var el = document.createElement("DIV");
el.style.backgroundColor = "#EEEEEE";
el.style.fontFamily      = "monospace";
el.style.padding         = "0.5em";

setTimeout(function(){
    if ( document.body ) {
        document.body.appendChild(el);
    } else {
        setTimeout(arguments.callee, 1);
    }
}, 0);



Out.write = function ( /* variable args */ ) {
    var str = "";
    for ( var i=0;  i < arguments.length;  i++ ) str += arguments[i];
    el.innerHTML += str.replace(/&/g, "&amp;")
                       .replace(/ /g, "&nbsp;")
                       .replace(/</g, "&lt;")
                       .replace(/>/g, "&gt;")
                       .replace(/\n/g, "<br>");
};


Err = Out;


var buffer = "";
var eos    = false;

In.read = function ( n ) {
    if ( this.atEOS() ) return null;
    n = ToInteger(n);
    while ( !eos && buffer.length < n ) {
        var s = prompt("Input a line or press cancel for end-of-stream.", "");
        if ( s == null ) {
            eos = true;
        } else {
            buffer += s + "\n";
        }
    }
    var r = buffer.substring(0, n);
    buffer = buffer.substring(n);
    return r;
};

In.unread = function ( str ) {
    buffer = str + buffer;
};

In.atEOS = function ( ) {
    return eos && !buffer;
};

